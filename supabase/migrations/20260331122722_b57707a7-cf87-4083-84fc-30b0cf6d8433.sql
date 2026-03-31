
CREATE OR REPLACE FUNCTION public.upsert_lead_with_dedup(
  _full_name text,
  _email text DEFAULT NULL,
  _mobile_number text DEFAULT NULL,
  _company_name text DEFAULT NULL,
  _message text DEFAULT NULL,
  _audience_type audience_type DEFAULT NULL,
  _lead_source_page text DEFAULT NULL,
  _lead_source_type lead_source_type DEFAULT NULL,
  _quote_file_url text DEFAULT NULL,
  _quote_file_name text DEFAULT NULL,
  _quote_amount numeric DEFAULT NULL,
  _city text DEFAULT NULL,
  _destination_type text DEFAULT NULL,
  _detected_trip_type text DEFAULT 'unknown',
  _emi_flag boolean DEFAULT false,
  _insurance_flag boolean DEFAULT false,
  _pg_flag boolean DEFAULT false,
  _website_url text DEFAULT NULL,
  _metadata_json jsonb DEFAULT '{}'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _existing_id uuid;
  _result_id uuid;
  _is_duplicate boolean := false;
  _cutoff timestamptz := now() - interval '24 hours';
  _assignee uuid;
BEGIN
  -- Check for duplicate by mobile within 24h
  IF _mobile_number IS NOT NULL AND _mobile_number <> '' THEN
    SELECT id INTO _existing_id
    FROM public.leads
    WHERE mobile_number = _mobile_number
      AND created_at >= _cutoff
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  -- Check for duplicate by email within 24h
  IF _existing_id IS NULL AND _email IS NOT NULL AND _email <> '' THEN
    SELECT id INTO _existing_id
    FROM public.leads
    WHERE email = _email
      AND created_at >= _cutoff
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;

  IF _existing_id IS NOT NULL THEN
    -- Merge into existing lead
    UPDATE public.leads SET
      message = COALESCE(_message, message),
      notes = COALESCE('[Re-submission from ' || COALESCE(_lead_source_page, 'website') || '] ' || COALESCE(_message, ''), notes),
      quote_file_url = COALESCE(_quote_file_url, quote_file_url),
      quote_file_name = COALESCE(_quote_file_name, quote_file_name),
      company_name = COALESCE(company_name, _company_name),
      updated_at = now()
    WHERE id = _existing_id;

    -- Log resubmission activity
    INSERT INTO public.lead_activity (lead_id, activity_type, description)
    VALUES (
      _existing_id,
      'resubmission',
      'Duplicate submission within 24h from ' || COALESCE(_lead_source_page, 'website') || ' (' || COALESCE(_lead_source_type::text, 'unknown') || '). Merged into existing lead.'
    );

    _result_id := _existing_id;
    _is_duplicate := true;
  ELSE
    -- Auto-assign: pick supervisor/admin with fewest open leads
    SELECT ur.user_id INTO _assignee
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id AND p.status = 'active'
    WHERE ur.role IN ('team_supervisor', 'admin', 'super_admin')
    ORDER BY (
      SELECT count(*) FROM public.leads l
      WHERE l.assigned_to = ur.user_id
        AND l.status NOT IN ('converted', 'closed_lost')
    ) ASC
    LIMIT 1;

    _result_id := gen_random_uuid();
    INSERT INTO public.leads (
      id, full_name, email, mobile_number, company_name, message,
      audience_type, lead_source_page, lead_source_type,
      quote_file_url, quote_file_name, quote_amount,
      city, destination_type, detected_trip_type,
      emi_flag, insurance_flag, pg_flag, website_url, metadata_json,
      assigned_to
    ) VALUES (
      _result_id, _full_name, _email, _mobile_number, _company_name, _message,
      _audience_type, _lead_source_page, _lead_source_type,
      _quote_file_url, _quote_file_name, _quote_amount,
      _city, _destination_type, _detected_trip_type,
      _emi_flag, _insurance_flag, _pg_flag, _website_url, _metadata_json,
      _assignee
    );

    _is_duplicate := false;
  END IF;

  RETURN jsonb_build_object('id', _result_id, 'is_duplicate', _is_duplicate);
END;
$$;
