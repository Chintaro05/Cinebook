import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Monitor, Users, Loader2 } from 'lucide-react';
import { useScreens, useDeleteScreen, Screen } from '@/hooks/useScreens';
import { AddScreenDialog } from '@/components/admin/AddScreenDialog';
import { EditScreenDialog } from '@/components/admin/EditScreenDialog';
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

const ManageScreens = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  const { data: screens = [], isLoading } = useScreens();
  const deleteScreen = useDeleteScreen();

  const handleEdit = (screen: Screen) => {
    setSelectedScreen(screen);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (screen: Screen) => {
    setSelectedScreen(screen);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedScreen) {
      deleteScreen.mutate(selectedScreen.id);
      setDeleteDialogOpen(false);
      setSelectedScreen(null);
    }
  };

  return (
    <AdminLayout title="Manage Screening Rooms">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">All Screening Rooms</CardTitle>
          <Button variant="cinema" className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Room
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : screens.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No screening rooms found. Add your first room!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {screens.map((screen) => (
                <Card key={screen.id} className="bg-secondary/30 border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEdit(screen)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(screen)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-foreground mb-3">{screen.name}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Capacity</span>
                        <span className="text-foreground font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {screen.capacity} seats
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Layout</span>
                        <span className="text-foreground font-medium">
                          {screen.rows}x{screen.seats_per_row}
                        </span>
                      </div>
                    </div>

                    {/* Mini Seat Preview */}
                    <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                      <div className="w-full h-1 rounded-full bg-muted-foreground/30 mb-3" />
                      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(screen.seats_per_row, 10)}, 1fr)` }}>
                        {Array.from({ length: Math.min(screen.rows * screen.seats_per_row, 30) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 rounded-sm bg-muted" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddScreenDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditScreenDialog 
        screen={selectedScreen} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Screen</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedScreen?.name}"? This will also delete all associated showtimes.
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

export default ManageScreens;
