import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useShowtimeById, useBookedSeats } from '@/hooks/useShowtimes';
import { format } from 'date-fns';

const SeatSelection = () => {
  const { id } = useParams(); // This is now the showtime ID
  const navigate = useNavigate();
  
  const { data: showtime, isLoading: isLoadingShowtime } = useShowtimeById(id);
  const { data: bookedSeats = [], isLoading: isLoadingSeats } = useBookedSeats(
    id,
    showtime?.show_date || '',
    showtime?.show_time || ''
  );

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const screen = showtime?.screen;
  const movie = showtime?.movie;
  const pricePerSeat = showtime?.price || 15.00;

  // Generate rows based on screen configuration
  const rows = useMemo(() => {
    if (!screen) return 'ABCDEFGH'.split('');
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, screen.rows).split('');
  }, [screen]);

  const seatsPerRow = screen?.seats_per_row || 12;
  const vipRows = screen?.vip_rows || [];

  const isLoading = isLoadingShowtime || isLoadingSeats;

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (!showtime || !movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Showtime not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const toggleSeat = (seatId: string, isBooked: boolean) => {
    if (isBooked) {
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
    navigate(`/payment?showtime=${id}&seats=${selectedSeats.join(',')}`);
  };

  const formattedDate = format(new Date(showtime.show_date), 'EEE, MMM d, yyyy');
  const formattedTime = showtime.show_time.slice(0, 5); // Format HH:MM

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
                {screen?.name} • {formattedDate} • {formattedTime}
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
                    {rows.map((row) => {
                      const isVipRow = vipRows.includes(rows.indexOf(row) + 1);
                      return (
                        <div key={row} className="flex items-center justify-center gap-2">
                          <span className={cn(
                            "w-6 text-sm font-medium",
                            isVipRow ? "text-warning" : "text-muted-foreground"
                          )}>{row}</span>
                          <div className="flex gap-2">
                            {Array.from({ length: seatsPerRow }, (_, i) => {
                              const seatNum = i + 1;
                              const seatId = `${row}${seatNum}`;
                              const isBooked = bookedSeats.includes(seatId);
                              const isSelected = selectedSeats.includes(seatId);

                              let status = 'available';
                              if (isSelected) status = 'selected';
                              else if (isBooked) status = 'booked';

                              return (
                                <button
                                  key={seatId}
                                  onClick={() => toggleSeat(seatId, isBooked)}
                                  disabled={isBooked}
                                  className={cn(
                                    "seat",
                                    status === 'available' && "seat-available",
                                    status === 'selected' && "seat-selected",
                                    status === 'booked' && "seat-booked",
                                    isVipRow && status === 'available' && "border-warning/50"
                                  )}
                                  title={`${seatId}${isVipRow ? ' (VIP)' : ''}`}
                                >
                                  {seatNum}
                                </button>
                              );
                            })}
                          </div>
                          <span className={cn(
                            "w-6 text-sm font-medium",
                            isVipRow ? "text-warning" : "text-muted-foreground"
                          )}>{row}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex items-center justify-center gap-6 text-sm flex-wrap">
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
                  {vipRows.length > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-t-lg bg-muted border border-warning/50" />
                      <span className="text-muted-foreground">VIP</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                
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
                    <span className="text-foreground font-medium">${Number(pricePerSeat).toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-bold text-primary">
                      ${(selectedSeats.length * Number(pricePerSeat)).toFixed(2)}
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