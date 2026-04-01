INSERT INTO public.profiles (user_id, full_name, status)
VALUES ('16b27648-73e6-468e-8d87-6b48a406ce1a', 'Akash Dahiya', 'active')
ON CONFLICT DO NOTHING;