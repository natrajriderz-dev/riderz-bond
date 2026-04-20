-- Confirm the specific user's email so they can log in
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'natzridz@gmail.com';

-- Promote them to super admin
INSERT INTO public.admin_users (user_id, role)
SELECT id, 'super_admin' FROM auth.users WHERE email = 'natzridz@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
