
-- Add image_url column to buildings
ALTER TABLE public.buildings ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for building images
INSERT INTO storage.buckets (id, name, public) VALUES ('building-images', 'building-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload building images
CREATE POLICY "Authenticated users can upload building images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'building-images');

-- Allow public read access to building images
CREATE POLICY "Public can view building images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'building-images');

-- Allow authenticated users to delete their building images
CREATE POLICY "Authenticated users can delete building images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'building-images');

-- Add RLS policy for admins to view all rent payments
CREATE POLICY "Admins can view all payments"
ON public.rent_payments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to update all rent payments
CREATE POLICY "Admins can update all payments"
ON public.rent_payments FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to insert payments
CREATE POLICY "Admins can insert payments"
ON public.rent_payments FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for admins to delete payments
CREATE POLICY "Admins can delete payments"
ON public.rent_payments FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add RLS policy for tenants to view own payments (by matching user_id in tenants table)
CREATE POLICY "Tenants can view own payments via tenant record"
ON public.rent_payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenants t
    WHERE t.id = rent_payments.tenant_id
    AND t.user_id = auth.uid()
  )
);

-- Allow admins to manage tenants
CREATE POLICY "Admins can manage all tenants"
ON public.tenants FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Allow tenants to view own tenant record
CREATE POLICY "Tenants can view own record"
ON public.tenants FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Allow profiles to be inserted (for the trigger)
CREATE POLICY "System can insert profiles"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
