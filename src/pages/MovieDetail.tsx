import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Clock, Calendar, Star, MapPin, ChevronRight } from 'lucide-react';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { movies, cinemas, showtimes } from '@/data/mockData';
import { cn } from '@/lib/utils';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const movie = movies.find(m => m.id === id);

  const [selectedDate, setSelectedDate] = useState<string>('2024-12-20');
  const [selectedCinema, setSelectedCinema] = useState<string>('1');
  const [selectedTime, setSelectedTime] = useState<string>('');

  if (!movie) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Movie not found</p>
        </div>
      </CustomerLayout>
    );
  }

  const dates = [
    { date: '2024-12-20', label: 'Today', day: 'Fri' },
    { date: '2024-12-21', label: 'Tomorrow', day: 'Sat' },
    { date: '2024-12-22', label: '12/22', day: 'Sun' },
    { date: '2024-12-23', label: '12/23', day: 'Mon' },
    { date: '2024-12-24', label: '12/24', day: 'Tue' },
  ];

  const times = ['10:00 AM', '1:30 PM', '4:45 PM', '7:15 PM', '10:00 PM'];

  const handleContinue = () => {
    if (selectedTime) {
      navigate(`/seats/${movie.id}?cinema=${selectedCinema}&date=${selectedDate}&time=${selectedTime}`);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <CustomerLayout>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px]">
        <div className="absolute inset-0">
          <img
            src={movie.posterUrl}
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
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
            </div>

            {/* Info */}
            <div className="space-y-4 animate-fade-up">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
                  {movie.rating}
                </span>
                {movie.genre.map((g) => (
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
                  {movie.releaseDate}
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

              <Button variant="cinema-outline" className="gap-2">
                <Play className="w-4 h-4" />
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cast Section */}
      {movie.cast.length > 0 && (
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-foreground mb-6">Cast</h2>
            <div className="flex gap-6 overflow-x-auto pb-4">
              {movie.cast.map((member) => (
                <div key={member.name} className="flex-shrink-0 text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-border">
                    <img
                      src={member.imageUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-medium text-foreground text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
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

              {/* Cinema Selection */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Choose Cinema</h3>
                <div className="space-y-3">
                  {cinemas.map((cinema) => (
                    <button
                      key={cinema.id}
                      onClick={() => setSelectedCinema(cinema.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-200",
                        selectedCinema === cinema.id
                          ? "bg-primary/10 border-primary/50 text-foreground"
                          : "bg-card border-border hover:border-primary/30 text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={cn(
                          "w-5 h-5",
                          selectedCinema === cinema.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="text-left">
                          <div className="font-medium">{cinema.name}</div>
                          <div className="text-sm text-muted-foreground">{cinema.address}</div>
                        </div>
                      </div>
                      {selectedCinema === cinema.id && (
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
                <div className="flex flex-wrap gap-3">
                  {times.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "px-6 py-3 rounded-xl border transition-all duration-200 font-medium",
                        selectedTime === time
                          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                          : "bg-card border-border hover:border-primary/50 text-foreground"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24 p-6 bg-card border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Booking Summary</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={movie.posterUrl}
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
                      <span className="text-muted-foreground">Cinema</span>
                      <span className="text-foreground font-medium">
                        {cinemas.find(c => c.id === selectedCinema)?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="text-foreground font-medium">{selectedTime || '—'}</span>
                    </div>
                  </div>

                  <Button
                    variant="cinema"
                    className="w-full"
                    size="lg"
                    disabled={!selectedTime}
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
