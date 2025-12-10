import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Calendar, Star, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMovies } from '@/hooks/useMovies';
import { useScreens } from '@/hooks/useScreens';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';

interface ShowtimeWithScreen {
  id: string;
  show_date: string;
  show_time: string;
  price: number;
  screen_id: string;
  screens: {
    id: string;
    name: string;
  } | null;
}

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: movies, isLoading: moviesLoading } = useMovies();
  const { data: screens } = useScreens();
  
  const movie = movies?.find(m => m.id === id);
  
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedScreen, setSelectedScreen] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeWithScreen | null>(null);
  const [showtimes, setShowtimes] = useState<ShowtimeWithScreen[]>([]);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);

  // Generate dates for next 5 days
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'MM/dd'),
      day: format(date, 'EEE'),
    };
  });

  // Fetch showtimes for the selected date and movie
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!id) return;
      
      setLoadingShowtimes(true);
      try {
        const { data, error } = await supabase
          .from('showtimes')
          .select(`
            id,
            show_date,
            show_time,
            price,
            screen_id,
            screens (
              id,
              name
            )
          `)
          .eq('movie_id', id)
          .eq('show_date', selectedDate)
          .order('show_time');

        if (error) throw error;
        setShowtimes(data || []);
        setSelectedShowtime(null);
      } catch (error) {
        console.error('Error fetching showtimes:', error);
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };

    fetchShowtimes();
  }, [id, selectedDate]);

  // Set default screen when screens load
  useEffect(() => {
    if (screens?.length && !selectedScreen) {
      setSelectedScreen(screens[0].id);
    }
  }, [screens, selectedScreen]);

  if (moviesLoading) {
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
    if (selectedShowtime) {
      navigate(`/seats/${movie.id}?showtime=${selectedShowtime.id}&date=${selectedDate}&time=${selectedShowtime.show_time}&screen=${selectedShowtime.screens?.name || 'Screen'}&price=${selectedShowtime.price}`);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Filter showtimes by selected screen
  const filteredShowtimes = selectedScreen 
    ? showtimes.filter(s => s.screen_id === selectedScreen)
    : showtimes;

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
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                  {movie.rating || 'PG-13'}
                </span>
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
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {movie.release_date}
                </span>
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning fill-warning" />
                  8.8/10
                </span>
              </div>

              <p className="text-muted-foreground max-w-2xl">
                {movie.synopsis}
              </p>

              <div className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">Director:</span> {movie.director}
              </div>

              {movie.trailer_url && (
                <Button variant="cinema-outline" className="gap-2">
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
            <div className="flex gap-6 overflow-x-auto pb-4">
              {movie.cast_members.map((member, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-border bg-muted flex items-center justify-center">
                    <span className="text-2xl text-muted-foreground">{member.charAt(0)}</span>
                  </div>
                  <p className="font-medium text-foreground text-sm">{member}</p>
                </div>
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
                      onClick={() => setSelectedDate(d.date)}
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

              {/* Screen Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Screen</h3>
                <div className="space-y-3">
                  {screens?.map((screen) => (
                    <button
                      key={screen.id}
                      onClick={() => setSelectedScreen(screen.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                        selectedScreen === screen.id
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-card border-border hover:border-primary/30 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={cn(
                          "w-5 h-5",
                          selectedScreen === screen.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="text-left">
                          <div className="font-medium">{screen.name}</div>
                          <div className="text-sm text-muted-foreground">Capacity: {screen.capacity} seats</div>
                        </div>
                      </div>
                      {selectedScreen === screen.id && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <ChevronRight className="w-4 h-4 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Time</h3>
                {loadingShowtimes ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : filteredShowtimes.length === 0 ? (
                  <p className="text-muted-foreground py-4">No showtimes available for this date and screen.</p>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {filteredShowtimes.map((showtime) => (
                      <button
                        key={showtime.id}
                        onClick={() => setSelectedShowtime(showtime)}
                        className={cn(
                          "px-6 py-3 rounded-xl border transition-all duration-200 font-medium",
                          selectedShowtime?.id === showtime.id
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                            : "bg-card border-border hover:border-primary/50 text-foreground"
                        )}
                      >
                        <div>{formatTime(showtime.show_time)}</div>
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
                      <span className="text-foreground font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Screen</span>
                      <span className="text-foreground font-medium">
                        {screens?.find(s => s.id === selectedScreen)?.name || '—'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground font-medium">
                        {selectedShowtime ? formatTime(selectedShowtime.show_time) : '—'}
                      </span>
                    </div>
                    {selectedShowtime && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price per seat</span>
                        <span className="text-foreground font-medium">${Number(selectedShowtime.price).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="cinema"
                    className="w-full"
                    size="lg"
                    disabled={!selectedShowtime}
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
