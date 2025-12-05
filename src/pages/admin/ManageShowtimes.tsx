import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Pencil, Trash2, Film, Monitor, Clock } from 'lucide-react';
import { movies, cinemas, screens, showtimes } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const ManageShowtimes = () => {
  const [selectedDate, setSelectedDate] = useState('2024-12-20');

  const dates = [
    { date: '2024-12-20', label: 'Today' },
    { date: '2024-12-21', label: 'Tomorrow' },
    { date: '2024-12-22', label: 'Sun' },
    { date: '2024-12-23', label: 'Mon' },
    { date: '2024-12-24', label: 'Tue' },
  ];

  const handleDelete = (id: string) => {
    toast({
      title: "Showtime Deleted",
      description: "The showtime has been removed.",
    });
  };

  return (
    <AdminLayout title="Manage Showtimes">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Schedule Management</CardTitle>
          <Button variant="cinema" className="gap-2">
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
                  "px-4 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap",
                  selectedDate === d.date
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border hover:border-primary/50 text-foreground"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Showtimes Grid */}
          <div className="space-y-4">
            {movies.slice(0, 3).map((movie) => (
              <div key={movie.id} className="p-4 rounded-xl bg-secondary/30 border border-border">
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-16 h-24 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{movie.title}</h3>
                    <p className="text-sm text-muted-foreground">{movie.rating} • {Math.floor(movie.duration / 60)}h {movie.duration % 60}m</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {showtimes.filter(s => s.movieId === movie.id).slice(0, 4).map((showtime) => (
                    <div 
                      key={showtime.id} 
                      className="p-3 rounded-lg bg-card border border-border hover:border-primary/30 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{showtime.time}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-destructive"
                            onClick={() => handleDelete(showtime.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3 h-3" />
                          <span>Screen {showtime.screenId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-foreground font-medium">${showtime.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default ManageShowtimes;
