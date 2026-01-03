import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export interface AdminNotification {
  id: string;
  type: 'booking' | 'movie' | 'user' | 'payment' | 'showtime';
  message: string;
  timestamp: Date;
  read: boolean;
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const queryClient = useQueryClient();

  const addNotification = (type: AdminNotification['type'], message: string) => {
    const newNotification: AdminNotification = {
      id: crypto.randomUUID(),
      type,
      message,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 20));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    // Listen for booking changes
    const bookingsChannel = supabase
      .channel('admin-bookings-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          addNotification('booking', `New booking: ${(payload.new as any).movie_title}`);
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    // Listen for movie changes
    const moviesChannel = supabase
      .channel('admin-movies-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'movies' },
        (payload) => {
          const action = payload.eventType === 'INSERT' ? 'added' : 
                        payload.eventType === 'UPDATE' ? 'updated' : 'deleted';
          const title = (payload.new as any)?.title || (payload.old as any)?.title || 'Unknown';
          addNotification('movie', `Movie ${action}: ${title}`);
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    // Listen for user role changes
    const rolesChannel = supabase
      .channel('admin-roles-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_roles' },
        (payload) => {
          addNotification('user', `User role updated to ${(payload.new as any)?.role || 'unknown'}`);
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    // Listen for payment changes
    const paymentsChannel = supabase
      .channel('admin-payments-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'payments' },
        (payload) => {
          addNotification('payment', `Payment received: $${(payload.new as any)?.amount}`);
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    // Listen for showtime changes
    const showtimesChannel = supabase
      .channel('admin-showtimes-notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'showtimes' },
        (payload) => {
          const action = payload.eventType === 'INSERT' ? 'added' : 
                        payload.eventType === 'UPDATE' ? 'updated' : 'deleted';
          addNotification('showtime', `Showtime ${action}`);
          queryClient.invalidateQueries({ queryKey: ['dashboard-data'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(moviesChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(showtimesChannel);
    };
  }, [queryClient]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
