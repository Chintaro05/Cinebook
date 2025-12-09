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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { X, Save, Loader2 } from 'lucide-react';
import { useUpdateMovie, Movie } from '@/hooks/useMovies';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditMovieDialogProps {
  movie: Movie | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const allGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation', 'Fantasy'];

export function EditMovieDialog({ movie, open, onOpenChange }: EditMovieDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    synopsis: '',
    releaseDate: '',
    posterUrl: '',
    rating: '',
    director: '',
    cast: '',
    status: 'now_showing',
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMovie = useUpdateMovie();

  useEffect(() => {
    if (movie) {
      setFormData({
        title: movie.title,
        duration: movie.duration.toString(),
        synopsis: movie.synopsis || '',
        releaseDate: movie.release_date || '',
        posterUrl: movie.poster_url || '',
        rating: movie.rating || '',
        director: movie.director || '',
        cast: movie.cast_members?.join(', ') || '',
        status: movie.status,
      });
      setSelectedGenres(movie.genre || []);
      setErrors({});
    }
  }, [movie]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';
    if (selectedGenres.length === 0) newErrors.genres = 'At least one genre is required';
    if (!formData.releaseDate) newErrors.releaseDate = 'Release date is required';
    if (!formData.synopsis.trim()) newErrors.synopsis = 'Synopsis is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !movie) return;
    
    updateMovie.mutate({
      id: movie.id,
      title: formData.title,
      duration: parseInt(formData.duration),
      synopsis: formData.synopsis,
      release_date: formData.releaseDate,
      poster_url: formData.posterUrl || undefined,
      rating: formData.rating,
      director: formData.director,
      cast_members: formData.cast ? formData.cast.split(',').map(c => c.trim()) : undefined,
      genre: selectedGenres,
      status: formData.status,
    }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  if (!movie) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Movie</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Movie Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter movie title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 120"
                  className={errors.duration ? 'border-destructive' : ''}
                />
                {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date *</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                  className={errors.releaseDate ? 'border-destructive' : ''}
                />
                {errors.releaseDate && <p className="text-xs text-destructive">{errors.releaseDate}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Genres * {errors.genres && <span className="text-destructive text-xs">({errors.genres})</span>}</Label>
              <div className="flex flex-wrap gap-2">
                {allGenres.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-primary/20 transition-colors"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                    {selectedGenres.includes(genre) && <X className="w-3 h-3 ml-1" />}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  placeholder="e.g., PG-13"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="now_showing">Now Showing</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="synopsis">Synopsis *</Label>
              <Textarea
                id="synopsis"
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                placeholder="Enter movie synopsis..."
                rows={5}
                className={errors.synopsis ? 'border-destructive' : ''}
              />
              {errors.synopsis && <p className="text-xs text-destructive">{errors.synopsis}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Director</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                placeholder="Enter director name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cast">Cast (comma-separated)</Label>
              <Textarea
                id="cast"
                value={formData.cast}
                onChange={(e) => setFormData({ ...formData, cast: e.target.value })}
                placeholder="e.g., Actor 1, Actor 2, Actor 3"
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="space-y-2">
              <Label>Current Poster</Label>
              <div className="flex gap-4 items-start">
                {formData.posterUrl && (
                  <img
                    src={formData.posterUrl}
                    alt="Current poster"
                    className="w-24 h-36 object-cover rounded-lg border border-border"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="posterUrl">Poster URL</Label>
                  <Input
                    id="posterUrl"
                    value={formData.posterUrl}
                    onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value })}
                    placeholder="Enter poster image URL"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updateMovie.isPending}>
            Cancel
          </Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={updateMovie.isPending}>
            {updateMovie.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Movie Details
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
