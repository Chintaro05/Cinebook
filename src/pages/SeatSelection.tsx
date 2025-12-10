import { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMovies } from '@/hooks/useMovies';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface ScreenData {
  id: string;
  name: string;
  rows: number;
  seats_per_row: number;
  vip_rows: number[];
}

const SeatSelection = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { data: movies, isLoading: moviesLoading } = useMovies();
  const movie = movies?.find(m => m.id === id);
  
  const showtimeId = searchParams.get('showtime') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const screenName = searchParams.get('screen') || '';
  const pricePerSeat = parseFloat(searchParams.get('price') || '15');

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [screenData, setScreenData] = useState<ScreenData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch screen data and booked seats
  useEffect(() => {
    const fetchData = async () => {
      if (!showtimeId) {
        setLoading(false);
        return;
      }

      try {
        // First get the showtime to find the screen
        const { data: showtime, error: showtimeError } = await supabase
          .from('showtimes')
          .select('screen_id')
          .eq('id', showtimeId)
          .maybeSingle();

        if (showtimeError) throw showtimeError;
        
        if (showtime?.screen_id) {
          // Get screen details
          const { data: screen, error: screenError } = await supabase
            .from('screens')
            .select('*')
            .eq('id', showtime.screen_id)
            .maybeSingle();

          if (screenError) throw screenError;
          if (screen) {
            setScreenData(screen);
          }
        }

        // Get booked seats for this showtime
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('seats')
          .eq('showtime_date', date)
          .eq('showtime_time', time)
          .eq('movie_id', id)
          .in('status', ['confirmed', 'pending']);

        if (bookingsError) throw bookingsError;

        const allBookedSeats = bookings?.flatMap(b => b.seats || []) || [];
        setBookedSeats(allBookedSeats);
      } catch (error) {
        console.error('Error fetching seat data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showtimeId, date, time, id]);

  const rows = useMemo(() => {
    const numRows = screenData?.rows || 8;
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').slice(0, numRows);
  }, [screenData]);

  const seatsPerRow = screenData?.seats_per_row || 12;

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (moviesLoading || loading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Movie not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) {
      toast({
        title: "Seat Unavailable",
        description: "This seat is already booked.",
        variant: "destructive",
      });
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(s => s !== seatId);
      }
      if (prev.length >= 10) {
        toast({
          title: "Maximum seats reached",
          description: "You can only select up to 10 seats.",
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, seatId];
    });
  };

  const handleProceed = () => {
    if (selectedSeats.length === 0) {
      toast({
        title: "No seats selected",
        description: "Please select at least one seat to continue.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/payment?movie=${id}&date=${date}&time=${time}&seats=${selectedSeats.join(',')}&screen=${screenName}&price=${pricePerSeat}`);
  };

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{movie.title}</h1>
              <p className="text-muted-foreground">
                {screenName} • {date} • {formatTime(time)}
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Seat Map */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-card border-border">
                {/* Screen */}
                <div className="mb-12 text-center">
                  <div className="cinema-screen mx-auto max-w-lg" />
                  <p className="mt-4 text-sm text-muted-foreground">SCREEN</p>
                </div>

                {/* Seats */}
                <div className="overflow-x-auto">
                  <div className="min-w-[600px] space-y-3">
                    {rows.map((row) => (
                      <div key={row} className="flex items-center justify-center gap-2">
                        <span className="w-6 text-sm font-medium text-muted-foreground">{row}</span>
                        <div className="flex gap-2">
                          {Array.from({ length: seatsPerRow }, (_, i) => {
                            const seatNum = i + 1;
                            const seatId = `${row}${seatNum}`;
                            const isBooked = bookedSeats.includes(seatId);
                            const isSelected = selectedSeats.includes(seatId);
                            
                            let status: 'available' | 'selected' | 'booked' = 'available';
                            if (isBooked) status = 'booked';
                            else if (isSelected) status = 'selected';

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId)}
                                disabled={isBooked}
                                className={cn(
                                  "seat",
                                  status === 'available' && "seat-available",
                                  status === 'selected' && "seat-selected",
                                  status === 'booked' && "seat-booked"
                                )}
                                title={seatId}
                              >
                                {seatNum}
                              </button>
                            );
                          })}
                        </div>
                        <span className="w-6 text-sm font-medium text-muted-foreground">{row}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-t-lg bg-muted" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-t-lg bg-primary shadow-lg shadow-primary/40" />
                    <span className="text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-t-lg bg-muted/50" />
                    <span className="text-muted-foreground">Booked</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                
                <div className="flex gap-4 mb-6">
                  <img
                    src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'}
                    alt={movie.title}
                    className="w-20 h-28 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.rating}</p>
                    <p className="text-sm text-muted-foreground mt-2">{screenName}</p>
                    <p className="text-sm text-muted-foreground">{date} • {formatTime(time)}</p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Selected Seats</span>
                    <span className="text-foreground font-medium">
                      {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Tickets</span>
                    <span className="text-foreground font-medium">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="text-foreground font-medium">${pricePerSeat.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">
                      ${(selectedSeats.length * pricePerSeat).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="cinema"
                  className="w-full"
                  size="lg"
                  onClick={handleProceed}
                  disabled={selectedSeats.length === 0}
                >
                  Proceed to Payment
                </Button>

                <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>Seats will be held for 10 minutes. Complete your booking to confirm.</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default SeatSelection;
