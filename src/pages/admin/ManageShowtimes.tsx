import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Monitor, Loader2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShowtimes, useDeleteShowtime, Showtime } from '@/hooks/useShowtimes';
import { AddShowtimeDialog } from '@/components/admin/AddShowtimeDialog';
import { EditShowtimeDialog } from '@/components/admin/EditShowtimeDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format, addDays } from 'date-fns';

const ManageShowtimes = () => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  const { data: showtimes = [], isLoading } = useShowtimes(selectedDate);
  const deleteShowtime = useDeleteShowtime();

  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE'),
      day: format(date, 'd'),
    };
  });

  // Group showtimes by movie
  const showtimesByMovie = showtimes.reduce((acc, st) => {
    const movieId = st.movie_id;
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: st.movie,
        showtimes: [],
      };
    }
    acc[movieId].showtimes.push(st);
    return acc;
  }, {} as Record<string, { movie: Showtime['movie']; showtimes: Showtime[] }>);

  const handleEdit = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedShowtime) {
      deleteShowtime.mutate(selectedShowtime.id);
      setDeleteDialogOpen(false);
      setSelectedShowtime(null);
    }
  };

  return (
    <AdminLayout title="Manage Showtimes">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Schedule Management</CardTitle>
          <Button variant="cinema" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add New Showtime
          </Button>
        </CardHeader>
        <CardContent>
          {/* Date Filter */}
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {dates.map((d) => (
              <button
                key={d.date}
                onClick={() => setSelectedDate(d.date)}
                className={cn(
                  "flex flex-col items-center px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap min-w-[60px]",
                  selectedDate === d.date
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border hover:border-primary/50 text-foreground"
                )}
              >
                <span className="text-xs">{d.label}</span>
                <span className="text-lg font-semibold">{d.day}</span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : Object.keys(showtimesByMovie).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No showtimes scheduled for this date.</p>
              <Button variant="outline" className="mt-4" onClick={() => setAddDialogOpen(true)}>
                Schedule a Showtime
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.values(showtimesByMovie).map(({ movie, showtimes: movieShowtimes }) => (
                <div key={movie?.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    {movie?.poster_url ? (
                      <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="w-16 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-24 rounded-lg bg-muted flex items-center justify-center text-xs">No img</div>
                    )}
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{movie?.title || 'Unknown Movie'}</h3>
                      <p className="text-sm text-muted-foreground">{movie?.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : ''}</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {movieShowtimes.map((showtime) => (
                      <div 
                        key={showtime.id} 
                        className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-foreground">{showtime.show_time.slice(0, 5)}</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6"
                              onClick={() => handleEdit(showtime)}
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive"
                              onClick={() => handleDeleteClick(showtime)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            <span>{showtime.screen?.name || 'Unknown Screen'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-foreground font-medium">${Number(showtime.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddShowtimeDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditShowtimeDialog 
        showtime={selectedShowtime} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Showtime</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this showtime? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ManageShowtimes;
