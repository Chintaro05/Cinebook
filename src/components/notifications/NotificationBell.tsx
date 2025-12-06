import { useState } from 'react';
import { Bell, X, Check, Ticket, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'reminder' | 'promo' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your booking for "Inception" on Dec 20 at 7:15 PM has been confirmed.',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Upcoming Show',
    message: 'Reminder: "The Dark Knight" starts in 2 hours at Cinema Plaza.',
    timestamp: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'promo',
    title: 'Special Offer!',
    message: 'Get 20% off on all bookings this weekend. Use code: WEEKEND20',
    timestamp: '2 days ago',
    read: true,
  },
  {
    id: '4',
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: 'Your booking for "Dune" has been cancelled. Refund will be processed in 3-5 days.',
    timestamp: '3 days ago',
    read: true,
  },
];

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <Check className="w-4 h-4 text-success" />;
      case 'booking_cancelled':
        return <X className="w-4 h-4 text-destructive" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-warning" />;
      case 'promo':
        return <Ticket className="w-4 h-4 text-primary" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />
          
          {/* Dropdown */}
          <Card className="absolute right-0 top-12 w-80 md:w-96 max-h-[70vh] overflow-hidden bg-card border-border shadow-xl z-50 animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="text-xs text-primary hover:text-primary"
                >
                  Mark all as read
                </Button>
              )}
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto max-h-[50vh]">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn(
                            "text-sm",
                            !notification.read ? "font-semibold text-foreground" : "text-muted-foreground"
                          )}>
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-2">
                          {notification.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-border">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-primary hover:text-primary"
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}