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
const admin = createClient(supabaseUrl, supabaseService, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ── Helpers de log ────────────────────────────────────────────────────────────
const ok   = (label, detail = {}) => { console.log(`  ✅ ${label}`); return { result: 'PASS', ...detail }; };
const fail = (label, err)         => { console.log(`  ❌ ${label} — ${err}`); return { result: 'FAIL', error: String(err) }; };

// ── Attente (laisse le temps au trigger de s'exécuter dans la transaction) ────
const wait = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ── Lecture de la notification agrégée d'un post via admin (bypass RLS) ───────
async function getNotif(userId, type, postId) {
  const actionUrl = type === 'comment'
    ? `/home#post-${postId}-comments`
    : `/home#post-${postId}`;
  const { data, error } = await admin
    .from('notifications')
    .select('id, message, is_read, contributors, created_at')
    .eq('user_id', userId)
    .eq('type', type)
    .eq('action_url', actionUrl)
    .maybeSingle();
  if (error) throw new Error(`getNotif error: ${error.message}`);
  return data;
}

// ── Test principal ─────────────────────────────────────────────────────────────
async function run() {
  const ts = Date.now();
  const pw = 'TestPassword123!';

  const emails = {
    AUTHOR: `test_agg_author_${ts}@example.com`,
    L1:     `test_agg_liker1_${ts}@example.com`,
    L2:     `test_agg_liker2_${ts}@example.com`,
    L3:     `test_agg_liker3_${ts}@example.com`,
  };

  // ── Création des comptes de test ────────────────────────────────────────────
  console.log('══ Création des utilisateurs de test ══');
  const { data: dAuthor } = await admin.auth.admin.createUser({ email: emails.AUTHOR, password: pw, email_confirm: true });
  const { data: dL1 }     = await admin.auth.admin.createUser({ email: emails.L1,     password: pw, email_confirm: true });
  const { data: dL2 }     = await admin.auth.admin.createUser({ email: emails.L2,     password: pw, email_confirm: true });
  const { data: dL3 }     = await admin.auth.admin.createUser({ email: emails.L3,     password: pw, email_confirm: true });

  const userAuthor = dAuthor.user;
  const userL1     = dL1.user;
  const userL2     = dL2.user;
  const userL3     = dL3.user;

  console.log(`  AUTHOR : ${userAuthor.id}`);
  console.log(`  LIKER1 : ${userL1.id} (Alice)`);
  console.log(`  LIKER2 : ${userL2.id} (Bob)`);
  console.log(`  LIKER3 : ${userL3.id} (Carla)`);
  console.log('  Attente triggers post-création (2s)...');
  await wait(2000);

  // Mise à jour des full_name dans public.users (le trigger handle_new_user
  // crée la ligne ; on met à jour le nom pour que format_notification_message
  // trouve un full_name non-null)
  await admin.from('users').update({ full_name: 'Alice' }).eq('id', userL1.id);
  await admin.from('users').update({ full_name: 'Bob'   }).eq('id', userL2.id);
  await admin.from('users').update({ full_name: 'Carla' }).eq('id', userL3.id);
  await admin.from('users').update({ full_name: 'Post Author' }).eq('id', userAuthor.id);
  console.log('  full_name mis à jour dans public.users.');

  // ── Création du post de test ────────────────────────────────────────────────
  console.log('\n══ Création du post de test ══');
  const { data: post, error: postErr } = await admin
    .from('community_posts')
    .insert({ user_id: userAuthor.id, content: 'Post de test agrégation.' })
    .select('id')
    .single();

  if (postErr || !post) {
    console.error('Impossible de créer le post :', postErr?.message);
    await admin.auth.admin.deleteUser(userAuthor.id);
    await admin.auth.admin.deleteUser(userL1.id);
    await admin.auth.admin.deleteUser(userL2.id);
    await admin.auth.admin.deleteUser(userL3.id);
    process.exit(1);
  }
  const postId = post.id;
  console.log(`  Post créé : ${postId}`);

  const results = {};

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 1 : Premier like — Alice
  // → Crée une notification : "Alice a aimé votre publication."
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 1 : Premier like — Alice ══');
  const { error: errL1 } = await admin.from('community_likes').insert({ user_id: userL1.id, post_id: postId });
  await wait();

  if (errL1) {
    results['1_premier_like'] = fail('INSERT like Alice échoué', errL1.message);
  } else {
    const notif = await getNotif(userAuthor.id, 'like', postId);
    const expected = 'Alice a aimé votre publication.';
    console.log(`  message     : "${notif?.message}"`);
    console.log(`  contributors: ${JSON.stringify(notif?.contributors)}`);
    console.log(`  is_read     : ${notif?.is_read}`);
    if (!notif) {
      results['1_premier_like'] = fail('Notification introuvable', 'null');
    } else if (notif.message !== expected) {
      results['1_premier_like'] = fail('Message incorrect', `"${notif.message}" ≠ "${expected}"`);
    } else if (notif.is_read !== false) {
      results['1_premier_like'] = fail('is_read devrait être false', `is_read=${notif.is_read}`);
    } else {
      results['1_premier_like'] = ok('Message correct, is_read=false', { message: notif.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 2 : Deuxième like — Bob
  // → 1 seule notification mise à jour : "Alice et Bob ont aimé votre publication."
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 2 : Deuxième like — Bob ══');
  const { error: errL2 } = await admin.from('community_likes').insert({ user_id: userL2.id, post_id: postId });
  await wait();

  if (errL2) {
    results['2_deuxieme_like'] = fail('INSERT like Bob échoué', errL2.message);
  } else {
    const { data: all } = await admin.from('notifications')
      .select('id, message, contributors')
      .eq('user_id', userAuthor.id).eq('type', 'like').eq('action_url', `/home#post-${postId}`);
    const count = all?.length ?? 0;
    const notif = all?.[0];
    const expected = 'Alice et Bob ont aimé votre publication.';
    console.log(`  Nombre de notifications like : ${count} (attendu: 1)`);
    console.log(`  message : "${notif?.message}"`);
    if (count !== 1) {
      results['2_deuxieme_like'] = fail(`${count} notification(s) — doublon créé !`, '');
    } else if (notif.message !== expected) {
      results['2_deuxieme_like'] = fail('Message agrégé incorrect', `"${notif.message}" ≠ "${expected}"`);
    } else {
      results['2_deuxieme_like'] = ok('1 seule notif, message agrégé correct', { message: notif.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 3 : Troisième like — Carla
  // → "Alice, Bob et 1 autre ont aimé votre publication."
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 3 : Troisième like — Carla ══');
  const { error: errL3 } = await admin.from('community_likes').insert({ user_id: userL3.id, post_id: postId });
  await wait();

  if (errL3) {
    results['3_troisieme_like'] = fail('INSERT like Carla échoué', errL3.message);
  } else {
    const notif = await getNotif(userAuthor.id, 'like', postId);
    const expected = 'Alice, Bob et 1 autre ont aimé votre publication.';
    console.log(`  message      : "${notif?.message}"`);
    console.log(`  contributors : ${notif?.contributors?.length} entrées`);
    if (notif?.message === expected) {
      results['3_troisieme_like'] = ok('Format "N autres" correct', { message: notif.message });
    } else {
      results['3_troisieme_like'] = fail('Format "N autres" incorrect', `"${notif?.message}" ≠ "${expected}"`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 4 : Unlike — Bob se désaime
  // → contributors passe à [Alice, Carla]
  //   message : "Alice et Carla ont aimé votre publication."
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 4 : Unlike — Bob se désaime ══');
  const { error: errUnlikeBob } = await admin.from('community_likes')
    .delete().eq('user_id', userL2.id).eq('post_id', postId);
  await wait();

  if (errUnlikeBob) {
    results['4_unlike_bob'] = fail('DELETE like Bob échoué', errUnlikeBob.message);
  } else {
    const notif = await getNotif(userAuthor.id, 'like', postId);
    const expected = 'Alice et Carla ont aimé votre publication.';
    const bobStillPresent = notif?.contributors?.includes(userL2.id);
    console.log(`  message      : "${notif?.message}"`);
    console.log(`  contributors : ${JSON.stringify(notif?.contributors)}`);
    if (notif?.message !== expected) {
      results['4_unlike_bob'] = fail('Message incorrect après unlike', `"${notif?.message}" ≠ "${expected}"`);
    } else if (bobStillPresent) {
      results['4_unlike_bob'] = fail('Bob encore présent dans contributors', '');
    } else {
      results['4_unlike_bob'] = ok('Bob retiré, message recalculé', { message: notif.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 5 : Unlike total — notification supprimée
  // Alice et Carla se désaiment → 0 contributors → DELETE de la notification
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 5 : Unlike total (Alice + Carla) → suppression notif ══');
  await admin.from('community_likes').delete().eq('user_id', userL1.id).eq('post_id', postId);
  await wait(200);
  await admin.from('community_likes').delete().eq('user_id', userL3.id).eq('post_id', postId);
  await wait();

  const notifAfterAll = await getNotif(userAuthor.id, 'like', postId);
  console.log(`  Notification restante : ${notifAfterAll === null ? 'null (supprimée ✓)' : JSON.stringify(notifAfterAll)}`);
  if (notifAfterAll === null) {
    results['5_unlike_total'] = ok('Notification supprimée quand 0 contributors restants');
  } else {
    results['5_unlike_total'] = fail('Notification encore présente avec 0 likers', JSON.stringify(notifAfterAll));
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 6 : Like sur notification déjà lue → is_read repasse à false
  // 6a : Alice like  → notif créée (is_read=false)
  // 6b : marque is_read=true (simule une lecture)
  // 6c : Bob like    → notif mise à jour, is_read=false, 1 seule ligne
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 6 : Like sur notification déjà lue ══');
  await admin.from('community_likes').insert({ user_id: userL1.id, post_id: postId });
  await wait();

  const notif6a = await getNotif(userAuthor.id, 'like', postId);
  await admin.from('notifications').update({ is_read: true }).eq('id', notif6a.id);
  const notif6b = await getNotif(userAuthor.id, 'like', postId);
  console.log(`  Après lecture simulée : is_read=${notif6b.is_read} (attendu: true)`);

  await admin.from('community_likes').insert({ user_id: userL2.id, post_id: postId });
  await wait();

  const { data: allS6 } = await admin.from('notifications')
    .select('id, message, is_read, contributors')
    .eq('user_id', userAuthor.id).eq('type', 'like').eq('action_url', `/home#post-${postId}`);
  const countS6  = allS6?.length ?? 0;
  const notif6c  = allS6?.[0];
  console.log(`  Nombre de notifs après 2e like : ${countS6} (attendu: 1)`);
  console.log(`  is_read : ${notif6c?.is_read} (attendu: false)`);
  console.log(`  message : "${notif6c?.message}"`);

  if (countS6 !== 1) {
    results['6_like_sur_notif_lue'] = fail(`${countS6} notification(s) — doublon !`, '');
  } else if (notif6c?.is_read !== false) {
    results['6_like_sur_notif_lue'] = fail('is_read n\'a pas repassé à false', `is_read=${notif6c?.is_read}`);
  } else {
    results['6_like_sur_notif_lue'] = ok('1 notif, is_read=false, message mis à jour', { message: notif6c.message, is_read: notif6c.is_read });
  }

  // Nettoyage inter-scénarios
  await admin.from('community_likes').delete().eq('post_id', postId);
  await admin.from('notifications').delete().eq('user_id', userAuthor.id);
  await wait(300);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 7 : Premier commentaire direct — Alice
  // → Notification avec extrait : "Alice a commenté : {60 premiers chars}…"
  //   action_url = /home#post-{postId}-comments
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 7 : Premier commentaire — Alice ══');
  const commentContent = 'Voici mon commentaire de test pour vérifier l\'extrait affiché dans la notification.';
  const { data: comment1, error: errC1 } = await admin
    .from('community_comments')
    .insert({ user_id: userL1.id, post_id: postId, content: commentContent })
    .select('id').single();
  await wait();

  if (errC1) {
    results['7_premier_commentaire'] = fail('INSERT commentaire Alice échoué', errC1.message);
  } else {
    const notif = await getNotif(userAuthor.id, 'comment', postId);
    const excerpt  = commentContent.substring(0, 60) + '…';
    const expected = `Alice a commenté : ${excerpt}`;
    console.log(`  action_url : /home#post-${postId}-comments`);
    console.log(`  message    : "${notif?.message}"`);
    if (!notif) {
      results['7_premier_commentaire'] = fail('Notification commentaire introuvable', 'null');
    } else if (notif.message === expected) {
      results['7_premier_commentaire'] = ok('Notification avec extrait correct', { message: notif.message });
    } else {
      results['7_premier_commentaire'] = fail('Message avec extrait incorrect', `"${notif.message}" ≠ "${expected}"`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 8 : Deuxième commentateur — Bob
  // → Bascule agrégée : "Alice et Bob ont commenté votre publication."
  //   1 seule ligne, même action_url stable
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 8 : Deuxième commentaire — Bob (bascule agrégée) ══');
  const { error: errC2 } = await admin
    .from('community_comments')
    .insert({ user_id: userL2.id, post_id: postId, content: 'Super publication !' });
  await wait();

  if (errC2) {
    results['8_deuxieme_commentaire'] = fail('INSERT commentaire Bob échoué', errC2.message);
  } else {
    const { data: allComment } = await admin.from('notifications')
      .select('id, message, contributors')
      .eq('user_id', userAuthor.id).eq('type', 'comment').eq('action_url', `/home#post-${postId}-comments`);
    const countC = allComment?.length ?? 0;
    const notif  = allComment?.[0];
    const expected = 'Alice et Bob ont commenté votre publication.';
    console.log(`  Nombre de notifs comment : ${countC} (attendu: 1)`);
    console.log(`  message : "${notif?.message}"`);
    if (countC !== 1) {
      results['8_deuxieme_commentaire'] = fail(`${countC} notification(s) — doublon !`, '');
    } else if (notif.message !== expected) {
      results['8_deuxieme_commentaire'] = fail('Message agrégé commentaire incorrect', `"${notif.message}" ≠ "${expected}"`);
    } else {
      results['8_deuxieme_commentaire'] = ok('1 seule notif, message agrégé correct', { message: notif.message });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÉNARIO 9 : Réponse à un commentaire — notification individuelle séparée
  // Carla répond au commentaire de Alice.
  // → Notification type='comment_reply' créée pour Alice (pas pour l'auteur du post)
  //   action_url = /home#comment_{replyId}_{postId}  (non agrégée)
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══ Scénario 9 : Réponse à un commentaire — Carla répond à Alice ══');
  const { data: reply, error: errReply } = await admin
    .from('community_comments')
    .insert({ user_id: userL3.id, post_id: postId, parent_id: comment1.id, content: 'Je suis d\'accord Alice !' })
    .select('id').single();
  await wait();

  if (errReply) {
    results['9_reply_individuelle'] = fail('INSERT réponse Carla échoué', errReply.message);
  } else {
    // a) Notif comment_reply reçue par Alice
    const { data: replyNotif } = await admin.from('notifications')
      .select('id, type, message, action_url')
      .eq('user_id', userL1.id)
      .eq('type', 'comment_reply')
      .eq('action_url', `/home#comment_${reply.id}_${postId}`)
      .maybeSingle();

    // b) L'auteur du post ne doit PAS recevoir de comment_reply
    const { data: authorReplies } = await admin.from('notifications')
      .select('id')
      .eq('user_id', userAuthor.id)
      .eq('type', 'comment_reply');
    const authorReplyCount = authorReplies?.length ?? 0;

    // c) La notif agrégée du post ne doit pas avoir augmenté (toujours Alice+Bob)
    const { data: allComment2 } = await admin.from('notifications')
      .select('id, contributors')
      .eq('user_id', userAuthor.id).eq('type', 'comment').eq('action_url', `/home#post-${postId}-comments`);
    const aggregCount = allComment2?.length ?? 0;
    const aggregNotif = allComment2?.[0];

    console.log(`  Notif reply pour Alice : ${replyNotif ? `"${replyNotif.message}"` : 'null'}`);
    console.log(`  Notif comment_reply pour auteur du post : ${authorReplyCount} (attendu: 0)`);
    console.log(`  Notif agrégée post toujours 1 ligne : ${aggregCount === 1} — ${aggregNotif?.contributors?.length} contributors`);

    if (!replyNotif) {
      results['9_reply_individuelle'] = fail('Notification comment_reply introuvable pour Alice', 'null');
    } else if (authorReplyCount > 0) {
      results['9_reply_individuelle'] = fail('L\'auteur du post a reçu une notif comment_reply à tort', `${authorReplyCount} notif(s)`);
    } else if (aggregCount !== 1 || aggregNotif?.contributors?.length !== 2) {
      results['9_reply_individuelle'] = fail('La notif agrégée du post a été modifiée par la reply', `count=${aggregCount} contributors=${aggregNotif?.contributors?.length}`);
    } else {
      results['9_reply_individuelle'] = ok(
        'Notif reply individuelle pour Alice, notif agrégée du post inchangée, auteur non pollué',
        { message: replyNotif.message, action_url: replyNotif.action_url }
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RÉSUMÉ FINAL
  // ═══════════════════════════════════════════════════════════════════════════
  console.log('\n══════════════ RÉSULTATS BRUTS ══════════════');
  console.log(JSON.stringify(results, null, 2));
  console.log('═════════════════════════════════════════════');

  const allPass  = Object.values(results).every(r => r.result === 'PASS');
  const failList = Object.entries(results).filter(([, r]) => r.result === 'FAIL').map(([k]) => k);

  if (allPass) {
    console.log('\n✅ TOUS LES SCÉNARIOS PASSENT — Système d\'agrégation des notifications opérationnel.');
  } else {
    console.log(`\n❌ ${failList.length} SCÉNARIO(S) EN ÉCHEC : ${failList.join(', ')}`);
  }

  // ── Nettoyage complet ──────────────────────────────────────────────────────
  console.log('\n══ Nettoyage ══');
  // community_posts → cascade vers community_likes, community_comments, notifications
  await admin.from('community_posts').delete().eq('id', postId);
  await admin.auth.admin.deleteUser(userAuthor.id);
  await admin.auth.admin.deleteUser(userL1.id);
  await admin.auth.admin.deleteUser(userL2.id);
  await admin.auth.admin.deleteUser(userL3.id);
  console.log('  Post, commentaires, likes, notifications et utilisateurs supprimés.');
}

run().catch(err => { console.error('Erreur fatale:', err); process.exit(1); });
