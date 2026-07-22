-- Index manquants identifiés lors de l'audit de performance

-- analytics(post_id) — requêtes IN post_id dans le dashboard posts
CREATE INDEX IF NOT EXISTS analytics_post_id ON public.analytics (post_id);

-- social_accounts(organization_id, platform) — remplace l'ancien index sur user_id,
-- supprimé lors de la migration multi-org (étape 2 : DROP COLUMN user_id).
-- L'index partiel sur is_active couvre le flow de publication sans dupliquer
-- la contrainte UNIQUE (organization_id, platform, platform_user_id).
-- Note : pas de DROP INDEX sur l'ancien nom (social_accounts_user_active) nécessaire —
-- la migration n'avait jamais pu s'exécuter, donc cet index n'existe pas en base.
CREATE INDEX IF NOT EXISTS social_accounts_org_active
  ON public.social_accounts (organization_id, platform)
  WHERE is_active = true;

-- posts(user_id, scheduled_at) — requêtes du cron pour les posts à publier.
-- user_id est conservé sur posts comme auteur (non supprimé par la migration multi-org).
CREATE INDEX IF NOT EXISTS posts_user_scheduled
  ON public.posts (user_id, scheduled_at)
  WHERE status = 'scheduled';

-- subscriptions(organization_id) — lookup par org pour les webhooks Stripe.
-- Après migration multi-org, user_id a été remplacé par organization_id
-- sans qu'aucun index ne soit créé sur cette colonne (seule la PK existait).
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions (organization_id);
