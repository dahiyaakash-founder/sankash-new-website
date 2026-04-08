
-- Create a security definer function for lead visibility checks
CREATE OR REPLACE FUNCTION public.can_view_lead(_user_id uuid, _lead_assigned_to uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Admin/Super Admin can see all leads
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('super_admin', 'admin'))
    OR
    -- Lead is assigned to this user
    (_lead_assigned_to IS NOT NULL AND _lead_assigned_to = _user_id)
    OR
    -- Supervisor can see direct reports' leads
    (
      EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'team_supervisor')
      AND _lead_assigned_to IS NOT NULL
      AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = _lead_assigned_to AND supervisor_id = _user_id)
    )
$$;

-- ═══ LEADS TABLE ═══
-- Replace broad SELECT policy with role-scoped one
DROP POLICY IF EXISTS "Ops members can view leads" ON public.leads;
CREATE POLICY "Role-scoped lead visibility"
ON public.leads
FOR SELECT
TO authenticated
USING (public.can_view_lead(auth.uid(), assigned_to));

-- Replace broad UPDATE policy with role-scoped one
DROP POLICY IF EXISTS "Ops members can update leads" ON public.leads;
CREATE POLICY "Role-scoped lead updates"
ON public.leads
FOR UPDATE
TO authenticated
USING (public.can_view_lead(auth.uid(), assigned_to));

-- ═══ RELATED TABLES — inherit visibility from parent lead ═══

-- Lead Notes
DROP POLICY IF EXISTS "Ops members can view notes" ON public.lead_notes;
CREATE POLICY "Role-scoped note visibility"
ON public.lead_notes
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id));

-- Lead Activity
DROP POLICY IF EXISTS "Ops members can view activity" ON public.lead_activity;
CREATE POLICY "Role-scoped activity visibility"
ON public.lead_activity
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id));

-- Lead Status History
DROP POLICY IF EXISTS "Ops members can view history" ON public.lead_status_history;
CREATE POLICY "Role-scoped history visibility"
ON public.lead_status_history
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id));

-- Lead Attachments
DROP POLICY IF EXISTS "Ops members can view attachments" ON public.lead_attachments;
CREATE POLICY "Role-scoped attachment visibility"
ON public.lead_attachments
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id));

-- Itinerary Analysis
DROP POLICY IF EXISTS "Ops members can view analyses" ON public.itinerary_analysis;
CREATE POLICY "Role-scoped analysis visibility"
ON public.itinerary_analysis
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.leads WHERE id = lead_id));
