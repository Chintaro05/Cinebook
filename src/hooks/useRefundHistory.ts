import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface RefundStatusChange {
  id: string;
  payment_id: string;
  old_status: string | null;
  new_status: string;
  changed_by: string | null;
  notes: string | null;
  created_at: string;
}

export function useRefundHistory(paymentId: string | null) {
  return useQuery({
    queryKey: ['refund-history', paymentId],
    queryFn: async () => {
      if (!paymentId) return [];
      
      const { data, error } = await supabase
        .from('refund_status_history')
        .select('*')
        .eq('payment_id', paymentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as RefundStatusChange[];
    },
    enabled: !!paymentId,
  });
}

export function useRefundHistoryRealtime(paymentId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!paymentId) return;

    const channel = supabase
      .channel(`refund-history-${paymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'refund_status_history',
          filter: `payment_id=eq.${paymentId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [paymentId, onUpdate]);
}
