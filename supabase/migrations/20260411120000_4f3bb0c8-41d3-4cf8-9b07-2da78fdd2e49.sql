alter table public.lead_trip_brains
  add column if not exists pain_signals_json jsonb not null default '[]'::jsonb,
  add column if not exists pleasure_signals_json jsonb not null default '[]'::jsonb,
  add column if not exists customer_conversion_json jsonb not null default '{}'::jsonb,
  add column if not exists optional_missing_prompts_json jsonb not null default '[]'::jsonb,
  add column if not exists inspiration_capture_json jsonb not null default '{}'::jsonb;

alter table public.lead_ops_copilot
  add column if not exists lead_mode text,
  add column if not exists immediate_next_action_json jsonb not null default '{}'::jsonb,
  add column if not exists first_question_to_ask text,
  add column if not exists blocking_missing_input_json jsonb not null default '{}'::jsonb,
  add column if not exists important_missing_items_json jsonb not null default '[]'::jsonb,
  add column if not exists travel_read text,
  add column if not exists sankash_read text,
  add column if not exists why_the_system_thinks_this_json jsonb not null default '[]'::jsonb;

alter table public.trip_market_memory
  add column if not exists pain_signals_json jsonb not null default '[]'::jsonb,
  add column if not exists pleasure_signals_json jsonb not null default '[]'::jsonb,
  add column if not exists customer_conversion_json jsonb not null default '{}'::jsonb,
  add column if not exists optional_missing_prompts_json jsonb not null default '[]'::jsonb,
  add column if not exists inspiration_capture_json jsonb not null default '{}'::jsonb;
