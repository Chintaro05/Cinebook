import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Save, Loader2, Clock, Calendar, DollarSign } from 'lucide-react';
import { useMovies } from '@/hooks/useMovies';
import { useScreens } from '@/hooks/useScreens';
import { useShowtimes, useUpdateShowtime, Showtime } from '@/hooks/useShowtimes';

interface EditShowtimeDialogProps {
  showtime: Showtime | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditShowtimeDialog({ showtime, open, onOpenChange }: EditShowtimeDialogProps) {
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    date: '',
    time: '',
    price: '',
  });
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');

  const { data: movies = [] } = useMovies();
  const { data: screens = [] } = useScreens();
  const { data: allShowtimes = [] } = useShowtimes();
  const updateShowtime = useUpdateShowtime();

  useEffect(() => {
    if (showtime) {
      setFormData({
        movieId: showtime.movie_id,
        screenId: showtime.screen_id,
        date: showtime.show_date,
        time: showtime.show_time.slice(0, 5),
        price: String(showtime.price),
      });
      setHasConflict(false);
    }
  }, [showtime]);

  useEffect(() => {
    if (formData.screenId && formData.date && formData.time && showtime) {
      const conflict = allShowtimes.find(
        s => s.id !== showtime.id && 
             s.screen_id === formData.screenId && 
             s.show_date === formData.date &&
             Math.abs(parseInt(s.show_time.split(':')[0]) - parseInt(formData.time.split(':')[0])) < 3
      );
      
      if (conflict) {
        const movie = movies.find(m => m.id === conflict.movie_id);
        setHasConflict(true);
        setConflictDetails(`Conflict with "${movie?.title || 'Unknown'}" at ${conflict.show_time.slice(0, 5)}`);
      } else {
        setHasConflict(false);
        setConflictDetails('');
      }
    }
  }, [formData.screenId, formData.date, formData.time, showtime, allShowtimes, movies]);

  const handleSubmit = async () => {
    if (hasConflict || !showtime) return;

    updateShowtime.mutate({
      id: showtime.id,
      movie_id: formData.movieId,
      screen_id: formData.screenId,
      show_date: formData.date,
      show_time: formData.time,
      price: parseFloat(formData.price),
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  if (!showtime) return null;

  const currentMovie = movies.find(m => m.id === formData.movieId);
  const currentScreen = screens.find(s => s.id === formData.screenId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Showtime</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Info Display */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Current Selection:</p>
            <div className="flex items-center gap-3">
              {currentMovie?.poster_url && (
                <img
                  src={currentMovie.poster_url}
                  alt={currentMovie.title}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-semibold text-foreground">{currentMovie?.title || 'Select a movie'}</p>
                <p className="text-sm text-muted-foreground">
                  {currentScreen?.name || 'Select a screen'} • {formData.date} • {formData.time}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Select Movie</Label>
            <Select 
              value={formData.movieId} 
              onValueChange={(value) => setFormData({ ...formData, movieId: value })}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Choose a movie" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {movies.map(movie => (
                  <SelectItem key={movie.id} value={movie.id}>
                    <div className="flex items-center gap-2">
                      <span>{movie.title}</span>
                      <span className="text-xs text-muted-foreground">({movie.duration} min)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Screen Room</Label>
            <Select 
              value={formData.screenId} 
              onValueChange={(value) => setFormData({ ...formData, screenId: value })}
            >
              <SelectTrigger className="bg-secondary/50">
                <SelectValue placeholder="Choose a screen" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {screens.map(screen => (
                  <SelectItem key={screen.id} value={screen.id}>
                    {screen.name} ({screen.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="bg-secondary/50"
              />
            </div>
          </div>

          {/* Conflict Alert */}
          {hasConflict && (
            <Alert variant="destructive" className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                <strong>Schedule Conflict:</strong> {conflictDetails}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Base Price
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 15.00"
              className="bg-secondary/50"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateShowtime.isPending}>
            Cancel
          </Button>
          <Button 
            variant="cinema" 
            onClick={handleSubmit} 
            disabled={updateShowtime.isPending || hasConflict}
          >
            {updateShowtime.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Showtime
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
