import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Pencil, Trash2, Film, Filter } from 'lucide-react';
import { movies } from '@/data/mockData';
import { Movie } from '@/types/movie';
import { toast } from '@/hooks/use-toast';
import { AddMovieDialog } from '@/components/admin/AddMovieDialog';
import { EditMovieDialog } from '@/components/admin/EditMovieDialog';

const ManageMovies = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    toast({
      title: "Movie Deleted",
      description: `"${title}" has been removed.`,
    });
  };

  return (
    <AdminLayout title="Manage Movies">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Movies</CardTitle>
          <Button variant="cinema" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add New Movie
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Movie</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Genre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={movie.posterUrl} alt={movie.title} className="w-10 h-14 rounded object-cover" />
                        <div>
                          <p className="font-medium text-foreground">{movie.title}</p>
                          <p className="text-xs text-muted-foreground">{movie.rating}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {movie.genre.slice(0, 2).map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded-full bg-secondary text-xs">{g}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{movie.duration} min</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${movie.isNowShowing ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                        {movie.isNowShowing ? 'Now Showing' : 'Coming Soon'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(movie)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(movie.id, movie.title)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing {filteredMovies.length} of {movies.length} movies</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddMovieDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditMovieDialog movie={selectedMovie} open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </AdminLayout>
  );
};

export default ManageMovies;
