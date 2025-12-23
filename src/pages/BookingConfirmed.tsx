import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Download, Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const BookingConfirmed = () => {
  const location = useLocation();
  const { movie, cinema, date, time, seats, total, screenName } = location.state || {};

  if (!movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No Booking Found</h1>
            <Link to="/">
              <Button variant="cinema">Browse Movies</Button>
            </Link>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  const bookingId = `CB${Date.now().toString().slice(-8)}`;

  return (
    <CustomerLayout>
      <div className="min-h-screen py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Success Header */}
          <div className="text-center mb-8 animate-fade-up">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
            <p className="text-muted-foreground">
              Your tickets have been booked successfully. A confirmation email has been sent.
            </p>
          </div>

          {/* Ticket Card */}
          <Card className="p-0 overflow-hidden bg-card border-border mb-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Booking ID</p>
                  <p className="text-2xl font-bold tracking-wider">{bookingId}</p>
                </div>
                <Ticket className="w-12 h-12 opacity-50" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex gap-6 mb-6">
                {movie.posterUrl && (
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-24 h-36 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-1">{movie.title}</h2>
                  <p className="text-muted-foreground text-sm mb-4">{movie.rating}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{cinema?.name}{screenName ? ` • ${screenName}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashed Separator */}
              <div className="border-t-2 border-dashed border-border my-6 relative">
                <div className="absolute -left-9 -top-3 w-6 h-6 rounded-full bg-background" />
                <div className="absolute -right-9 -top-3 w-6 h-6 rounded-full bg-background" />
              </div>

              {/* Seats & Total */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seats</p>
                  <p className="text-lg font-bold text-foreground">{seats?.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Paid</p>
                  <p className="text-lg font-bold text-primary">${total?.toFixed(2)}</p>
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="mt-6 flex justify-center">
                <div className="w-32 h-32 bg-secondary rounded-lg flex items-center justify-center">
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-foreground' : 'bg-secondary'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                Show this QR code at the cinema entrance
              </p>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="cinema" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download E-Ticket
            </Button>
            <Link to="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Browse More Movies
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default BookingConfirmed;
