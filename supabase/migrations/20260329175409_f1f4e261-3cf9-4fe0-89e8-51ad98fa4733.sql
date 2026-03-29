
-- Create enums for lead status and outcome
CREATE TYPE public.lead_status AS ENUM (
  'new', 'contacted', 'qualified', 'waiting_for_customer',
  'demo_scheduled', 'sandbox_issued', 'production_review',
  'converted', 'closed_lost'
);

CREATE TYPE public.lead_outcome AS ENUM ('open', 'won', 'lost');

CREATE TYPE public.lead_source_type AS ENUM (
  'contact_form', 'traveler_quote_unlock', 'agent_quote_review',
  'sandbox_access_request', 'production_access_request',
  'demo_request', 'support_request', 'integration_query'
);

CREATE TYPE public.audience_type AS ENUM (
  'traveler', 'agent', 'developer', 'partner', 'other'
);

CREATE TYPE public.app_role AS ENUM ('admin', 'team_member');

-- Create user_roles table (separate from profiles per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'team_member',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS: only admins/team_members can see roles
CREATE POLICY "Authenticated users can view roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  lead_source_page TEXT,
  lead_source_type lead_source_type,
  audience_type audience_type,
  full_name TEXT NOT NULL,
  mobile_number TEXT,
  email TEXT,
  company_name TEXT,
  city TEXT,
  message TEXT,
  quote_file_url TEXT,
  quote_file_name TEXT,
  quote_validation_status TEXT,
  destination_type TEXT,
  emi_flag BOOLEAN DEFAULT false,
  insurance_flag BOOLEAN DEFAULT false,
  pg_flag BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id),
  status lead_status NOT NULL DEFAULT 'new',
  next_follow_up_at TIMESTAMPTZ,
  notes TEXT,
  outcome lead_outcome NOT NULL DEFAULT 'open',
  metadata_json JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS: Only authenticated internal users with a role can access leads
CREATE POLICY "Team members can view all leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member')
  );

CREATE POLICY "Team members can insert leads"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member')
  );

CREATE POLICY "Team members can update leads"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'team_member')
  );

-- Allow anonymous inserts for website form submissions
CREATE POLICY "Public can insert leads"
  ON public.leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for quote files
INSERT INTO storage.buckets (id, name, public) VALUES ('quote-files', 'quote-files', true);

CREATE POLICY "Anyone can upload quote files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'quote-files');

CREATE POLICY "Anyone can view quote files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'quote-files');

-- Indexes for common queries
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_source_type ON public.leads(lead_source_type);
CREATE INDEX idx_leads_audience ON public.leads(audience_type);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX idx_leads_follow_up ON public.leads(next_follow_up_at);
