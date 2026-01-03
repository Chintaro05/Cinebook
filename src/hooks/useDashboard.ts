import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { format, startOfDay, endOfDay, subDays, parseISO } from 'date-fns';

export interface DashboardStats {
  todayRevenue: number;
  todayRevenueChange: number;
  activeMovies: number;
  movieChange: number;
  ticketsSoldToday: number;
  ticketsChange: number;
  activeUsers: number;
  usersChange: number;
}

export interface RecentBooking {
  id: string;
  movie_title: string;
  customer_name: string | null;
  seats: string[];
  amount: number;
  created_at: string;
}

export interface TodayShowtime {
  id: string;
  show_time: string;
  movie_title: string;
  screen_name: string;
  booked_seats: number;
  total_capacity: number;
}

export function useDashboardData() {
  // Subscribe to real-time updates
  useRealtimeSubscription('payments', [['dashboard-data']]);
  useRealtimeSubscription('bookings', [['dashboard-data']]);
  useRealtimeSubscription('movies', [['dashboard-data']]);
  useRealtimeSubscription('profiles', [['dashboard-data']]);
  useRealtimeSubscription('showtimes', [['dashboard-data']]);

  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const today = new Date();
      const todayStart = format(startOfDay(today), 'yyyy-MM-dd');
      const todayEnd = format(endOfDay(today), "yyyy-MM-dd'T'23:59:59");
      const yesterdayStart = format(startOfDay(subDays(today, 1)), 'yyyy-MM-dd');
      const yesterdayEnd = format(endOfDay(subDays(today, 1)), "yyyy-MM-dd'T'23:59:59");

      // Fetch today's payments
      const { data: todayPayments } = await supabase
        .from('payments')
        .select('amount, booking:bookings(seats)')
        .eq('status', 'completed')
        .gte('created_at', todayStart)
        .lte('created_at', todayEnd);

      // Fetch yesterday's payments for comparison
      const { data: yesterdayPayments } = await supabase
        .from('payments')
        .select('amount, booking:bookings(seats)')
        .eq('status', 'completed')
        .gte('created_at', yesterdayStart)
        .lte('created_at', yesterdayEnd);

      // Calculate today's revenue
      const todayRevenue = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const yesterdayRevenue = yesterdayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
      const todayRevenueChange = yesterdayRevenue > 0 
        ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100) 
        : todayRevenue > 0 ? 100 : 0;

      // Calculate tickets sold today
      const ticketsSoldToday = todayPayments?.reduce((sum, p) => sum + ((p.booking as any)?.seats?.length || 0), 0) || 0;
      const ticketsSoldYesterday = yesterdayPayments?.reduce((sum, p) => sum + ((p.booking as any)?.seats?.length || 0), 0) || 0;
      const ticketsChange = ticketsSoldYesterday > 0 
        ? Math.round(((ticketsSoldToday - ticketsSoldYesterday) / ticketsSoldYesterday) * 100)
        : ticketsSoldToday > 0 ? 100 : 0;

      // Fetch active movies count
      const { count: activeMovies } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'now_showing');

      // Fetch active users count (profiles count)
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch recent bookings with customer info
      const { data: recentBookingsData } = await supabase
        .from('bookings')
        .select('id, movie_title, seats, total_price, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get customer names for recent bookings
      const userIds = [...new Set(recentBookingsData?.map(b => b.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      const recentBookings: RecentBooking[] = (recentBookingsData || []).map(b => ({
        id: b.id.slice(0, 8).toUpperCase(),
        movie_title: b.movie_title,
        customer_name: profileMap.get(b.user_id) || 'Unknown',
        seats: b.seats,
        amount: b.total_price,
        created_at: b.created_at,
      }));

      // Fetch today's showtimes with movie and screen info
      const { data: showtimesData } = await supabase
        .from('showtimes')
        .select(`
          id,
          show_time,
          movie:movies(title),
          screen:screens(name, capacity)
        `)
        .eq('show_date', todayStart)
        .order('show_time');

      // Count booked seats for each showtime
      const todayShowtimes: TodayShowtime[] = await Promise.all(
        (showtimesData || []).slice(0, 4).map(async (st) => {
          const { data: bookings } = await supabase
            .from('bookings')
            .select('seats')
            .eq('showtime_date', todayStart)
            .eq('showtime_time', st.show_time)
            .eq('status', 'confirmed');

          const bookedSeats = bookings?.reduce((sum, b) => sum + (b.seats?.length || 0), 0) || 0;

          return {
            id: st.id,
            show_time: st.show_time,
            movie_title: (st.movie as any)?.title || 'Unknown',
            screen_name: (st.screen as any)?.name || 'Unknown',
            booked_seats: bookedSeats,
            total_capacity: (st.screen as any)?.capacity || 100,
          };
        })
      );

      const stats: DashboardStats = {
        todayRevenue,
        todayRevenueChange,
        activeMovies: activeMovies || 0,
        movieChange: 0, // Could calculate based on last week
        ticketsSoldToday,
        ticketsChange,
        activeUsers: activeUsers || 0,
        usersChange: 0,
      };

      return {
        stats,
        recentBookings,
        todayShowtimes,
      };
    },
  });
}
