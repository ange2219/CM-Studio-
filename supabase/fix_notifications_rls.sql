-- ══════════════════════════════════════════════════════════════════════════════
-- fix_notifications_rls.sql
-- Correction des policies RLS sur la table notifications
--
-- Failles corrigées :
--   1. INSERT WITH CHECK (true) → forge de notification et usurpation possibles
--      (type forgé, platform forgée, auto-notification)
--   2. SELECT USING is_org_member → lecture des notifications privées d'autrui
--      par tout membre de la même organisation
--
-- Ce qui continue de fonctionner sans changement :
--   - Les 5 inserts de CommunityFeed.tsx (follow, like, comment, comment_reply)
--   - Le trigger check_group_unlocks (SECURITY DEFINER → bypass RLS)
--   - Les webhooks Facebook/debug (service key → bypass RLS)
-- ══════════════════════════════════════════════════════════════════════════════

-- ── 1. NETTOYAGE EXHAUSTIF (tous les noms de policies ayant existé) ───────────
DROP POLICY IF EXISTS "notifications_select"    ON public.notifications;
DROP POLICY IF EXISTS "notifications_update"    ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert"    ON public.notifications;
DROP POLICY IF EXISTS "notifications: select"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: write"    ON public.notifications;
DROP POLICY IF EXISTS "notifications: insert"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: update"   ON public.notifications;
DROP POLICY IF EXISTS "notifications: delete"   ON public.notifications;

-- ── 2. SELECT : uniquement le destinataire voit ses propres notifications ──────
-- Supprime le OR is_org_member(organization_id) qui exposait les notifications
-- de tous les membres d'une organisation à chacun de ses membres.
CREATE POLICY "notifications: select" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- ── 3. INSERT : client peut notifier autrui, mais strictement encadré ──────────
-- Conditions :
--   a) auth.uid() IS NOT NULL  → seul un utilisateur authentifié peut insérer
--   b) user_id <> auth.uid()   → on ne peut pas s'auto-notifier
--   c) type IN (...)           → uniquement les 4 types légitimes du frontend
--                                 ('system' réservé aux triggers SECURITY DEFINER
--                                  qui bypassent RLS — pas besoin de l'inclure)
--   d) platform = 'cm_studio'  → les webhooks Facebook/debug passent par le
--                                 service key (bypass RLS) et n'utilisent pas
--                                 cette policy
CREATE POLICY "notifications: insert" ON public.notifications
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id <> auth.uid()
    AND type IN ('follow', 'like', 'comment', 'comment_reply')
    AND platform = 'cm_studio'
  );

-- ── 4. UPDATE : uniquement le destinataire (ex: marquer comme lu) ─────────────
CREATE POLICY "notifications: update" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ── 5. DELETE : uniquement le destinataire ─────────────────────────────────────
CREATE POLICY "notifications: delete" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ── 6. VÉRIFICATION ───────────────────────────────────────────────────────────
SELECT policyname, cmd, permissive, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'notifications'
ORDER BY cmd, policyname;
