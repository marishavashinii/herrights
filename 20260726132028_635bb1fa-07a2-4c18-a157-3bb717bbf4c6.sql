
-- Restrict SECURITY DEFINER functions from being callable from the API
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role stays callable by authenticated (needed for RLS via SQL) — that is intentional.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Add lightweight sanity checks so the insert policies are not raw "true"
DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback" ON public.feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(message) BETWEEN 1 AND 5000
    AND length(name) BETWEEN 1 AND 200
    AND length(email) BETWEEN 3 AND 320
  );

DROP POLICY IF EXISTS "Anyone log search" ON public.search_logs;
CREATE POLICY "Anyone log search" ON public.search_logs
  FOR INSERT TO anon, authenticated
  WITH CHECK (length(query) BETWEEN 1 AND 2000);
