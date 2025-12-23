import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Showtime {
  id: string;
  movie_id: string;
  screen_id: string;
  show_date: string;
  show_time: string;
  price: number;
  created_at: string;
  updated_at: string;
  movie?: {
    id: string;
    title: string;
    poster_url: string | null;
    duration: number;
  };
  screen?: {
    id: string;
    name: string;
  };
}

export interface ShowtimeInput {
  movie_id: string;
  screen_id: string;
  show_date: string;
  show_time: string;
  price: number;
}

export function useShowtimes(date?: string) {
  return useQuery({
    queryKey: ['showtimes', date],
    queryFn: async () => {
      let query = supabase
        .from('showtimes')
        .select(`
          *,
          movie:movies(id, title, poster_url, duration),
          screen:screens(id, name)
        `)
        .order('show_date', { ascending: true })
        .order('show_time', { ascending: true });
      
      if (date) {
        query = query.eq('show_date', date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Showtime[];
    },
  });
}

export function useShowtimeById(id: string | undefined) {
  return useQuery({
    queryKey: ['showtime', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('showtimes')
        .select(`
          *,
          movie:movies(id, title, poster_url, duration, rating),
          screen:screens(id, name, rows, seats_per_row, vip_rows, capacity)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useShowtimesByMovie(movieId: string | undefined, date?: string) {
  return useQuery({
    queryKey: ['showtimes-by-movie', movieId, date],
    queryFn: async () => {
      if (!movieId) return [];
      
      let query = supabase
        .from('showtimes')
        .select(`
          *,
          screen:screens(id, name)
        `)
        .eq('movie_id', movieId)
        .order('show_date', { ascending: true })
        .order('show_time', { ascending: true });
      
      if (date) {
        query = query.eq('show_date', date);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: !!movieId,
  });
}

export function useBookedSeats(showtimeId: string | undefined, showtimeDate: string, showtimeTime: string) {
  return useQuery({
    queryKey: ['booked-seats', showtimeId, showtimeDate, showtimeTime],
    queryFn: async () => {
      if (!showtimeId) return [];
      
      const { data, error } = await supabase
        .from('bookings')
        .select('seats')
        .eq('showtime_date', showtimeDate)
        .eq('showtime_time', showtimeTime)
        .in('status', ['pending', 'confirmed']);
      
      if (error) throw error;
      
      // Flatten all booked seats into a single array
      const bookedSeats = data?.flatMap(booking => booking.seats) || [];
      return bookedSeats;
    },
    enabled: !!showtimeId && !!showtimeDate && !!showtimeTime,
  });
}

export function useCreateShowtime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (showtime: ShowtimeInput) => {
      const { data, error } = await supabase
        .from('showtimes')
        .insert(showtime)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showtimes'] });
      toast({ title: 'Success', description: 'Showtime added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateShowtime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...showtime }: ShowtimeInput & { id: string }) => {
      const { data, error } = await supabase
        .from('showtimes')
        .update(showtime)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showtimes'] });
      toast({ title: 'Success', description: 'Showtime updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteShowtime() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('showtimes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showtimes'] });
      toast({ title: 'Success', description: 'Showtime deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
