import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { toast } from './use-toast';

export interface RefundablePayment {
  id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  payment_method: string;
  card_last_four: string | null;
  status: string;
  transaction_id: string | null;
  created_at: string;
  booking?: {
    movie_title: string;
    showtime_date: string;
    showtime_time: string;
    seats: string[];
    cinema_name: string;
    screen_name: string | null;
  };
  profile?: {
    email: string;
    full_name: string | null;
  };
}

export function useRefundablePayments() {
  // Subscribe to real-time updates
  useRealtimeSubscription('payments', [['refundable-payments']]);

  return useQuery({
    queryKey: ['refundable-payments'],
    queryFn: async () => {
      // Get all payments that need refund processing
      const { data: payments, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(movie_title, showtime_date, showtime_time, seats, cinema_name, screen_name)
        `)
        .in('status', ['refund_pending', 'refund_processing', 'refunded'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each payment
      const userIds = [...new Set(payments?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, { email: p.email, full_name: p.full_name }]) || []);

      return payments?.map(payment => ({
        ...payment,
        profile: profileMap.get(payment.user_id),
      })) as RefundablePayment[];
    },
  });
}

export function useUpdateRefundStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      paymentId, 
      newStatus,
      sendEmail = true,
      notes
    }: { 
      paymentId: string; 
      newStatus: 'refund_processing' | 'refunded';
      sendEmail?: boolean;
      notes?: string;
    }) => {
      // First get the payment details for the email
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(movie_title, showtime_date, showtime_time, seats)
        `)
        .eq('id', paymentId)
        .single();

      if (fetchError) throw fetchError;

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', payment.user_id)
        .single();

      // Update the payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('id', paymentId);

      if (updateError) throw updateError;

      // Insert history record with notes (trigger handles basic history, we add notes separately)
      if (notes?.trim()) {
        await supabase
          .from('refund_status_history')
          .update({ notes: notes.trim() })
          .eq('payment_id', paymentId)
          .eq('new_status', newStatus)
          .order('created_at', { ascending: false })
          .limit(1);
      }

      // Send email notification if requested
      if (sendEmail && profile?.email) {
        const emailType = newStatus === 'refund_processing' ? 'refund_processing' : 'refund_completed';
        
        try {
          const { error: emailError } = await supabase.functions.invoke('send-refund-email', {
            body: {
              type: emailType,
              bookingId: payment.booking_id,
              userEmail: profile.email,
              userName: profile.full_name,
              movieTitle: payment.booking?.movie_title || 'Movie',
              showDate: payment.booking?.showtime_date || '',
              showTime: payment.booking?.showtime_time || '',
              seats: payment.booking?.seats || [],
              amount: payment.amount,
            },
          });

          if (emailError) {
            console.error('Failed to send email:', emailError);
          }
        } catch (err) {
          console.error('Error invoking email function:', err);
        }
      }

      return { payment, newStatus };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['refundable-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      toast({
        title: "Status Updated",
        description: `Refund status updated to ${variables.newStatus === 'refund_processing' ? 'Processing' : 'Completed'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update refund status",
        variant: "destructive",
      });
      console.error('Update error:', error);
    },
  });
}

export function useBulkUpdateRefundStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      paymentIds, 
      newStatus,
      sendEmails = true,
      notes
    }: { 
      paymentIds: string[]; 
      newStatus: 'refund_processing' | 'refunded';
      sendEmails?: boolean;
      notes?: string;
    }) => {
      const results = [];
      
      for (const paymentId of paymentIds) {
        // Get payment details
        const { data: payment, error: fetchError } = await supabase
          .from('payments')
          .select(`
            *,
            booking:bookings(movie_title, showtime_date, showtime_time, seats)
          `)
          .eq('id', paymentId)
          .single();

        if (fetchError) {
          console.error(`Failed to fetch payment ${paymentId}:`, fetchError);
          continue;
        }

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name')
          .eq('id', payment.user_id)
          .single();

        // Update the payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({ status: newStatus })
          .eq('id', paymentId);

        if (updateError) {
          console.error(`Failed to update payment ${paymentId}:`, updateError);
          continue;
        }

        // Update history with notes if provided
        if (notes?.trim()) {
          await supabase
            .from('refund_status_history')
            .update({ notes: notes.trim() })
            .eq('payment_id', paymentId)
            .eq('new_status', newStatus)
            .order('created_at', { ascending: false })
            .limit(1);
        }

        results.push({ paymentId, success: true });

        // Send email notification if requested
        if (sendEmails && profile?.email) {
          const emailType = newStatus === 'refund_processing' ? 'refund_processing' : 'refund_completed';
          
          try {
            await supabase.functions.invoke('send-refund-email', {
              body: {
                type: emailType,
                bookingId: payment.booking_id,
                userEmail: profile.email,
                userName: profile.full_name,
                movieTitle: payment.booking?.movie_title || 'Movie',
                showDate: payment.booking?.showtime_date || '',
                showTime: payment.booking?.showtime_time || '',
                seats: payment.booking?.seats || [],
                amount: payment.amount,
              },
            });
          } catch (err) {
            console.error('Error sending email:', err);
          }
        }
      }

      return { processed: results.length, total: paymentIds.length };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['refundable-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      
      toast({
        title: "Bulk Update Complete",
        description: `Successfully updated ${data.processed} of ${data.total} refunds to ${variables.newStatus === 'refund_processing' ? 'Processing' : 'Completed'}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process bulk refund update",
        variant: "destructive",
      });
      console.error('Bulk update error:', error);
    },
  });
}
