-- =============================================
-- FormCheck — Hardening (005)
-- - GRANT EXECUTE for get_shared_link_by_token
-- - SET search_path on handle_new_user
-- =============================================

-- Explicitly grant execution rights to anon and authenticated roles.
-- Without this, default privileges may vary across Supabase environments.
REVOKE ALL ON FUNCTION public.get_shared_link_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_shared_link_by_token(TEXT) TO anon, authenticated;

-- Harden the handle_new_user function by fixing the search_path
-- to prevent search_path injection attacks on SECURITY DEFINER functions.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
