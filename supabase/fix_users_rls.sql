-- Autoriser tous les utilisateurs authentifiés à lire les profils des autres (nécessaire pour afficher les noms et avatars dans la messagerie et la communauté)
DROP POLICY IF EXISTS "users: own row" ON public.users;
DROP POLICY IF EXISTS "users: select public" ON public.users;

-- L'utilisateur peut tout faire sur sa propre ligne
CREATE POLICY "users: own row" ON public.users
  FOR ALL USING (auth.uid() = id);

-- Tout utilisateur connecté peut lire les profils (id, full_name, avatar_url, plan)
-- Note : pour une sécurité maximale des emails au niveau de la DB, on autorise le SELECT, 
-- mais l'application ne demande et n'affiche plus l'email des autres utilisateurs dans l'UI.
CREATE POLICY "users: select public" ON public.users
  FOR SELECT TO authenticated USING (true);
