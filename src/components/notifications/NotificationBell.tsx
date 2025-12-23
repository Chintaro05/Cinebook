import { useState, useEffect } from 'react';
import { Bell, X, Check, Ticket, Calendar, Info, MapPin, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useRecentBookings, Booking } from '@/hooks/useBookings';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface Notification {
  id: string;
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_pending';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  booking?: Booking;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('readNotifications');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });

  const { user } = useAuth();
  const { data: bookings = [], isLoading } = useRecentBookings(10);

  // Convert bookings to notifications
  const notifications: Notification[] = bookings.map((booking) => {
    const type = booking.status === 'confirmed' 
      ? 'booking_confirmed' 
      : booking.status === 'cancelled' 
        ? 'booking_cancelled' 
        : 'booking_pending';
    
    const statusText = booking.status === 'confirmed' 
      ? 'Booking Confirmed' 
      : booking.status === 'cancelled' 
        ? 'Booking Cancelled' 
        : 'Booking Pending';

    const showDate = format(parseISO(booking.showtime_date), 'MMM d');
    const showTime = booking.showtime_time.slice(0, 5);

    return {
      id: booking.id,
      type,
      title: statusText,
      message: `Your booking for "${booking.movie_title}" on ${showDate} at ${showTime} has been ${booking.status}.`,
      timestamp: formatDistanceToNow(parseISO(booking.created_at), { addSuffix: true }),
      read: readNotifications.has(booking.id),
      booking,
    };
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Save read notifications to localStorage
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify([...readNotifications]));
  }, [readNotifications]);

  const markAsRead = (id: string) => {
    setReadNotifications(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };

  const handleShowDetails = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.booking) {
      setSelectedBooking(notification.booking);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <Check className="w-4 h-4 text-success" />;
      case 'booking_cancelled':
        return <X className="w-4 h-4 text-destructive" />;
      case 'booking_pending':
        return <Clock className="w-4 h-4 text-warning" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-warning/10 text-warning';
    }
  };

  if (!user) {
    return (
      <Button variant="ghost" size="icon" onClick={() => window.location.href = '/login'}>
        <Bell className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <>
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
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-muted-foreground">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No bookings yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Book a movie to see notifications here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border-b border-border/50 hover:bg-secondary/50 transition-colors cursor-pointer",
                        !notification.read && "bg-primary/5"
                      )}
                      onClick={() => handleShowDetails(notification)}
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
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShowDetails(notification);
                              }}
                            >
                              <Info className="w-4 h-4" />
                            </Button>
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
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/profile';
                    }}
                  >
                    View All Bookings
                  </Button>
                </div>
              )}
            </Card>
          </>
        )}
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-primary" />
              Booking Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              {/* Movie Title */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="text-lg font-bold text-foreground">{selectedBooking.movie_title}</h3>
                <span className={cn(
                  "inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full capitalize",
                  getStatusColor(selectedBooking.status)
                )}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid gap-3">
                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Cinema & Screen</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBooking.cinema_name}
                      {selectedBooking.screen_name && ` - ${selectedBooking.screen_name}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Date & Time</p>
                    <p className="text-sm font-medium text-foreground">
                      {format(parseISO(selectedBooking.showtime_date), 'EEEE, MMMM d, yyyy')} at {selectedBooking.showtime_time.slice(0, 5)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
                  <Ticket className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Seats</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedBooking.seats.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-4 h-4 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-bold text-primary">
                      ${Number(selectedBooking.total_price).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking ID */}
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  Booking ID: <span className="font-mono">{selectedBooking.id.slice(0, 8).toUpperCase()}</span>
                </p>
                <p className="text-xs text-muted-foreground/70 text-center mt-1">
                  Booked {formatDistanceToNow(parseISO(selectedBooking.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
