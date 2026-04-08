
-- Create building expenses table
CREATE TABLE public.building_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
  month TEXT NOT NULL DEFAULT '',
  watchmen_salary NUMERIC NOT NULL DEFAULT 0,
  electricity_bill NUMERIC NOT NULL DEFAULT 0,
  water_bill NUMERIC NOT NULL DEFAULT 0,
  other_expenses NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add payment_mode to rent_payments for bank tracking
ALTER TABLE public.rent_payments ADD COLUMN IF NOT EXISTS payment_mode TEXT NOT NULL DEFAULT 'cash';

-- Disable RLS on all tables for no-auth usage
ALTER TABLE public.buildings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.flats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rent_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- Remove user_id NOT NULL constraint from buildings to allow no-auth inserts
ALTER TABLE public.buildings ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.buildings ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

ALTER TABLE public.tenants ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.tenants ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

ALTER TABLE public.rent_payments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.rent_payments ALTER COLUMN user_id SET DEFAULT '00000000-0000-0000-0000-000000000000';

-- Trigger for updated_at
CREATE TRIGGER update_building_expenses_updated_at
BEFORE UPDATE ON public.building_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
