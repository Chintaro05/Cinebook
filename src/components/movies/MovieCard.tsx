import { Link } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';
import { Movie } from '@/types/movie';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={cn(
      "group relative rounded-xl overflow-hidden bg-card border border-border transition-all duration-300",
      "hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/30",
      className
    )}>
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-semibold text-foreground">
          {movie.rating}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
          <Link to={`/movie/${movie.id}`}>
            <Button variant="cinema" className="w-full">
              Book Tickets
            </Button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(movie.duration)}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 text-warning fill-warning" />
            8.8
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 2).map((genre) => (
            <span
              key={genre}
              className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
