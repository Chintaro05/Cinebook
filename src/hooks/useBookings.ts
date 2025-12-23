import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface Booking {
  id: string;
  movie_id: string;
  movie_title: string;
  cinema_name: string;
  screen_name: string | null;
  showtime_date: string;
  showtime_time: string;
  seats: string[];
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useUserBookings() {
  const { user } = useAuth();

  // Subscribe to real-time updates for bookings
  useRealtimeSubscription('bookings', [['user-bookings', user?.id || ''], ['recent-bookings', user?.id || ''], ['booked-seats']]);

  return useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id,
  });
}

export function useRecentBookings(limit = 5) {
  const { user } = useAuth();

  // Subscribe to real-time updates for bookings
  useRealtimeSubscription('bookings', [['user-bookings', user?.id || ''], ['recent-bookings', user?.id || '', String(limit)]]);

  return useQuery({
    queryKey: ['recent-bookings', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Booking[];
    },
    enabled: !!user?.id,
  });
}
