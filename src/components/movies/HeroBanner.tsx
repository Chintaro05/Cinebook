import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMovies } from '@/hooks/useMovies';
import heroCinema from '@/assets/hero-cinema.jpg';
import { cn } from '@/lib/utils';

export function HeroBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: movies = [] } = useMovies();

  // Randomly select 3 movies for the hero banner
  const featuredMovies = useMemo(() => {
    if (movies.length === 0) return [];
    const shuffled = [...movies].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(3, shuffled.length));
  }, [movies]);

  const currentMovie = featuredMovies[currentIndex];

  useEffect(() => {
    if (featuredMovies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const nextSlide = () => {
    if (featuredMovies.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
  };

  const prevSlide = () => {
    if (featuredMovies.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + featuredMovies.length) % featuredMovies.length);
  };

  if (!currentMovie) {
    return (
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroCinema}
            alt="Cinema"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl space-y-6 animate-fade-up">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Welcome to CineBook
            </h1>
            <p className="text-lg text-muted-foreground">
              Your premium destination for movie ticket booking.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={currentMovie.poster_url || heroCinema}
          alt={currentMovie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl space-y-6 animate-fade-up">
          {/* Rating Badge */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium border border-primary/30">
              {currentMovie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
            </span>
            {currentMovie.rating && (
              <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                {currentMovie.rating}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            {currentMovie.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-muted-foreground">
            {currentMovie.genre?.slice(0, 3).map((genre, index) => (
              <span key={genre} className="flex items-center">
                {genre}
                {index < Math.min(currentMovie.genre?.length || 0, 3) - 1 && (
                  <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground" />
                )}
              </span>
            ))}
            <span className="flex items-center">
              <span className="mx-2 w-1 h-1 rounded-full bg-muted-foreground" />
              {Math.floor(currentMovie.duration / 60)}h {currentMovie.duration % 60}m
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-lg text-muted-foreground line-clamp-3 max-w-xl">
            {currentMovie.synopsis}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4">
            <Link to={`/movie/${currentMovie.id}`}>
              <Button variant="cinema" size="xl" className="gap-2">
                <Play className="w-5 h-5 fill-current" />
                Book Tickets
              </Button>
            </Link>
            <Link to={`/movie/${currentMovie.id}`}>
              <Button variant="glass" size="xl" className="gap-2">
                <Info className="w-5 h-5" />
                More Info
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <Button variant="glass" size="icon" onClick={prevSlide}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex gap-2">
          {featuredMovies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-8 bg-primary" 
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              )}
            />
          ))}
        </div>
        <Button variant="glass" size="icon" onClick={nextSlide}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
