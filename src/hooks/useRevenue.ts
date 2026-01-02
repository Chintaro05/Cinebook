import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { subDays, format, startOfDay, parseISO } from 'date-fns';

export interface RevenueStats {
  totalRevenue: number;
  ticketsSold: number;
  avgTicketPrice: number;
  topMovie: { title: string; revenue: number } | null;
}

export interface RevenueByMovie {
  movie: string;
  revenue: number;
  tickets: number;
  percentage: number;
}

export interface DailyRevenue {
  day: string;
  date: string;
  revenue: number;
}

export interface Transaction {
  id: string;
  transaction_id: string | null;
  movie_title: string;
  customer_name: string | null;
  tickets: number;
  amount: number;
  date: string;
}

export function useRevenueData(days: number = 30) {
  // Subscribe to real-time updates
  useRealtimeSubscription('payments', [['revenue-payments']]);
  useRealtimeSubscription('bookings', [['revenue-bookings']]);

  return useQuery({
    queryKey: ['revenue-data', days],
    queryFn: async () => {
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

      // Fetch payments with booking info
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(movie_title, seats, showtime_date)
        `)
        .eq('status', 'completed')
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch profiles for customer names
      const userIds = [...new Set(payments?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Calculate stats
      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const ticketsSold = payments?.reduce((sum, p) => sum + (p.booking?.seats?.length || 0), 0) || 0;
      const avgTicketPrice = ticketsSold > 0 ? totalRevenue / ticketsSold : 0;

      // Revenue by movie
      const movieRevenue: Record<string, { revenue: number; tickets: number }> = {};
      payments?.forEach(p => {
        const movieTitle = p.booking?.movie_title || 'Unknown';
        if (!movieRevenue[movieTitle]) {
          movieRevenue[movieTitle] = { revenue: 0, tickets: 0 };
        }
        movieRevenue[movieTitle].revenue += Number(p.amount);
        movieRevenue[movieTitle].tickets += p.booking?.seats?.length || 0;
      });

      const revenueByMovie: RevenueByMovie[] = Object.entries(movieRevenue)
        .map(([movie, data]) => ({ movie, ...data, percentage: 0 }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const maxRevenue = revenueByMovie[0]?.revenue || 1;
      revenueByMovie.forEach(item => {
        item.percentage = Math.round((item.revenue / maxRevenue) * 100);
      });

      const topMovie = revenueByMovie[0] 
        ? { title: revenueByMovie[0].movie, revenue: revenueByMovie[0].revenue }
        : null;

      // Daily revenue for the last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          day: format(date, 'EEE'),
          date: format(date, 'yyyy-MM-dd'),
          revenue: 0,
        };
      });

      payments?.forEach(p => {
        const paymentDate = format(parseISO(p.created_at), 'yyyy-MM-dd');
        const dayEntry = last7Days.find(d => d.date === paymentDate);
        if (dayEntry) {
          dayEntry.revenue += Number(p.amount);
        }
      });

      // Recent transactions
      const transactions: Transaction[] = (payments || []).slice(0, 10).map(p => ({
        id: p.id,
        transaction_id: p.transaction_id,
        movie_title: p.booking?.movie_title || 'Unknown',
        customer_name: profileMap.get(p.user_id) || 'Unknown',
        tickets: p.booking?.seats?.length || 0,
        amount: Number(p.amount),
        date: format(parseISO(p.created_at), 'MMM dd, yyyy'),
      }));

      const stats: RevenueStats = {
        totalRevenue,
        ticketsSold,
        avgTicketPrice,
        topMovie,
      };

      return {
        stats,
        revenueByMovie,
        dailyRevenue: last7Days,
        transactions,
      };
    },
  });
}
