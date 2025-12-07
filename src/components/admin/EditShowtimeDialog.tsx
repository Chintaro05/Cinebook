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
import { toast } from '@/hooks/use-toast';
import { movies, screens, showtimes } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Save, Loader2, Clock, Calendar, DollarSign } from 'lucide-react';

interface Showtime {
  id: string;
  movieId: string;
  screenId: string;
  date: string;
  time: string;
  price: number;
}

interface EditShowtimeDialogProps {
  showtime: Showtime | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditShowtimeDialog({ showtime, open, onOpenChange }: EditShowtimeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    date: '',
    time: '',
    price: '',
  });
  const [hasConflict, setHasConflict] = useState(false);
  const [conflictDetails, setConflictDetails] = useState('');

  // Pre-populate form when showtime data is available
  useEffect(() => {
    if (showtime) {
      setFormData({
        movieId: showtime.movieId,
        screenId: showtime.screenId,
        date: showtime.date,
        time: showtime.time,
        price: showtime.price.toString(),
      });
      setHasConflict(false);
    }
  }, [showtime]);

  // Check for conflicts when time/screen changes
  useEffect(() => {
    if (formData.screenId && formData.date && formData.time && showtime) {
      const conflict = showtimes.find(
        s => s.id !== showtime.id && 
             s.screenId === formData.screenId && 
             s.date === formData.date &&
             Math.abs(parseInt(s.time.split(':')[0]) - parseInt(formData.time.split(':')[0])) < 3
      );
      
      if (conflict) {
        const movie = movies.find(m => m.id === conflict.movieId);
        setHasConflict(true);
        setConflictDetails(`Conflict with "${movie?.title}" at ${conflict.time}`);
      } else {
        setHasConflict(false);
        setConflictDetails('');
      }
    }
  }, [formData.screenId, formData.date, formData.time, showtime]);

  const handleSubmit = async () => {
    if (hasConflict) {
      toast({
        title: "Schedule Conflict",
        description: "Please resolve the time conflict before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const movie = movies.find(m => m.id === formData.movieId);
    
    toast({
      title: "Showtime Updated",
      description: `Showtime for "${movie?.title}" has been updated.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
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
              {currentMovie && (
                <img
                  src={currentMovie.posterUrl}
                  alt={currentMovie.title}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div>
                <p className="font-semibold text-foreground">{currentMovie?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {currentScreen?.name} • {formData.date} • {formData.time}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="cinema" 
            onClick={handleSubmit} 
            disabled={isLoading || hasConflict}
          >
            {isLoading ? (
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
