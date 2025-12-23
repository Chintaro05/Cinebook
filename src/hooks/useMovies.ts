import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Movie {
  id: string;
  title: string;
  synopsis: string | null;
  director: string | null;
  cast_members: string[] | null;
  genre: string[] | null;
  duration: number;
  rating: string | null;
  poster_url: string | null;
  trailer_url: string | null;
  release_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface MovieInput {
  title: string;
  synopsis?: string;
  director?: string;
  cast_members?: string[];
  genre?: string[];
  duration: number;
  rating?: string;
  poster_url?: string;
  trailer_url?: string;
  release_date?: string;
  status?: string;
}

export function useMovies() {
  return useQuery({
    queryKey: ['movies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Movie[];
    },
  });
}

export function useMovie(id: string | undefined) {
  return useQuery({
    queryKey: ['movie', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Movie | null;
    },
    enabled: !!id,
  });
}

export function useCreateMovie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (movie: MovieInput) => {
      const { data, error } = await supabase
        .from('movies')
        .insert(movie)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast({ title: 'Success', description: 'Movie added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMovie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...movie }: MovieInput & { id: string }) => {
      const { data, error } = await supabase
        .from('movies')
        .update(movie)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast({ title: 'Success', description: 'Movie updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteMovie() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      toast({ title: 'Success', description: 'Movie deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
