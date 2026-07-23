-- Migration: Grant lifetime Pro tier access to admin user
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'volij00635@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (user_id, plan_tier, status, billing_cycle, current_period_end)
    VALUES (v_user_id, 'pro', 'active', 'annual', '2099-12-31 23:59:59+00')
    ON CONFLICT (user_id) DO UPDATE SET
      plan_tier = 'pro',
      status = 'active',
      billing_cycle = 'annual',
      current_period_end = '2099-12-31 23:59:59+00',
      updated_at = now();
  END IF;
END $$;
