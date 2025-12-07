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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Save, Loader2, AlertTriangle, DollarSign, Percent } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  priceModifier: number;
  description: string;
}

interface EditTicketTypeDialogProps {
  ticketType: TicketType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const daysOfWeek = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
  { id: 'sat', label: 'Saturday' },
  { id: 'sun', label: 'Sunday' },
];

export function EditTicketTypeDialog({ ticketType, open, onOpenChange }: EditTicketTypeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    modifierType: 'discount' as 'discount' | 'surcharge',
    modifierValue: '',
    description: '',
  });
  const [applicableDays, setApplicableDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  const [timeRestriction, setTimeRestriction] = useState('all');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasActiveBookings, setHasActiveBookings] = useState(true); // Simulated

  // Pre-populate form when ticketType data is available
  useEffect(() => {
    if (ticketType) {
      const isDiscount = ticketType.priceModifier < 1;
      const modifierValue = isDiscount 
        ? ((1 - ticketType.priceModifier) * 100).toFixed(0)
        : ((ticketType.priceModifier - 1) * 100).toFixed(0);

      setFormData({
        name: ticketType.name,
        modifierType: isDiscount ? 'discount' : 'surcharge',
        modifierValue: ticketType.priceModifier === 1 ? '0' : modifierValue,
        description: ticketType.description,
      });
      setErrors({});
    }
  }, [ticketType]);

  const toggleDay = (dayId: string) => {
    setApplicableDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Type name is required';
    if (!formData.modifierValue || parseFloat(formData.modifierValue) < 0) {
      newErrors.modifierValue = 'Valid modifier value is required';
    }
    if (parseFloat(formData.modifierValue) > 100) {
      newErrors.modifierValue = 'Modifier cannot exceed 100%';
    }
    if (applicableDays.length === 0) newErrors.days = 'At least one applicable day is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Ticket Type Updated",
      description: `"${formData.name}" rules have been updated.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
  };

  if (!ticketType) return null;

  // Calculate preview price
  const basePrice = 15;
  const modifierValue = parseFloat(formData.modifierValue) || 0;
  const finalPrice = formData.modifierType === 'discount'
    ? basePrice * (1 - modifierValue / 100)
    : basePrice * (1 + modifierValue / 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Ticket Type</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning about active bookings */}
          {hasActiveBookings && (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning text-sm">
                <strong>Note:</strong> Changes to pricing will affect future bookings only.
                Existing reservations will keep their original price.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Type Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Student, Senior, VIP"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Modifier Type</Label>
              <Select 
                value={formData.modifierType} 
                onValueChange={(value: 'discount' | 'surcharge') => setFormData({ ...formData, modifierType: value })}
              >
                <SelectTrigger className="bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="discount">
                    <span className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-success" />
                      Discount
                    </span>
                  </SelectItem>
                  <SelectItem value="surcharge">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-primary" />
                      Surcharge
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modifierValue">Value (%) *</Label>
              <Input
                id="modifierValue"
                type="number"
                min="0"
                max="100"
                value={formData.modifierValue}
                onChange={(e) => setFormData({ ...formData, modifierValue: e.target.value })}
                placeholder="e.g., 20"
                className={errors.modifierValue ? 'border-destructive' : ''}
              />
              {errors.modifierValue && <p className="text-xs text-destructive">{errors.modifierValue}</p>}
            </div>
          </div>

          {/* Price Preview */}
          <div className="p-4 rounded-lg bg-secondary/30 border border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Price Preview (Base: ${basePrice.toFixed(2)})</span>
              <div className="text-right">
                <p className="text-xl font-bold text-foreground">${finalPrice.toFixed(2)}</p>
                <p className={`text-xs ${formData.modifierType === 'discount' ? 'text-success' : 'text-primary'}`}>
                  {formData.modifierType === 'discount' ? '-' : '+'}
                  {modifierValue}%
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Applicable Days {errors.days && <span className="text-destructive text-xs">({errors.days})</span>}</Label>
            <div className="grid grid-cols-4 gap-2">
              {daysOfWeek.map(day => (
                <div
                  key={day.id}
                  onClick={() => toggleDay(day.id)}
                  className={`p-2 rounded-lg border text-center text-sm cursor-pointer transition-all ${
                    applicableDays.includes(day.id)
                      ? 'bg-primary/20 border-primary text-foreground'
                      : 'bg-secondary/30 border-border text-muted-foreground hover:border-primary/50'
                  }`}
                >
                  {day.label.slice(0, 3)}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time Restriction</Label>
            <Select value={timeRestriction} onValueChange={setTimeRestriction}>
              <SelectTrigger className="bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All Showtimes</SelectItem>
                <SelectItem value="matinee">Matinee Only (before 5 PM)</SelectItem>
                <SelectItem value="evening">Evening Only (5 PM onwards)</SelectItem>
                <SelectItem value="late">Late Night Only (after 9 PM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description/Rules</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter any specific rules or requirements for this ticket type..."
              rows={3}
            />
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
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Update Ticket Rules
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
