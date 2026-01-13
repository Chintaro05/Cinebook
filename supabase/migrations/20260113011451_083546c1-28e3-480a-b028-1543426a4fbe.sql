-- Create refund status history table
CREATE TABLE public.refund_status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.refund_status_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all history
CREATE POLICY "Admins can view refund history"
ON public.refund_status_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert history
CREATE POLICY "Admins can insert refund history"
ON public.refund_status_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to auto-record status changes
CREATE OR REPLACE FUNCTION public.record_refund_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('refund_pending', 'refund_processing', 'refunded') THEN
    INSERT INTO public.refund_status_history (payment_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on payments table
CREATE TRIGGER on_payment_status_change
  AFTER UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.record_refund_status_change();

-- Enable realtime for refund history
ALTER PUBLICATION supabase_realtime ADD TABLE public.refund_status_history;