import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Wallet, Lock, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { paymentFormSchema } from '@/lib/validation';
import { supabase } from '@/integrations/supabase/client';
import { useShowtimeById } from '@/hooks/useShowtimes';
import { format } from 'date-fns';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  
  const showtimeId = searchParams.get('showtime') || '';
  const seatsParam = searchParams.get('seats') || '';
  const seats = seatsParam.split(',').filter(Boolean);

  const { data: showtime, isLoading: isLoadingShowtime } = useShowtimeById(showtimeId);

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const movie = showtime?.movie;
  const screen = showtime?.screen;
  const pricePerSeat = showtime?.price || 15.00;
  const subtotal = seats.length * Number(pricePerSeat);
  const serviceFee = 2.50;
  const total = subtotal + serviceFee;

  const isLoading = isAuthLoading || isLoadingShowtime;

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      navigate('/login', { state: { returnTo: `/payment${window.location.search}` } });
    }
  }, [user, isAuthLoading, navigate]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (!showtime || !movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Booking not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const formattedDate = format(new Date(showtime.show_date), 'EEE, MMM d, yyyy');
  const formattedTime = showtime.show_time.slice(0, 5);

  const validateCardForm = (): boolean => {
    const result = paymentFormSchema.safeParse({
      cardNumber,
      expiry,
      cvv,
      cardName,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handlePayment = async () => {
    if (paymentMethod === 'card') {
      if (!validateCardForm()) {
        toast({
          title: "Validation Error",
          description: "Please correct the errors in your card details.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      // Create booking in database
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          cinema_name: 'CineBook Cinema',
          screen_name: screen?.name || 'Screen 1',
          showtime_date: showtime.show_date,
          showtime_time: showtime.show_time,
          seats: seats,
          total_price: total,
          status: 'confirmed',
        })
        .select()
        .single();

      if (bookingError) {
        throw bookingError;
      }

      // Create payment record
      const cardLastFour = paymentMethod === 'card' ? cardNumber.replace(/\s/g, '').slice(-4) : null;
      const transactionId = `TXN${Date.now()}`;

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          booking_id: bookingData.id,
          amount: total,
          payment_method: paymentMethod === 'card' ? 'Credit Card' : 'E-Wallet',
          card_last_four: cardLastFour,
          status: 'completed',
          transaction_id: transactionId,
        });

      if (paymentError) {
        throw paymentError;
      }

      toast({
        title: "Payment Successful!",
        description: "Your tickets have been booked. Check your email for confirmation.",
      });

      navigate('/booking-confirmed', { 
        state: { 
          movie: {
            title: movie.title,
            posterUrl: movie.poster_url,
            rating: movie.rating,
          }, 
          cinema: { name: 'CineBook Cinema' }, 
          date: formattedDate, 
          time: formattedTime, 
          seats, 
          total,
          screenName: screen?.name,
        } 
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ').substring(0, 19) : '';
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Secure Payment</h1>
              <p className="text-muted-foreground">Complete your booking</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-3 space-y-6">
              {/* Payment Method Selection */}
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                      paymentMethod === 'card'
                        ? "bg-primary/10 border-primary/50"
                        : "bg-secondary border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      paymentMethod === 'card' ? "bg-primary" : "bg-muted"
                    )}>
                      <CreditCard className={cn(
                        "w-5 h-5",
                        paymentMethod === 'card' ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Credit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('wallet')}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border transition-all duration-200",
                      paymentMethod === 'wallet'
                        ? "bg-primary/10 border-primary/50"
                        : "bg-secondary border-border hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      paymentMethod === 'wallet' ? "bg-primary" : "bg-muted"
                    )}>
                      <Wallet className={cn(
                        "w-5 h-5",
                        paymentMethod === 'wallet' ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">E-Wallet</p>
                      <p className="text-xs text-muted-foreground">PayPal, Apple Pay</p>
                    </div>
                  </button>
                </div>
              </Card>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <Card className="p-6 bg-card border-border animate-fade-in">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Card Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Cardholder Name
                      </label>
                      <Input
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className={errors.cardName ? "border-destructive" : ""}
                      />
                      {errors.cardName && (
                        <p className="text-sm text-destructive mt-1">{errors.cardName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-2">
                        Card Number
                      </label>
                      <Input
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className={errors.cardNumber ? "border-destructive" : ""}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          Expiry Date
                        </label>
                        <Input
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiryDate(e.target.value))}
                          maxLength={5}
                          className={errors.expiry ? "border-destructive" : ""}
                        />
                        {errors.expiry && (
                          <p className="text-sm text-destructive mt-1">{errors.expiry}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-2">
                          CVV
                        </label>
                        <Input
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                          maxLength={4}
                          className={errors.cvv ? "border-destructive" : ""}
                        />
                        {errors.cvv && (
                          <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {paymentMethod === 'wallet' && (
                <Card className="p-6 bg-card border-border animate-fade-in">
                  <h3 className="text-lg font-semibold text-foreground mb-4">E-Wallet</h3>
                  <p className="text-muted-foreground">
                    You will be redirected to your e-wallet provider to complete the payment.
                  </p>
                </Card>
              )}

              {/* Security Notice */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                <Lock className="w-5 h-5 text-success" />
                <p className="text-sm text-muted-foreground">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <Card className="sticky top-24 p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
                
                <div className="flex gap-4 mb-6">
                  {movie.poster_url && (
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="w-20 h-28 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.rating}</p>
                    <p className="text-sm text-muted-foreground mt-2">{screen?.name}</p>
                    <p className="text-sm text-muted-foreground">{formattedDate} • {formattedTime}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="text-foreground">{seats.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{seats.length}x Tickets</span>
                    <span className="text-foreground">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-foreground">${serviceFee.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Button
                  variant="cinema"
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Confirm & Pay ${total.toFixed(2)}
                    </>
                  )}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Payment;