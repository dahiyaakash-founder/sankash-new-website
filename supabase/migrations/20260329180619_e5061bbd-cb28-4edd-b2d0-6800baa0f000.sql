
-- Add priority enum
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Add stage enum
CREATE TYPE public.lead_stage AS ENUM ('new', 'reviewed', 'contacted', 'qualified', 'follow_up_scheduled', 'in_progress', 'won', 'lost', 'archived');

-- Add columns to leads
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS priority public.lead_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS stage public.lead_stage DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS last_contacted_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS quote_amount numeric,
  ADD COLUMN IF NOT EXISTS estimated_savings_percent numeric,
  ADD COLUMN IF NOT EXISTS estimated_savings_amount numeric,
  ADD COLUMN IF NOT EXISTS emi_tenure text,
  ADD COLUMN IF NOT EXISTS detected_trip_type text DEFAULT 'unknown';

-- Lead notes table
CREATE TABLE public.lead_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  note_text text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view notes" ON public.lead_notes
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'));

CREATE POLICY "Team members can insert notes" ON public.lead_notes
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'));

-- Lead status history table
CREATE TABLE public.lead_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view history" ON public.lead_status_history
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'));

CREATE POLICY "Team members can insert history" ON public.lead_status_history
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member'));
