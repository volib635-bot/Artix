-- ============================================================================
-- Enforce Plan Tier Limits at Database Level (Triggers)
-- SEC-07: Prevents direct SQL/API bypass of client-side plan limits
-- ============================================================================

-- Function to check tier limit before inserting a new row
CREATE OR REPLACE FUNCTION public.check_plan_tier_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_plan TEXT;
  current_count INT;
BEGIN
  -- Get user's active plan tier
  SELECT COALESCE(plan_tier, 'free') INTO user_plan
  FROM public.subscriptions
  WHERE user_id = NEW.user_id;

  -- Pro tier has no limits on documents or system_designs, and high limit on projects
  IF user_plan = 'pro' THEN
    IF TG_TABLE_NAME = 'projects' THEN
      SELECT COUNT(*) INTO current_count FROM public.projects WHERE user_id = NEW.user_id;
      IF current_count >= 100 THEN
        RAISE EXCEPTION 'Pro tier project limit (100) reached.';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  -- Free Tier Limit Checks
  IF TG_TABLE_NAME = 'projects' THEN
    SELECT COUNT(*) INTO current_count FROM public.projects WHERE user_id = NEW.user_id;
    IF current_count >= 3 THEN
      RAISE EXCEPTION 'Free tier project limit (3) reached. Upgrade to Pro for more.';
    END IF;
  ELSIF TG_TABLE_NAME = 'documents' THEN
    SELECT COUNT(*) INTO current_count FROM public.documents WHERE user_id = NEW.user_id;
    IF current_count >= 10 THEN
      RAISE EXCEPTION 'Free tier document limit (10) reached. Upgrade to Pro for unlimited documents.';
    END IF;
  ELSIF TG_TABLE_NAME = 'system_designs' THEN
    SELECT COUNT(*) INTO current_count FROM public.system_designs WHERE user_id = NEW.user_id;
    IF current_count >= 3 THEN
      RAISE EXCEPTION 'Free tier system design limit (3) reached. Upgrade to Pro for unlimited designs.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach triggers to target tables
DROP TRIGGER IF EXISTS trigger_enforce_project_limit ON public.projects;
CREATE TRIGGER trigger_enforce_project_limit
  BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.check_plan_tier_limit();

DROP TRIGGER IF EXISTS trigger_enforce_document_limit ON public.documents;
CREATE TRIGGER trigger_enforce_document_limit
  BEFORE INSERT ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.check_plan_tier_limit();

DROP TRIGGER IF EXISTS trigger_enforce_design_limit ON public.system_designs;
CREATE TRIGGER trigger_enforce_design_limit
  BEFORE INSERT ON public.system_designs
  FOR EACH ROW EXECUTE FUNCTION public.check_plan_tier_limit();
