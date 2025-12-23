import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Calendar, Star, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useMovie } from '@/hooks/useMovies';
import { useShowtimesByMovie } from '@/hooks/useShowtimes';
import { format, addDays, startOfToday } from 'date-fns';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: movie, isLoading: isLoadingMovie } = useMovie(id);
  
  // Generate dates for the next 7 days
  const dates = useMemo(() => {
    const today = startOfToday();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i);
      return {
        date: format(date, 'yyyy-MM-dd'),
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'MMM d'),
        day: format(date, 'EEE'),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(dates[0].date);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  const { data: showtimes = [], isLoading: isLoadingShowtimes } = useShowtimesByMovie(id, selectedDate);

  const isLoading = isLoadingMovie || isLoadingShowtimes;

  if (isLoadingMovie) {
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

  const handleContinue = () => {
    if (selectedShowtimeId) {
      navigate(`/seats/${selectedShowtimeId}`);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const selectedShowtime = showtimes.find(s => s.id === selectedShowtimeId);

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="hidden md:block w-64 rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border border-border">
              <img
                src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-3 flex-wrap">
                {movie.rating && (
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                    {movie.rating}
                  </span>
                )}
                {movie.genre?.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground">
                {movie.title}
              </h1>

              <div className="flex items-center gap-6 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDuration(movie.duration)}
                </span>
                {movie.release_date && (
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(movie.release_date), 'MMM d, yyyy')}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  8.8/10
                </span>
              </div>

              <p className="text-muted-foreground max-w-2xl">
                {movie.synopsis}
              </p>

              {movie.director && (
                <div className="text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">Director:</span> {movie.director}
                </div>
              )}

              {movie.trailer_url && (
                <Button 
                  variant="cinema-outline" 
                  className="gap-2"
                  onClick={() => window.open(movie.trailer_url!, '_blank')}
                >
                  <Play className="w-4 h-4" />
                  Watch Trailer
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Cast Section */}
      {movie.cast_members && movie.cast_members.length > 0 && (
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Cast</h2>
            <div className="flex gap-4 flex-wrap">
              {movie.cast_members.map((member) => (
                <span 
                  key={member} 
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm"
                >
                  {member}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Showtime Selection */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground mb-8">Select Showtime</h2>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Date Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Date</h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {dates.map((d) => (
                    <button
                      key={d.date}
                      onClick={() => {
                        setSelectedDate(d.date);
                        setSelectedShowtimeId('');
                      }}
                      className={cn(
                        "flex-shrink-0 px-6 py-4 rounded-xl border transition-all duration-200 text-center min-w-[100px]",
                        selectedDate === d.date
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                          : "bg-card border-border hover:border-primary/50 text-foreground"
                      )}
                    >
                      <div className="text-xs opacity-70">{d.day}</div>
                      <div className="font-semibold">{d.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Showtime</h3>
                {isLoadingShowtimes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : showtimes.length === 0 ? (
                  <p className="text-muted-foreground py-4">No showtimes available for this date.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => setSelectedShowtimeId(showtime.id)}
                        className={cn(
                          "px-6 py-3 rounded-xl border transition-all duration-200 font-medium",
                          selectedShowtimeId === showtime.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                            : "bg-card border-border hover:border-primary/50 text-foreground"
                        )}
                      >
                        <div>{showtime.show_time.slice(0, 5)}</div>
                        <div className="text-xs opacity-70">{showtime.screen?.name}</div>
                        <div className="text-xs opacity-70">${Number(showtime.price).toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={movie.poster_url || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop'}
                      alt={movie.title}
                      className="w-20 h-28 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{movie.title}</h4>
                      <p className="text-sm text-muted-foreground">{movie.rating} • {formatDuration(movie.duration)}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="text-foreground font-medium">
                        {format(new Date(selectedDate), 'EEE, MMM d')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen</span>
                      <span className="text-foreground font-medium">
                        {selectedShowtime?.screen?.name || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground font-medium">
                        {selectedShowtime ? selectedShowtime.show_time.slice(0, 5) : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="text-foreground font-medium">
                        {selectedShowtime ? `$${Number(selectedShowtime.price).toFixed(2)}` : '—'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="cinema"
                    className="w-full"
                    size="lg"
                    disabled={!selectedShowtimeId}
                    onClick={handleContinue}
                  >
                    Continue to Seat Selection
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default MovieDetail;