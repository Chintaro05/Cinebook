import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Monitor, Users, Grid3X3, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useCreateScreen } from '@/hooks/useScreens';

interface AddScreenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddScreenDialog = ({ open, onOpenChange }: AddScreenDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    rows: 10,
    seatsPerRow: 12,
  });
  const [vipRows, setVipRows] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createScreen = useCreateScreen();
  const capacity = formData.rows * formData.seatsPerRow;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Room name is required';
    if (formData.rows < 1 || formData.rows > 26) newErrors.rows = 'Rows must be 1-26';
    if (formData.seatsPerRow < 1 || formData.seatsPerRow > 30) newErrors.seatsPerRow = 'Seats per row must be 1-30';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    createScreen.mutate({
      name: formData.name,
      capacity,
      rows: formData.rows,
      seats_per_row: formData.seatsPerRow,
      vip_rows: vipRows,
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      }
    });
  };

  const resetForm = () => {
    setFormData({ name: '', rows: 10, seatsPerRow: 12 });
    setVipRows([]);
    setErrors({});
  };

  const toggleVipRow = (row: number) => {
    setVipRows(prev => 
      prev.includes(row) 
        ? prev.filter(r => r !== row)
        : [...prev, row]
    );
  };

  const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Add New Screening Room
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Screen 1, VIP Hall"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rows">Number of Rows *</Label>
              <Input
                id="rows"
                type="number"
                min={1}
                max={26}
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 1 })}
                className={errors.rows ? 'border-destructive' : ''}
              />
              {errors.rows && <p className="text-xs text-destructive">{errors.rows}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="seatsPerRow">Seats Per Row *</Label>
              <Input
                id="seatsPerRow"
                type="number"
                min={1}
                max={30}
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: parseInt(e.target.value) || 1 })}
                className={errors.seatsPerRow ? 'border-destructive' : ''}
              />
              {errors.seatsPerRow && <p className="text-xs text-destructive">{errors.seatsPerRow}</p>}
            </div>
          </div>

          {/* Capacity Display */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold text-foreground">{capacity} seats</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-muted-foreground">Layout</p>
              <p className="text-lg font-medium text-foreground">{formData.rows} rows × {formData.seatsPerRow} columns</p>
            </div>
          </div>

          {/* Visual Seat Grid Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Grid3X3 className="w-4 h-4 text-muted-foreground" />
                Seat Layout Preview
              </Label>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  Standard
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                  VIP (click row to toggle)
                </span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-background border border-border">
              {/* Screen representation */}
              <div className="mb-6 text-center">
                <div className="w-3/4 mx-auto h-2 rounded-full bg-gradient-to-r from-muted via-muted-foreground/30 to-muted" />
                <p className="text-xs text-muted-foreground mt-1">SCREEN</p>
              </div>

              {/* Seat Grid */}
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {Array.from({ length: Math.min(formData.rows, 26) }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleVipRow(rowIndex)}
                      className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                        vipRows.includes(rowIndex)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {rowLabels[rowIndex]}
                    </button>
                    <div className="flex gap-0.5 flex-1 justify-center">
                      {Array.from({ length: Math.min(formData.seatsPerRow, 30) }).map((_, seatIndex) => (
                        <div
                          key={seatIndex}
                          className={`w-3 h-3 rounded-sm transition-colors ${
                            vipRows.includes(rowIndex)
                              ? 'bg-primary/60'
                              : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    {vipRows.includes(rowIndex) && (
                      <Star className="w-4 h-4 text-primary" />
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              {vipRows.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary">VIP Rows:</span>{' '}
                    {vipRows.sort((a, b) => a - b).map(r => rowLabels[r]).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={createScreen.isPending}>
            {createScreen.isPending ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Save Room Layout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
