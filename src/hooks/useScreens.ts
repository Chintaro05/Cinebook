import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export interface Screen {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  seats_per_row: number;
  vip_rows: number[] | null;
  created_at: string;
  updated_at: string;
}

export interface ScreenInput {
  name: string;
  capacity: number;
  rows: number;
  seats_per_row: number;
  vip_rows?: number[];
}

export function useScreens() {
  // Subscribe to real-time updates for screens
  useRealtimeSubscription('screens', [['screens']]);
  
  return useQuery({
    queryKey: ['screens'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Screen[];
    },
  });
}

export function useCreateScreen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (screen: ScreenInput) => {
      const { data, error } = await supabase
        .from('screens')
        .insert(screen)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens'] });
      toast({ title: 'Success', description: 'Screen added successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateScreen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...screen }: ScreenInput & { id: string }) => {
      const { data, error } = await supabase
        .from('screens')
        .update(screen)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens'] });
      toast({ title: 'Success', description: 'Screen updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteScreen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('screens')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['screens'] });
      toast({ title: 'Success', description: 'Screen deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
