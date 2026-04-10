-- Clean up E2E test data
DELETE FROM public.trip_outcome_learning_queue WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.trip_post_analysis_enrichment_queue WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.trip_intelligence_refresh_queue WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.lead_trip_outcomes WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.lead_trip_intent_signals WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.trip_market_memory WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.lead_ops_copilot WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.lead_trip_brains WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.itinerary_analysis WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.lead_activity WHERE lead_id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';
DELETE FROM public.leads WHERE id = '87b580c0-e164-42fd-b3e3-f9be30abba1c';