-- =============================================
-- FormCheck — Trainer can read assigned members' body_logs (006)
-- SELECT only; INSERT/UPDATE/DELETE remain owner-only via body_logs_all
-- =============================================

CREATE POLICY "trainer_read_member_body_logs" ON public.body_logs
  FOR SELECT USING (
    user_id IN (
      SELECT p.user_id FROM public.profiles p WHERE p.trainer_id = auth.uid()
    )
  );
