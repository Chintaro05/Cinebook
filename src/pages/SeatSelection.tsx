import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { movies, cinemas, generateSeats } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const SeatSelection = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const movie = movies.find(m => m.id === id);
  const cinemaId = searchParams.get('cinema') || '1';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const cinema = cinemas.find(c => c.id === cinemaId);

  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  
  const seats = useMemo(() => generateSeats(8, 12), []);
  const pricePerSeat = 15.00;

  if (!movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Movie not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const toggleSeat = (seatId: string, status: string) => {
    if (status === 'booked' || status === 'reserved') {
      toast({
        title: "Seat Unavailable",
        description: status === 'booked' ? "This seat is already booked." : "This seat is currently reserved.",
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
    navigate(`/payment?movie=${id}&cinema=${cinemaId}&date=${date}&time=${time}&seats=${selectedSeats.join(',')}`);
  };

  const rows = 'ABCDEFGH'.split('');

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
                {cinema?.name} • {date} • {time}
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
                          {Array.from({ length: 12 }, (_, i) => {
                            const seatNum = i + 1;
                            const seatId = `${row}${seatNum}`;
                            const seatData = seats.find(s => s.row === row && s.number === seatNum);
                            const status = selectedSeats.includes(seatId) 
                              ? 'selected' 
                              : seatData?.status || 'available';

                            return (
                              <button
                                key={seatId}
                                onClick={() => toggleSeat(seatId, seatData?.status || 'available')}
                                disabled={status === 'booked'}
                                className={cn(
                                  "seat",
                                  status === 'available' && "seat-available",
                                  status === 'selected' && "seat-selected",
                                  status === 'booked' && "seat-booked",
                                  status === 'reserved' && "seat-reserved"
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
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-t-lg bg-warning/60" />
                    <span className="text-muted-foreground">Reserved</span>
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
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-20 h-28 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{movie.title}</h4>
                    <p className="text-sm text-muted-foreground">{movie.rating}</p>
                    <p className="text-sm text-muted-foreground mt-2">{cinema?.name}</p>
                    <p className="text-sm text-muted-foreground">{date} • {time}</p>
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
