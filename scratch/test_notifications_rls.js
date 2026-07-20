const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// ── Parser .env.local ──────────────────────────────────────────────────────────
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const supabaseUrl     = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseService = env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseService) {
  console.error('Variables d\'environnement manquantes dans .env.local');
  process.exit(1);
}

// ── Clients ───────────────────────────────────────────────────────────────────
// Admin : service key → bypass RLS (création comptes, setup données de test)
const admin = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Factory : client utilisateur avec JWT Bearer réel
// Méthode : signInWithPassword → JWT role:authenticated → Authorization header
// PostgREST évalue auth.uid() depuis ce JWT. Pas de SET ROLE.
function makeClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth:   { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

async function signIn(email, password) {
  const { data, error } = await admin.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
  return makeClient(data.session.access_token);
}

// ── Helpers de log ────────────────────────────────────────────────────────────
const ok      = (label, detail = {}) => { console.log(`  ✅ ${label}`); return { result: 'PASS', ...detail }; };
const fail    = (label, err)         => { console.log(`  ❌ ${label} — ${err}`); return { result: 'FAIL', error: err }; };
const blocked = (label, err)         => { console.log(`  🛑 ${label}`); return { result: 'BLOCKED_AS_EXPECTED', rls_error: err }; };

// ── Test principal ─────────────────────────────────────────────────────────────
async function run() {
  const ts = Date.now();
  const pw = 'TestPassword123!';
  const emails = {
    A: `test_notif_a_${ts}@example.com`,
    B: `test_notif_b_${ts}@example.com`,
  };

  // ── Création des comptes de test ──────────────────────────────────────────
  console.log('══ Création des utilisateurs de test ══');
  const { data: dA } = await admin.auth.admin.createUser({ email: emails.A, password: pw, email_confirm: true });
  const { data: dB } = await admin.auth.admin.createUser({ email: emails.B, password: pw, email_confirm: true });
  const [userA, userB] = [dA.user, dB.user];
  console.log(`  A: ${userA.id}\n  B: ${userB.id}`);
  console.log('  Attente triggers (2s)...');
  await new Promise(r => setTimeout(r, 2000));

  // ── Authentification ──────────────────────────────────────────────────────
  console.log('\n══ Authentification des clients JWT ══');
  const clientA = await signIn(emails.A, pw);
  const clientB = await signIn(emails.B, pw);
  console.log('  Clients A et B prêts (JWT role:authenticated).');

  const results = {};

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 1 : Insertion légitime (doit réussir)
  // A notifie B avec type et platform valides.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 1 : Insertion légitime (A → B, type follow, platform cm_studio) ══');
  const { error: errS1 } = await clientA.from('notifications').insert({
    user_id:    userB.id,
    type:       'follow',
    title:      'Test follow',
    message:    'A a commencé à suivre B.',
    action_url: '/profile/test',
    platform:   'cm_studio',
    is_read:    false
  });
  results['1_insert_legitime'] = errS1
    ? fail('RLS a bloqué un insert légitime', errS1.message)
    : ok('A a notifié B avec succès');

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 2 : Type forgé → 'system' (doit échouer)
  // Simule une attaque : un client tente d'insérer une notification système.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 2 : Type forgé (type: \'system\') ══');
  const { error: errS2 } = await clientA.from('notifications').insert({
    user_id:    userB.id,
    type:       'system',
    title:      'Faux système',
    message:    'Message système forgé.',
    action_url: '/admin',
    platform:   'cm_studio',
    is_read:    false
  });
  results['2_type_forge'] = errS2
    ? blocked('RLS a bloqué le type system', errS2.message)
    : fail('FAILLE — type system accepté par RLS', 'Aucune erreur');

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 3 : Platform forgée (doit échouer)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 3 : Platform forgée (platform: \'facebook\') ══');
  const { error: errS3 } = await clientA.from('notifications').insert({
    user_id:    userB.id,
    type:       'like',
    title:      'Fausse notif Facebook',
    message:    'Notif avec platform forgée.',
    action_url: '/home',
    platform:   'facebook',
    is_read:    false
  });
  results['3_platform_forgee'] = errS3
    ? blocked('RLS a bloqué la platform facebook', errS3.message)
    : fail('FAILLE — platform facebook acceptée par RLS', 'Aucune erreur');

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 4 : Auto-notification (user_id = auth.uid() → doit échouer)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 4 : Auto-notification (user_id = propre id de A) ══');
  const { error: errS4 } = await clientA.from('notifications').insert({
    user_id:    userA.id,  // A essaie de se notifier lui-même
    type:       'like',
    title:      'Auto-notif',
    message:    'Auto-notification forgée.',
    action_url: '/home',
    platform:   'cm_studio',
    is_read:    false
  });
  results['4_auto_notification'] = errS4
    ? blocked('RLS a bloqué l\'auto-notification', errS4.message)
    : fail('FAILLE — auto-notification acceptée par RLS', 'Aucune erreur');

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 5 : Lecture des notifications d'autrui (fuite org → doit échouer)
  // Admin insère une notification pour A directement (bypass RLS).
  // B tente de lire les notifications de A → doit retourner 0 lignes.
  // (Avant le fix, la policy SELECT avec is_org_member permettait à B de
  //  voir les notifs de A s'ils étaient dans la même organisation.)
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 5 : B tente de lire les notifications de A ══');
  // Admin insère une notification test pour A (bypass RLS, pour avoir quelque chose à lire)
  const { data: adminNotif } = await admin.from('notifications').insert({
    user_id:    userA.id,
    type:       'system',
    title:      'Notif secrète de A',
    message:    'B ne devrait pas voir ceci.',
    action_url: '/home',
    platform:   'cm_studio',
    is_read:    false
  }).select('id').single();

  // B tente de SELECT toutes les notifications de A
  const { data: leakData, error: errS5 } = await clientB
    .from('notifications')
    .select('id, user_id, title')
    .eq('user_id', userA.id);

  const leakCount = leakData?.length ?? 0;
  if (leakCount === 0 && !errS5) {
    results['5_fuite_select_autre'] = ok('B n\'a vu aucune notification de A (0 lignes retournées)');
    results['5_fuite_select_autre'].rows_returned = 0;
  } else if (errS5) {
    // Une erreur RLS explicite est aussi acceptable (selon le mode de rejet de Supabase)
    results['5_fuite_select_autre'] = blocked('RLS a renvoyé une erreur explicite', errS5.message);
  } else {
    results['5_fuite_select_autre'] = fail(
      `FUITE — B a lu ${leakCount} notification(s) de A`,
      JSON.stringify(leakData)
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 6 : Lecture de ses propres notifications (doit réussir)
  // A lit ses propres notifications → doit voir la notif insérée par admin.
  // ─────────────────────────────────────────────────────────────────────────
  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 6 : Lecture de ses propres notifications (doit réussir avec données réelles)
  // B insère une notification légitime POUR A (type: 'follow', platform: 'cm_studio').
  // A lit ensuite ses propres notifications — doit retourner >= 1 ligne avec
  // le contenu réel (type, user_id, title) pour prouver que la policy SELECT
  // fonctionne sur des données existantes, pas juste un SELECT vide.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 6 : A lit ses propres notifications (données réelles) ══');

  // Étape 6a : B insère une notification pour A (insert légitime, côté B)
  const { error: errS6Insert } = await clientB.from('notifications').insert({
    user_id:    userA.id,       // destinataire = A
    type:       'follow',
    title:      'Nouvel abonné',
    message:    'B a commencé à suivre A.',
    action_url: `/profile/${userB.id}`,
    platform:   'cm_studio',
    is_read:    false
  });

  if (errS6Insert) {
    results['6_lecture_propres'] = fail(
      'Précondition échouée : B n\'a pas pu insérer une notification pour A',
      errS6Insert.message
    );
  } else {
    // Étape 6b : A lit ses propres notifications — RLS restreint à user_id = auth.uid()
    const { data: ownNotifs, error: errS6Read } = await clientA
      .from('notifications')
      .select('id, user_id, type, title, message, platform, is_read');

    const ownCount = ownNotifs?.length ?? 0;

    if (errS6Read) {
      results['6_lecture_propres'] = fail('Erreur lors du SELECT par A', errS6Read.message);
    } else if (ownCount === 0) {
      results['6_lecture_propres'] = fail(
        'A n\'a lu aucune notification malgré l\'insertion préalable par B',
        '0 lignes retournées — policy SELECT potentiellement défaillante'
      );
    } else {
      results['6_lecture_propres'] = ok(
        `A a lu ${ownCount} notification(s) qui lui appartiennent`,
        {
          rows_returned: ownCount,
          notifications: ownNotifs   // données brutes complètes pour validation
        }
      );
      console.log(`  Contenu de la notification : type=${ownNotifs[0].type}, user_id=${ownNotifs[0].user_id}, title="${ownNotifs[0].title}"`);
    }
  }

  // ── Résumé ─────────────────────────────────────────────────────────────
  console.log('\n══════════════ RÉSULTATS BRUTS ══════════════');
  console.log(JSON.stringify(results, null, 2));
  console.log('═════════════════════════════════════════════');

  const allPass =
    results['1_insert_legitime']?.result    === 'PASS' &&
    results['2_type_forge']?.result         === 'BLOCKED_AS_EXPECTED' &&
    results['3_platform_forgee']?.result    === 'BLOCKED_AS_EXPECTED' &&
    results['4_auto_notification']?.result  === 'BLOCKED_AS_EXPECTED' &&
    results['5_fuite_select_autre']?.result !== 'FAIL' &&
    results['6_lecture_propres']?.result    === 'PASS';

  console.log(`\n${allPass
    ? '✅ TOUS LES SCÉNARIOS VALIDES — RLS notifications correctement sécurisée.'
    : '❌ AU MOINS UN SCÉNARIO A ÉCHOUÉ.'}`);

  // ── Nettoyage ──────────────────────────────────────────────────────────
  console.log('\n══ Nettoyage ══');
  await admin.auth.admin.deleteUser(userA.id);
  await admin.auth.admin.deleteUser(userB.id);
  console.log('  Utilisateurs de test supprimés.');
}

run().catch(err => { console.error('Erreur fatale:', err); process.exit(1); });
