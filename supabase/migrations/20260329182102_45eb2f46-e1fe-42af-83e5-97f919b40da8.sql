
-- Function to bootstrap first admin (only works if no admin exists)
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only assign admin if no admin exists yet
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT DO NOTHING;
    RETURN true;
  END IF;
  RETURN false;
END;
$$;

-- Function to check if any admin exists (callable by anon for setup page gating)
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
