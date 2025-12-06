import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Ticket, Percent, DollarSign } from 'lucide-react';
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

interface AddTicketTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = ['Morning (before 12pm)', 'Afternoon (12pm-5pm)', 'Evening (5pm-9pm)', 'Night (after 9pm)'];

export const AddTicketTypeDialog = ({ open, onOpenChange }: AddTicketTypeDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    modifierType: 'discount' as 'discount' | 'surcharge',
    modifierValue: '',
    description: '',
  });
  const [applicableDays, setApplicableDays] = useState<string[]>(DAYS);
  const [applicableTimeSlots, setApplicableTimeSlots] = useState<string[]>(TIME_SLOTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Type name is required';
    if (!formData.modifierValue || parseFloat(formData.modifierValue) <= 0) {
      newErrors.modifierValue = 'Enter a valid modifier value';
    }
    if (parseFloat(formData.modifierValue) > 100 && formData.modifierType === 'discount') {
      newErrors.modifierValue = 'Discount cannot exceed 100%';
    }
    if (applicableDays.length === 0) newErrors.days = 'Select at least one applicable day';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const modifierText = formData.modifierType === 'discount' 
      ? `${formData.modifierValue}% discount`
      : `$${formData.modifierValue} surcharge`;
    
    toast({
      title: "Ticket Type Created",
      description: `"${formData.name}" with ${modifierText} has been added.`,
    });
    
    resetForm();
    onOpenChange(false);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      modifierType: 'discount',
      modifierValue: '',
      description: '',
    });
    setApplicableDays(DAYS);
    setApplicableTimeSlots(TIME_SLOTS);
    setErrors({});
  };

  const toggleDay = (day: string) => {
    setApplicableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setApplicableTimeSlots(prev => 
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const toggleAllDays = () => {
    setApplicableDays(prev => prev.length === DAYS.length ? [] : [...DAYS]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Create New Ticket Type
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-5 py-4">
          {/* Type Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Type Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Student, VIP, Senior"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Price Modifier */}
          <div className="space-y-2">
            <Label>Price Modifier *</Label>
            <div className="flex gap-3">
              <Select 
                value={formData.modifierType} 
                onValueChange={(v) => setFormData({ ...formData, modifierType: v as 'discount' | 'surcharge' })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="discount">
                    <span className="flex items-center gap-2">
                      <Percent className="w-3 h-3" />
                      Discount
                    </span>
                  </SelectItem>
                  <SelectItem value="surcharge">
                    <span className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      Surcharge
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.modifierValue}
                  onChange={(e) => setFormData({ ...formData, modifierValue: e.target.value })}
                  placeholder={formData.modifierType === 'discount' ? 'e.g., 15' : 'e.g., 5.00'}
                  className={`pr-8 ${errors.modifierValue ? 'border-destructive' : ''}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  {formData.modifierType === 'discount' ? '%' : '$'}
                </span>
              </div>
            </div>
            {errors.modifierValue && <p className="text-xs text-destructive">{errors.modifierValue}</p>}
            {formData.modifierValue && (
              <p className="text-xs text-muted-foreground">
                {formData.modifierType === 'discount' 
                  ? `Customers will receive ${formData.modifierValue}% off the base price`
                  : `Customers will pay an additional $${formData.modifierValue} on top of the base price`
                }
              </p>
            )}
          </div>

          {/* Applicable Days */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Applicable Days</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={toggleAllDays}
                className="text-xs h-7"
              >
                {applicableDays.length === DAYS.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    applicableDays.includes(day)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
            {errors.days && <p className="text-xs text-destructive">{errors.days}</p>}
          </div>

          {/* Applicable Time Slots */}
          <div className="space-y-3">
            <Label>Applicable Time Slots</Label>
            <div className="space-y-2">
              {TIME_SLOTS.map(slot => (
                <div key={slot} className="flex items-center space-x-2">
                  <Checkbox
                    id={slot}
                    checked={applicableTimeSlots.includes(slot)}
                    onCheckedChange={() => toggleTimeSlot(slot)}
                  />
                  <label
                    htmlFor={slot}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {slot}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Description/Rules */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Rules</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter any additional rules or requirements (e.g., 'Valid student ID required')"
              rows={3}
            />
          </div>

          {/* Preview */}
          {formData.name && formData.modifierValue && (
            <div className="p-4 rounded-lg bg-secondary/50 border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Preview</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{formData.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {applicableDays.length === DAYS.length 
                      ? 'All days' 
                      : applicableDays.map(d => d.slice(0, 3)).join(', ')
                    }
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  formData.modifierType === 'discount'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {formData.modifierType === 'discount' 
                    ? `-${formData.modifierValue}%` 
                    : `+$${formData.modifierValue}`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="cinema" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Ticket Type
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
