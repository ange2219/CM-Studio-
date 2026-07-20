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

// ── Client Admin (bypasse RLS, uniquement pour créer/nettoyer les comptes) ────
const admin = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ── Factory : client utilisateur via JWT Bearer réel ──────────────────────────
// Méthode : signInWithPassword → JWT réel avec role:authenticated → Authorization header
// PostgREST évalue auth.uid() et auth.role() depuis ce JWT. Pas de SET ROLE.
function makeClient(accessToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth:   { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });
}

async function signIn(email, password) {
  const { data, error } = await admin.auth.signInWithPassword({ email, password });
  if (error || !data.session) throw new Error(`Sign-in failed for ${email}: ${error?.message}`);
  return { client: makeClient(data.session.access_token), token: data.session.access_token };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const ok      = (label, detail = {}) => { console.log(`  ✅ ${label}`); return { result: 'PASS', ...detail }; };
const fail    = (label, err)         => { console.log(`  ❌ ${label} — ${err}`); return { result: 'FAIL', error: err }; };
const blocked = (label, err)         => { console.log(`  🛑 ${label}`); return { result: 'BLOCKED_AS_EXPECTED', rls_error: err }; };

// ── Test principal ─────────────────────────────────────────────────────────────
async function run() {
  const ts = Date.now();
  const pw = 'TestPassword123!';
  const emails = {
    A: `test_msg_a_${ts}@example.com`,
    B: `test_msg_b_${ts}@example.com`,
    M: `test_msg_m_${ts}@example.com`,
  };

  // ── Création des comptes de test ──────────────────────────────────────────
  console.log('══ Création des utilisateurs de test ══');
  const { data: dA } = await admin.auth.admin.createUser({ email: emails.A, password: pw, email_confirm: true });
  const { data: dB } = await admin.auth.admin.createUser({ email: emails.B, password: pw, email_confirm: true });
  const { data: dM } = await admin.auth.admin.createUser({ email: emails.M, password: pw, email_confirm: true });
  const [userA, userB, userM] = [dA.user, dB.user, dM.user];
  console.log(`  A: ${userA.id}\n  B: ${userB.id}\n  M: ${userM.id}`);
  console.log('  Attente triggers (2s)...');
  await new Promise(r => setTimeout(r, 2000));

  // ── Authentification ──────────────────────────────────────────────────────
  console.log('\n══ Authentification des clients JWT ══');
  const { client: clientA } = await signIn(emails.A, pw);
  const { client: clientM } = await signIn(emails.M, pw);
  console.log('  Clients A et M prêts (JWT role:authenticated confirmé).');

  const results = {};

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 1 : DM légitime via find_or_create_dm (doit réussir)
  // A crée un DM avec B. La fonction SECURITY DEFINER gère la création
  // de la conversation ET l'ajout des deux participants en interne.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 1 : DM légitime A→B via find_or_create_dm ══');
  const { data: convId_AB, error: errS1 } = await clientA.rpc('find_or_create_dm', { other_user_id: userB.id });
  if (convId_AB && !errS1) {
    results['1_dm_legitime'] = ok('find_or_create_dm a retourné une conversation', { conversation_id: convId_AB });
  } else {
    results['1_dm_legitime'] = fail('find_or_create_dm a échoué', errS1?.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 2 : Ajout d'un participant par un membre existant (doit réussir)
  // A crée un DM avec M via find_or_create_dm → A et M sont membres de convId_AM.
  // A (membre existant) tente d'ajouter B à convId_AM via INSERT direct.
  // → Teste Cas 2 de la policy : un membre existant peut ajouter quelqu'un.
  // Note : find_or_create_dm évite l'artefact RETURNING+SELECT (cause du
  //        blocage précédent sur INSERT direct dans conversations).
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 2 : A (membre) ajoute B à une conversation existante via INSERT direct ══');
  let convId_AM = null;
  const { data: dmAM, error: errAM } = await clientA.rpc('find_or_create_dm', { other_user_id: userM.id });
  if (dmAM && !errAM) {
    convId_AM = dmAM;
    console.log(`  DM A↔M créé : ${convId_AM}`);
    // A (déjà membre de convId_AM) ajoute B via INSERT direct sur conversation_participants
    const { error: errAddB } = await clientA.from('conversation_participants')
      .insert({ conversation_id: convId_AM, user_id: userB.id });
    if (!errAddB) {
      results['2_ajout_par_membre'] = ok('A (membre) a ajouté B avec succès');
    } else {
      results['2_ajout_par_membre'] = fail('RLS a bloqué A malgré son statut de membre', errAddB.message);
    }
  } else {
    results['2_ajout_par_membre'] = fail('find_or_create_dm A→M a échoué', errAM?.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 3 : Intrusion — M tente de s'auto-insérer dans convId_AB
  // M n'est PAS membre de convId_AB (seulement de convId_AM).
  // → Doit être bloqué par la policy (Cas 1 exige conversation vide ET self-insert,
  //   Cas 2 exige être déjà membre — aucune condition remplie).
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 3 : Intrusion — M tente de s\'auto-insérer dans conv A↔B ══');
  const { error: errS3 } = await clientM.from('conversation_participants')
    .insert({ conversation_id: convId_AB, user_id: userM.id });
  if (errS3) {
    results['3_intrusion_self_insert'] = blocked('RLS a bloqué M (auto-insert refusé)', errS3.message);
  } else {
    results['3_intrusion_self_insert'] = fail('FAILLE — M a réussi à s\'insérer', 'Aucune erreur RLS');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SCÉNARIO 4 : Intrusion — M tente d'insérer B dans convId_AB
  // M n'est pas membre de convId_AB → ne peut pas ajouter quelqu'un d'autre.
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n══ Scénario 4 : Intrusion — M tente d\'ajouter B dans conv A↔B ══');
  const { error: errS4 } = await clientM.from('conversation_participants')
    .insert({ conversation_id: convId_AB, user_id: userB.id });
  if (errS4) {
    results['4_intrusion_add_victim'] = blocked('RLS a bloqué M (ajout de victime refusé)', errS4.message);
  } else {
    results['4_intrusion_add_victim'] = fail('FAILLE — M a réussi à ajouter B', 'Aucune erreur RLS');
  }

  // ── Résumé ─────────────────────────────────────────────────────────────
  console.log('\n══════════════ RÉSULTATS BRUTS ══════════════');
  console.log(JSON.stringify(results, null, 2));
  console.log('═════════════════════════════════════════════');

  const allPass =
    results['1_dm_legitime']?.result         === 'PASS' &&
    results['2_ajout_par_membre']?.result    === 'PASS' &&
    results['3_intrusion_self_insert']?.result === 'BLOCKED_AS_EXPECTED' &&
    results['4_intrusion_add_victim']?.result  === 'BLOCKED_AS_EXPECTED';

  console.log(`\n${allPass
    ? '✅ TOUS LES SCÉNARIOS VALIDES — RLS messagerie correctement sécurisée.'
    : '❌ AU MOINS UN SCÉNARIO A ÉCHOUÉ.'}`);

  // ── Nettoyage ──────────────────────────────────────────────────────────
  console.log('\n══ Nettoyage ══');
  await admin.auth.admin.deleteUser(userA.id);
  await admin.auth.admin.deleteUser(userB.id);
  await admin.auth.admin.deleteUser(userM.id);
  console.log('  Utilisateurs de test supprimés.');
}

run().catch(err => { console.error('Erreur fatale:', err); process.exit(1); });
