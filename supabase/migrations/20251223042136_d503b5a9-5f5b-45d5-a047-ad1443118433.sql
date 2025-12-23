-- Add admin policy to view all bookings for theater management
CREATE POLICY "Admins can view all bookings"
  ON public.bookings
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Add admin policy to update bookings (for customer support)
CREATE POLICY "Admins can update all bookings"
  ON public.bookings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Add staff policy to view bookings (for operational needs)
CREATE POLICY "Staff can view all bookings"
  ON public.bookings
  FOR SELECT
  USING (public.has_role(auth.uid(), 'staff'));

-- Add admin policy to view all payments for reporting
CREATE POLICY "Admins can view all payments"
  ON public.payments
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));