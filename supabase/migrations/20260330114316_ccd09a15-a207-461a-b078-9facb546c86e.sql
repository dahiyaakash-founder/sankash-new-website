
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Super admins can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Helper function
CREATE OR REPLACE FUNCTION public.is_ops_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin', 'team_supervisor', 'team_member')
  )
$$;

-- Update bootstrap to create super_admin
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin')) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, 'super_admin') ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Update admin_exists
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role IN ('admin', 'super_admin'))
$$;

-- Update user_roles RLS
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.user_roles;

CREATE POLICY "Ops members can view roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Super admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Update leads RLS
DROP POLICY IF EXISTS "Team members can view all leads" ON public.leads;
DROP POLICY IF EXISTS "Team members can update leads" ON public.leads;
DROP POLICY IF EXISTS "Team members can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Ops members can view leads" ON public.leads;
DROP POLICY IF EXISTS "Ops members can update leads" ON public.leads;
DROP POLICY IF EXISTS "Ops members can insert leads" ON public.leads;

CREATE POLICY "Ops members can view leads" ON public.leads
  FOR SELECT TO authenticated
  USING (is_ops_member(auth.uid()));

CREATE POLICY "Ops members can update leads" ON public.leads
  FOR UPDATE TO authenticated
  USING (is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert leads" ON public.leads
  FOR INSERT TO authenticated
  WITH CHECK (is_ops_member(auth.uid()));

-- Update lead_notes RLS
DROP POLICY IF EXISTS "Team members can view notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Team members can insert notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Ops members can view notes" ON public.lead_notes;
DROP POLICY IF EXISTS "Ops members can insert notes" ON public.lead_notes;

CREATE POLICY "Ops members can view notes" ON public.lead_notes
  FOR SELECT TO authenticated
  USING (is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert notes" ON public.lead_notes
  FOR INSERT TO authenticated
  WITH CHECK (is_ops_member(auth.uid()));

-- Update lead_status_history RLS
DROP POLICY IF EXISTS "Team members can view history" ON public.lead_status_history;
DROP POLICY IF EXISTS "Team members can insert history" ON public.lead_status_history;
DROP POLICY IF EXISTS "Ops members can view history" ON public.lead_status_history;
DROP POLICY IF EXISTS "Ops members can insert history" ON public.lead_status_history;

CREATE POLICY "Ops members can view history" ON public.lead_status_history
  FOR SELECT TO authenticated
  USING (is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert history" ON public.lead_status_history
  FOR INSERT TO authenticated
  WITH CHECK (is_ops_member(auth.uid()));
