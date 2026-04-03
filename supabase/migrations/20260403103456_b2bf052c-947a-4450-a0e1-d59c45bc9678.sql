
-- Helper: check if a user supervises another user (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_supervisor_of(_supervisor_id uuid, _member_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = _member_id
      AND supervisor_id = _supervisor_id
  )
$$;

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Ops members can view roles" ON public.user_roles;

-- New policy: own row, admin/super_admin see all, supervisors see direct reports
CREATE POLICY "Ops members can view roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR is_supervisor_of(auth.uid(), user_id)
);
