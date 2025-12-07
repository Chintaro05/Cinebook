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
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Save, Loader2, Crown, Armchair } from 'lucide-react';

interface Screen {
  id: string;
  name: string;
  capacity: number;
  rows: number;
  seatsPerRow: number;
}

interface EditScreenDialogProps {
  screen: Screen | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditScreenDialog({ screen, open, onOpenChange }: EditScreenDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    rows: 8,
    seatsPerRow: 12,
  });
  const [vipRows, setVipRows] = useState<number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-populate form when screen data is available
  useEffect(() => {
    if (screen) {
      setFormData({
        name: screen.name,
        rows: screen.rows,
        seatsPerRow: screen.seatsPerRow,
      });
      // Assume last 2 rows are VIP by default
      setVipRows([screen.rows - 1, screen.rows]);
      setErrors({});
    }
  }, [screen]);

  const toggleVipRow = (row: number) => {
    setVipRows(prev =>
      prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Room name is required';
    if (formData.rows < 3 || formData.rows > 20) newErrors.rows = 'Rows must be between 3-20';
    if (formData.seatsPerRow < 5 || formData.seatsPerRow > 30) newErrors.seatsPerRow = 'Seats per row must be between 5-30';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Room Configuration Saved",
      description: `"${formData.name}" has been updated.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  if (!screen) return null;

  const totalCapacity = formData.rows * formData.seatsPerRow;
  const vipSeats = vipRows.length * formData.seatsPerRow;
  const standardSeats = totalCapacity - vipSeats;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Screening Room</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Room Name/Number *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Screen 1 IMAX"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rows">Number of Rows *</Label>
              <Input
                id="rows"
                type="number"
                min="3"
                max="20"
                value={formData.rows}
                onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) || 8 })}
                className={errors.rows ? 'border-destructive' : ''}
              />
              {errors.rows && <p className="text-xs text-destructive">{errors.rows}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="seatsPerRow">Seats per Row *</Label>
              <Input
                id="seatsPerRow"
                type="number"
                min="5"
                max="30"
                value={formData.seatsPerRow}
                onChange={(e) => setFormData({ ...formData, seatsPerRow: parseInt(e.target.value) || 12 })}
                className={errors.seatsPerRow ? 'border-destructive' : ''}
              />
              {errors.seatsPerRow && <p className="text-xs text-destructive">{errors.seatsPerRow}</p>}
            </div>
          </div>

          {/* Capacity Summary */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCapacity}</p>
                <p className="text-xs text-muted-foreground">Total Capacity</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{standardSeats}</p>
                <p className="text-xs text-muted-foreground">Standard Seats</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{vipSeats}</p>
                <p className="text-xs text-muted-foreground">VIP Seats</p>
              </div>
            </div>
          </div>

          {/* Visual Seat Grid Editor */}
          <div className="space-y-3">
            <Label>Seat Layout (Click rows to toggle VIP)</Label>
            <div className="p-6 rounded-xl bg-background border border-border">
              {/* Screen Indicator */}
              <div className="mb-6">
                <div className="w-2/3 mx-auto h-2 rounded-full bg-gradient-to-r from-transparent via-muted-foreground/50 to-transparent" />
                <p className="text-center text-xs text-muted-foreground mt-2">SCREEN</p>
              </div>

              {/* Seat Grid */}
              <div className="space-y-2">
                {Array.from({ length: Math.min(formData.rows, 12) }).map((_, rowIndex) => {
                  const rowNumber = rowIndex + 1;
                  const isVip = vipRows.includes(rowNumber);
                  
                  return (
                    <div 
                      key={rowIndex} 
                      className="flex items-center gap-2 cursor-pointer group"
                      onClick={() => toggleVipRow(rowNumber)}
                    >
                      <span className={cn(
                        "w-6 text-xs font-medium",
                        isVip ? "text-primary" : "text-muted-foreground"
                      )}>
                        {String.fromCharCode(65 + rowIndex)}
                      </span>
                      <div className={cn(
                        "flex-1 flex justify-center gap-1 p-2 rounded-lg transition-colors",
                        isVip ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-transparent group-hover:border-border"
                      )}>
                        {Array.from({ length: Math.min(formData.seatsPerRow, 16) }).map((_, seatIndex) => (
                          <div
                            key={seatIndex}
                            className={cn(
                              "w-4 h-4 rounded-t-lg flex items-center justify-center transition-colors",
                              isVip ? "bg-primary/30" : "bg-muted"
                            )}
                          >
                            {isVip && <Crown className="w-2 h-2 text-primary" />}
                          </div>
                        ))}
                        {formData.seatsPerRow > 16 && (
                          <span className="text-xs text-muted-foreground">+{formData.seatsPerRow - 16}</span>
                        )}
                      </div>
                      <div className={cn(
                        "w-16 text-xs text-right",
                        isVip ? "text-primary" : "text-muted-foreground"
                      )}>
                        {isVip ? (
                          <span className="flex items-center gap-1 justify-end">
                            <Crown className="w-3 h-3" /> VIP
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 justify-end">
                            <Armchair className="w-3 h-3" /> Std
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {formData.rows > 12 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    +{formData.rows - 12} more rows...
                  </p>
                )}
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-t-lg bg-muted" />
                  <span className="text-xs text-muted-foreground">Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-t-lg bg-primary/30 flex items-center justify-center">
                    <Crown className="w-2 h-2 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">VIP Row</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Room Configuration
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
