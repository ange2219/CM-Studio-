-- Correction des politiques RLS de 'notifications' pour supporter les notifications personnelles globales et organisationnelles

-- 1. Supprimer les politiques existantes restrictives
DROP POLICY IF EXISTS "notifications: select" ON public.notifications;
DROP POLICY IF EXISTS "notifications: write" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;

-- 2. Politique SELECT : visible par le destinataire (user_id = auth.uid()) OU si membre de l'organisation
CREATE POLICY "notifications: select" ON public.notifications
  FOR SELECT USING (
    (auth.uid() = user_id)
    OR
    (organization_id IS NOT NULL AND is_org_member(organization_id))
  );

-- 3. Politique INSERT : tout utilisateur peut notifier un autre utilisateur (ex: j'aime, commentaire)
CREATE POLICY "notifications: insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 4. Politiques UPDATE / DELETE : par le destinataire ou si membre de l'organisation
CREATE POLICY "notifications: update" ON public.notifications
  FOR UPDATE USING (
    (auth.uid() = user_id)
    OR
    (organization_id IS NOT NULL AND is_org_member(organization_id))
  );

CREATE POLICY "notifications: delete" ON public.notifications
  FOR DELETE USING (
    (auth.uid() = user_id)
    OR
    (organization_id IS NOT NULL AND is_org_member(organization_id))
  );
