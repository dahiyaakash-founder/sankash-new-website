
-- Log table for deleted leads
CREATE TABLE public.lead_deletions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  lead_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  deletion_reason text NOT NULL CHECK (deletion_reason IN ('duplicate', 'test', 'internal', 'other')),
  notes text,
  deleted_by uuid NOT NULL,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_deletions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and supervisors can view deletion logs"
  ON public.lead_deletions FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

CREATE POLICY "Admins and supervisors can insert deletion logs"
  ON public.lead_deletions FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

-- Allow admins/supervisors to delete leads
CREATE POLICY "Admins and supervisors can delete leads"
  ON public.leads FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

-- Allow cascade cleanup on related tables
CREATE POLICY "Admins and supervisors can delete activity"
  ON public.lead_activity FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

CREATE POLICY "Admins and supervisors can delete notes"
  ON public.lead_notes FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

CREATE POLICY "Admins and supervisors can delete status history"
  ON public.lead_status_history FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

CREATE POLICY "Admins and supervisors can delete attachments"
  ON public.lead_attachments FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));

CREATE POLICY "Admins and supervisors can delete analyses"
  ON public.itinerary_analysis FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'team_supervisor'));
