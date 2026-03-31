
-- Lead attachments table
CREATE TABLE public.lead_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  file_size bigint,
  category text NOT NULL DEFAULT 'unknown',
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  parsed_text_excerpt text
);

ALTER TABLE public.lead_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view attachments" ON public.lead_attachments
  FOR SELECT TO authenticated USING (public.is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert attachments" ON public.lead_attachments
  FOR INSERT TO authenticated WITH CHECK (public.is_ops_member(auth.uid()));

CREATE POLICY "Anon can insert attachments" ON public.lead_attachments
  FOR INSERT TO anon WITH CHECK (true);

-- Lead activity table (comprehensive activity log)
CREATE TABLE public.lead_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  activity_type text NOT NULL,
  description text NOT NULL,
  old_value text,
  new_value text,
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ops members can view activity" ON public.lead_activity
  FOR SELECT TO authenticated USING (public.is_ops_member(auth.uid()));

CREATE POLICY "Ops members can insert activity" ON public.lead_activity
  FOR INSERT TO authenticated WITH CHECK (public.is_ops_member(auth.uid()));

CREATE POLICY "Anon can insert activity" ON public.lead_activity
  FOR INSERT TO anon WITH CHECK (true);

-- Add supervisor_id to profiles for reporting structure
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supervisor_id uuid;

-- Create lead-attachments storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('lead-attachments', 'lead-attachments', true);

-- Storage RLS for lead-attachments bucket
CREATE POLICY "Anyone can upload lead attachments" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'lead-attachments');

CREATE POLICY "Anyone can view lead attachments" ON storage.objects
  FOR SELECT USING (bucket_id = 'lead-attachments');
