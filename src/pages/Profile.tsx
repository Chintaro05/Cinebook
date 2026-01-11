import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Calendar, MapPin, Ticket, CreditCard, Receipt, Download, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { profileFormSchema } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Booking {
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
  movie_poster_url?: string;
}

interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  card_last_four: string | null;
  status: string;
  transaction_id: string | null;
  created_at: string;
  booking?: {
    movie_title: string;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'transactions'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfileData({
          name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      }
      setIsLoadingProfile(false);
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Subscribe to real-time updates for bookings
  useRealtimeSubscription('bookings', [['profile-bookings', user?.id || '']]);

  // Fetch bookings with movie poster URLs
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      setIsLoadingBookings(true);
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (bookingsData) {
        // Fetch movie posters for each booking
        const movieIds = [...new Set(bookingsData.map(b => b.movie_id))];
        const { data: moviesData } = await supabase
          .from('movies')
          .select('id, poster_url')
          .in('id', movieIds);

        const moviePosterMap = new Map(moviesData?.map(m => [m.id, m.poster_url]) || []);
        
        const bookingsWithPosters = bookingsData.map(booking => ({
          ...booking,
          movie_poster_url: moviePosterMap.get(booking.movie_id) || undefined
        }));
        
        setBookings(bookingsWithPosters);
      }
      setIsLoadingBookings(false);
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  // Fetch payments when tab changes
  useEffect(() => {
    const fetchPayments = async () => {
      if (!user || activeTab !== 'transactions') return;
      
      setIsLoadingPayments(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(movie_title)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setPayments(data as Payment[]);
      }
      setIsLoadingPayments(false);
    };

    fetchPayments();
  }, [user, activeTab]);

  const handleSave = async () => {
    const result = profileFormSchema.safeParse({
      fullName: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });

    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields.",
        variant: "destructive",
      });
      return;
    }

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profileData.name,
        phone: profileData.phone,
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      return;
    }

    setErrors({});
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const openCancelDialog = (booking: Booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setIsCancelling(true);
    
    // Update booking status to cancelled
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingToCancel.id);

    if (bookingError) {
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
        variant: "destructive",
      });
      setIsCancelling(false);
      return;
    }

    // Update payment status to refund_pending
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .update({ status: 'refund_pending' })
      .eq('booking_id', bookingToCancel.id)
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to update payment status:', paymentError);
    }

    // Send cancellation email notification
    if (profileData.email) {
      try {
        await supabase.functions.invoke('send-refund-email', {
          body: {
            type: 'booking_cancelled',
            bookingId: bookingToCancel.id,
            userEmail: profileData.email,
            userName: profileData.name,
            movieTitle: bookingToCancel.movie_title,
            showDate: bookingToCancel.showtime_date,
            showTime: bookingToCancel.showtime_time,
            seats: bookingToCancel.seats,
            amount: bookingToCancel.total_price,
          },
        });
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
    }

    setBookings(prev => prev.map(b => 
      b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b
    ));

    // Update payments list if loaded
    setPayments(prev => prev.map(p => 
      p.booking_id === bookingToCancel.id ? { ...p, status: 'refund_pending' } : p
    ));

    setIsCancelling(false);
    setCancelDialogOpen(false);
    setBookingToCancel(null);

    toast({
      title: "Booking Cancelled",
      description: "Your booking has been cancelled. You will receive a confirmation email shortly.",
    });
  };

  // Refund status badge component
  const RefundStatusBadge = ({ bookingId, payments }: { bookingId: string; payments: Payment[] }) => {
    const payment = payments.find(p => p.booking_id === bookingId);
    if (!payment) return null;
    
    const statusConfig = {
      refund_pending: { label: 'Refund Pending', icon: Clock, className: 'bg-warning/20 text-warning' },
      refund_processing: { label: 'Processing Refund', icon: Clock, className: 'bg-primary/20 text-primary' },
      refunded: { label: 'Refunded', icon: CheckCircle, className: 'bg-success/20 text-success' },
      completed: { label: 'Refund Available', icon: AlertCircle, className: 'bg-muted text-muted-foreground' },
    };
    
    const config = statusConfig[payment.status as keyof typeof statusConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    
    return (
      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1", config.className)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const handleDownloadReceipt = (transactionId: string) => {
    toast({
      title: "Downloading Receipt",
      description: `Receipt for transaction ${transactionId} is being downloaded.`,
    });
  };

  if (authLoading || isLoadingProfile) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!user) return null;

  const completedPayments = payments.filter(p => p.status === 'completed');
  const refundedPayments = payments.filter(p => p.status === 'refunded');
  const pendingRefunds = payments.filter(p => p.status === 'refund_pending' || p.status === 'refund_processing');

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Account</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className={cn(
                "pb-4 px-2 font-medium transition-all relative whitespace-nowrap",
                activeTab === 'profile'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="w-4 h-4 inline mr-2" />
              Profile
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={cn(
                "pb-4 px-2 font-medium transition-all relative whitespace-nowrap",
                activeTab === 'bookings'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Ticket className="w-4 h-4 inline mr-2" />
              Booking History
              {activeTab === 'bookings' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                "pb-4 px-2 font-medium transition-all relative whitespace-nowrap",
                activeTab === 'transactions'
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CreditCard className="w-4 h-4 inline mr-2" />
              Payment History
              {activeTab === 'transactions' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <Card className="p-6 bg-card border-border">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
                  <Button
                    variant={isEditing ? "outline" : "cinema-outline"}
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={profileData.name}
                        onChange={(e) => {
                          setProfileData({ ...profileData, name: e.target.value });
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", errors.fullName && "border-destructive")}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={profileData.email}
                        disabled
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => {
                          setProfileData({ ...profileData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: '' });
                        }}
                        disabled={!isEditing}
                        className={cn("pl-10", errors.phone && "border-destructive")}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {isEditing && (
                    <Button variant="cinema" onClick={handleSave} className="mt-4">
                      Save Changes
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h2 className="text-xl font-semibold text-foreground mb-6">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" className="pl-10" />
                    </div>
                  </div>
                  <Button variant="cinema">Update Password</Button>
                </div>
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-4 animate-fade-in">
              {isLoadingBookings ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : bookings.length === 0 ? (
                <Card className="p-12 bg-card border-border text-center">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your cinema journey by booking your first movie!
                  </p>
                  <Button variant="cinema" onClick={() => navigate('/')}>Browse Movies</Button>
                </Card>
              ) : (
                bookings.map((booking) => (
                  <Card key={booking.id} className="p-6 bg-card border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-28 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                          {booking.movie_poster_url ? (
                            <img
                              src={booking.movie_poster_url}
                              alt={booking.movie_title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <Ticket className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{booking.movie_title}</h3>
                          <div className="space-y-1 text-sm text-muted-foreground mt-2">
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {booking.cinema_name}
                            </p>
                            <p className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {booking.showtime_date} • {booking.showtime_time}
                            </p>
                            <p className="flex items-center gap-2">
                              <Ticket className="w-4 h-4" />
                              Seats: {booking.seats.join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex flex-col items-end gap-1">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium",
                            booking.status === 'confirmed' && "bg-success/20 text-success",
                            booking.status === 'cancelled' && "bg-destructive/20 text-destructive",
                            booking.status === 'pending' && "bg-warning/20 text-warning"
                          )}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </span>
                          {booking.status === 'cancelled' && (
                            <RefundStatusBadge bookingId={booking.id} payments={payments} />
                          )}
                        </div>
                        <span className="text-lg font-bold text-foreground">
                          ${Number(booking.total_price).toFixed(2)}
                        </span>
                        <div className="flex gap-2">
                          <Button variant="cinema-outline" size="sm">
                            View E-Ticket
                          </Button>
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => openCancelDialog(booking)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
            <div className="space-y-4 animate-fade-in">
              {isLoadingPayments ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : payments.length === 0 ? (
                <Card className="p-12 bg-card border-border text-center">
                  <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Transactions Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Your payment history will appear here after you make a booking.
                  </p>
                </Card>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card className="p-4 bg-card border-border">
                      <p className="text-sm text-muted-foreground">Total Spent</p>
                      <p className="text-2xl font-bold text-foreground">
                        ${completedPayments.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
                      </p>
                    </Card>
                    <Card className="p-4 bg-card border-border">
                      <p className="text-sm text-muted-foreground">Transactions</p>
                      <p className="text-2xl font-bold text-foreground">{payments.length}</p>
                    </Card>
                    <Card className="p-4 bg-card border-border">
                      <p className="text-sm text-muted-foreground">Pending Refunds</p>
                      <p className="text-2xl font-bold text-warning">
                        ${pendingRefunds.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
                      </p>
                    </Card>
                    <Card className="p-4 bg-card border-border">
                      <p className="text-sm text-muted-foreground">Refunded</p>
                      <p className="text-2xl font-bold text-success">
                        ${refundedPayments.reduce((sum, t) => sum + Number(t.amount), 0).toFixed(2)}
                      </p>
                    </Card>
                  </div>

                  {/* Transaction List */}
                  {payments.map((payment) => (
                    <Card key={payment.id} className="p-4 bg-card border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">
                              {payment.booking?.movie_title || 'Movie Ticket'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {payment.payment_method}{payment.card_last_four ? ` ****${payment.card_last_four}` : ''} • {new Date(payment.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${Number(payment.amount).toFixed(2)}
                            </p>
                            <span className={cn(
                              "text-xs font-medium flex items-center justify-end gap-1",
                              payment.status === 'completed' && "text-success",
                              payment.status === 'pending' && "text-warning",
                              payment.status === 'refunded' && "text-muted-foreground",
                              payment.status === 'refund_pending' && "text-warning",
                              payment.status === 'refund_processing' && "text-primary"
                            )}>
                              {payment.status === 'refund_pending' && <Clock className="w-3 h-3" />}
                              {payment.status === 'refund_processing' && <Clock className="w-3 h-3" />}
                              {payment.status === 'refunded' && <CheckCircle className="w-3 h-3" />}
                              {payment.status === 'refund_pending' ? 'Refund Pending' :
                               payment.status === 'refund_processing' ? 'Processing Refund' :
                               payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadReceipt(payment.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your booking for <strong>{bookingToCancel?.movie_title}</strong>?
              <br /><br />
              <span className="text-muted-foreground">
                • Your seats will be released and available for others to book
                <br />
                • A refund of <strong>${bookingToCancel?.total_price.toFixed(2)}</strong> will be processed within 3-5 business days
                <br />
                • This action cannot be undone
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CustomerLayout>
  );
};

export default Profile;