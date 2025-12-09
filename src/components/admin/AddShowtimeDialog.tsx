import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertTriangle, CheckCircle, Clock, Calendar, Film, Monitor, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMovies } from '@/hooks/useMovies';
import { useScreens } from '@/hooks/useScreens';
import { useShowtimes, useCreateShowtime } from '@/hooks/useShowtimes';

interface AddShowtimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddShowtimeDialog = ({ open, onOpenChange }: AddShowtimeDialogProps) => {
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    date: '',
    time: '',
    price: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const { data: movies = [] } = useMovies();
  const { data: screens = [] } = useScreens();
  const { data: allShowtimes = [] } = useShowtimes();
  const createShowtime = useCreateShowtime();

  // Check for scheduling conflicts
  useEffect(() => {
    if (formData.screenId && formData.date && formData.time) {
      const selectedMovie = movies.find(m => m.id === formData.movieId);
      const movieDuration = selectedMovie?.duration || 120;
      
      const conflict = allShowtimes.find(st => {
        if (st.screen_id !== formData.screenId || st.show_date !== formData.date) return false;
        
        const existingTime = st.show_time;
        const newTime = formData.time;
        
        const existingMinutes = parseInt(existingTime.split(':')[0]) * 60 + parseInt(existingTime.split(':')[1] || '0');
        const newMinutes = parseInt(newTime.split(':')[0]) * 60 + parseInt(newTime.split(':')[1] || '0');
        
        const buffer = 150;
        return Math.abs(existingMinutes - newMinutes) < buffer;
      });

      if (conflict) {
        const conflictMovie = movies.find(m => m.id === conflict.movie_id);
        setConflictWarning(`Potential conflict with "${conflictMovie?.title || 'Unknown'}" at ${conflict.show_time.slice(0, 5)}`);
      } else {
        setConflictWarning(null);
      }
    } else {
      setConflictWarning(null);
    }
  }, [formData.screenId, formData.date, formData.time, formData.movieId, movies, allShowtimes]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.movieId) newErrors.movieId = 'Select a movie';
    if (!formData.screenId) newErrors.screenId = 'Select a screen';
    if (!formData.date) newErrors.date = 'Select a date';
    if (!formData.time) newErrors.time = 'Select a time';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Enter valid price';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    createShowtime.mutate({
      movie_id: formData.movieId,
      screen_id: formData.screenId,
      show_date: formData.date,
      show_time: formData.time,
      price: parseFloat(formData.price),
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  const resetForm = () => {
    setFormData({
      movieId: '',
      screenId: '',
      date: '',
      time: '',
      price: '',
    });
    setErrors({});
    setConflictWarning(null);
  };

  const selectedMovie = movies.find(m => m.id === formData.movieId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Schedule New Showtime
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Movie Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Film className="w-4 h-4 text-muted-foreground" />
              Select Movie *
            </Label>
            <Select value={formData.movieId} onValueChange={(v) => setFormData({ ...formData, movieId: v })}>
              <SelectTrigger className={errors.movieId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Choose a movie" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {movies.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No movies available. Add movies first.</div>
                ) : (
                  movies.map(movie => (
                    <SelectItem key={movie.id} value={movie.id}>
                      <div className="flex items-center gap-2">
                        <span>{movie.title}</span>
                        <span className="text-xs text-muted-foreground">
                          ({Math.floor(movie.duration / 60)}h {movie.duration % 60}m)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.movieId && <p className="text-xs text-destructive">{errors.movieId}</p>}
            {selectedMovie && (
              <p className="text-xs text-muted-foreground">
                Duration: {Math.floor(selectedMovie.duration / 60)}h {selectedMovie.duration % 60}m | Rating: {selectedMovie.rating}
              </p>
            )}
          </div>

          {/* Screen Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              Select Screen Room *
            </Label>
            <Select value={formData.screenId} onValueChange={(v) => setFormData({ ...formData, screenId: v })}>
              <SelectTrigger className={errors.screenId ? 'border-destructive' : ''}>
                <SelectValue placeholder="Choose a screen" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {screens.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">No screens available. Add screens first.</div>
                ) : (
                  screens.map(screen => (
                    <SelectItem key={screen.id} value={screen.id}>
                      <div className="flex items-center gap-2">
                        <span>{screen.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({screen.capacity} seats)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.screenId && <p className="text-xs text-destructive">{errors.screenId}</p>}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className={errors.date ? 'border-destructive' : ''}
              />
              {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Time *
              </Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={errors.time ? 'border-destructive' : ''}
              />
              {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
            </div>
          </div>

          {/* Conflict Warning */}
          {conflictWarning && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning/10 border border-warning/30">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning">Scheduling Conflict Detected</p>
                <p className="text-xs text-muted-foreground">{conflictWarning}</p>
              </div>
            </div>
          )}

          {/* No Conflict Indicator */}
          {formData.screenId && formData.date && formData.time && !conflictWarning && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-500">No scheduling conflicts detected</p>
            </div>
          )}

          {/* Base Price */}
          <div className="space-y-2">
            <Label htmlFor="price">Base Price ($) *</Label>
            <Input
              id="price"
              type="number"
              step="0.50"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g., 12.50"
              className={errors.price ? 'border-destructive' : ''}
            />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={createShowtime.isPending}>
            {createShowtime.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Showtime
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
