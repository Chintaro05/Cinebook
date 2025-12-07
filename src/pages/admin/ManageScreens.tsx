import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Monitor, Users } from 'lucide-react';
import { screens } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { AddScreenDialog } from '@/components/admin/AddScreenDialog';
import { EditScreenDialog } from '@/components/admin/EditScreenDialog';

interface Screen {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  seatsPerRow: number;
}

const ManageScreens = () => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState<Screen | null>(null);

  const handleEdit = (screen: Screen) => {
    setSelectedScreen(screen);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    toast({
      title: "Screen Deleted",
      description: `"${name}" has been removed.`,
    });
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
                        onClick={() => handleDelete(screen.id, screen.name)}
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
                        {screen.rows}x{screen.seatsPerRow}
                      </span>
                    </div>
                  </div>

                  {/* Mini Seat Preview */}
                  <div className="mt-4 p-3 rounded-lg bg-background border border-border">
                    <div className="w-full h-1 rounded-full bg-muted-foreground/30 mb-3" />
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(screen.seatsPerRow, 10)}, 1fr)` }}>
                      {Array.from({ length: Math.min(screen.rows * screen.seatsPerRow, 30) }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-sm bg-muted" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <AddScreenDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <EditScreenDialog 
        screen={selectedScreen} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
      />
    </AdminLayout>
  );
};

export default ManageScreens;
