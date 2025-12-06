import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Plus, Calendar } from 'lucide-react';
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

interface AddMovieDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GENRES = ['Action', 'Adventure', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Biography', 'History'];
const RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

export const AddMovieDialog = ({ open, onOpenChange }: AddMovieDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    synopsis: '',
    director: '',
    releaseDate: '',
    rating: '',
    trailerUrl: '',
  });
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';
    if (!formData.synopsis.trim()) newErrors.synopsis = 'Synopsis is required';
    if (!formData.director.trim()) newErrors.director = 'Director is required';
    if (!formData.releaseDate) newErrors.releaseDate = 'Release date is required';
    if (!formData.rating) newErrors.rating = 'Rating is required';
    if (selectedGenres.length === 0) newErrors.genres = 'At least one genre is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Movie Added",
      description: `"${formData.title}" has been added successfully.`,
    });
    
    resetForm();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      duration: '',
      synopsis: '',
      director: '',
      releaseDate: '',
      rating: '',
      trailerUrl: '',
    });
    setSelectedGenres([]);
    setPosterPreview(null);
    setErrors({});
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handlePosterDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPosterPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPosterPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Movie</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Poster Upload */}
            <div className="space-y-2">
              <Label>Movie Poster</Label>
              <div
                className={`relative aspect-[2/3] rounded-lg border-2 border-dashed transition-colors ${
                  posterPreview ? 'border-primary' : 'border-border hover:border-primary/50'
                }`}
                onDrop={handlePosterDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {posterPreview ? (
                  <>
                    <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => setPosterPreview(null)}
                      className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground text-center px-2">
                      Drop image here or click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePosterSelect}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Main Form Fields */}
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
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
                  <Label>Rating *</Label>
                  <Select value={formData.rating} onValueChange={(v) => setFormData({ ...formData, rating: v })}>
                    <SelectTrigger className={errors.rating ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {RATINGS.map(rating => (
                        <SelectItem key={rating} value={rating}>{rating}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director">Director *</Label>
                  <Input
                    id="director"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Enter director name"
                    className={errors.director ? 'border-destructive' : ''}
                  />
                  {errors.director && <p className="text-xs text-destructive">{errors.director}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date *</Label>
                  <div className="relative">
                    <Input
                      id="releaseDate"
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                      className={errors.releaseDate ? 'border-destructive' : ''}
                    />
                  </div>
                  {errors.releaseDate && <p className="text-xs text-destructive">{errors.releaseDate}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <Label>Genres * <span className="text-muted-foreground text-xs">(Select at least one)</span></Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => handleGenreToggle(genre)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedGenres.includes(genre)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            {errors.genres && <p className="text-xs text-destructive">{errors.genres}</p>}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <Label htmlFor="synopsis">Synopsis *</Label>
            <Textarea
              id="synopsis"
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              placeholder="Enter movie synopsis..."
              rows={4}
              className={errors.synopsis ? 'border-destructive' : ''}
            />
            {errors.synopsis && <p className="text-xs text-destructive">{errors.synopsis}</p>}
          </div>

          {/* Trailer URL */}
          <div className="space-y-2">
            <Label htmlFor="trailerUrl">Trailer URL <span className="text-muted-foreground text-xs">(Optional)</span></Label>
            <Input
              id="trailerUrl"
              value={formData.trailerUrl}
              onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Save Movie
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
