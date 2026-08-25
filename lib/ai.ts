import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai' // utilisé pour GitHub Models (GPT-4o-mini)
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerateRequest, GenerateResponse, Platform, Plan, GenerateIdeasRequest, GenerateIdeasResponse, GenerateBriefRequest, GenerateBriefResponse } from '@/types'
import { TONE_DEFINITIONS } from './tones'
import { buildFacebookPrompt } from './facebook-prompt'
import { buildLinkedinPrompt } from './linkedin-prompt'
import { buildInstagramPrompt } from './instagram-prompt'
import { buildTwitterPrompt } from './twitter-prompt'
import { buildTiktokPrompt } from './tiktok-prompt'
import { buildYoutubePrompt } from './youtube-prompt'
import { buildPinterestPrompt } from './pinterest-prompt'

// ─── Clients & Configuration IA ───────────────────────────────────────────────

const anthropicKey = process.env.ANTHROPIC_API_KEY || ''
const openaiKey = process.env.OPENAI_API_KEY || ''

// Client Anthropic officiel (si clé sk-ant- directe)
const anthropic = new Anthropic({
  apiKey: anthropicKey || 'dummy',
})

// Client OpenAI officiel (si clé sk-proj- directe ou GitHub Models)
const openaiClient = new OpenAI({
  baseURL: process.env.OPENAI_BASE_URL || (process.env.GITHUB_TOKEN ? 'https://models.github.ai/inference' : undefined),
  apiKey: openaiKey || process.env.GITHUB_TOKEN || 'dummy',
})

// Modèles configurables (défaut : Claude Opus 4.8 / GPT-5.6 Sol)
export const CLAUDE_MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8'
export const GPT_MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-sol'

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

// Modèle Gemini — gemini-2.5-flash a été retiré par Google en 2026.
// Défaut sur 3.6 (recommandé par l'API), surchargeable via env sans redéploiement code.
const GEMINI_TEXT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash'

// Modèle image Gemini. Vide = auto-découverte via l'API (résiste aux renommages/retraits Google).
const GEMINI_IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || ''

// Candidats essayés dans l'ordre quand aucun modèle n'est configuré.
// gemini-2.5-flash-image (« Nano Banana ») = seul modèle image confirmé disponible.
const GEMINI_IMAGE_CANDIDATES = [
  'gemini-2.5-flash-image',
  'gemini-3.6-flash-image',
]

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

// Mémorise le modèle image qui a fonctionné (évite de re-tester à chaque appel sur la même instance).
let cachedGeminiImageModel: string | null = null

// ─── Contraintes par plateforme ────────────────────────────────────────────────

const PLATFORM_CONSTRAINTS: Record<Platform, string> = {
  instagram: 'Max 2000 caractères. 5-10 hashtags pertinents à la fin. Emojis bienvenus. Caption engageante avec CTA. Vise 800-1500 caractères pour un bon engagement.',
  facebook:  'Ton conversationnel. Max 2000 caractères. CTA encouragé. 2-3 hashtags max. Vise 800-1500 caractères, développe le sujet avec du détail et de la valeur ajoutée.',
  twitter:   'Max 280 caractères. Percutant et direct. 1-2 hashtags max. Hook fort en première phrase.',
  linkedin:  'Ton professionnel. Max 1300 caractères recommandés. 3 hashtags max. Structure lisible avec sauts de ligne.',
  tiktok:    'Court et dynamique. Max 300 caractères. Hook fort en première phrase. 3-5 hashtags tendance.',
  youtube:   'Description vidéo optimisée SEO. Mots-clés naturels. CTA pour s\'abonner.',
  pinterest: 'Descriptif et inspirant. Mots-clés importants. Max 500 caractères.',
}

// ─── System prompts par plateforme (placeholders — à personnaliser) ────────────

const PLATFORM_SYSTEM_PROMPTS: Record<Platform, string> = {
  linkedin:  'Tu es un expert en contenu LinkedIn viral qui écrit exclusivement en français.',
  instagram: 'Tu es un expert Instagram. Génère un post performant.',
  facebook:  'Tu es un community manager expert spécialisé dans la création de contenu Facebook pour le marché ouest-africain francophone.',
  twitter:   'Tu es un expert Twitter/X. Génère un post performant.',
  tiktok:    'Tu es un expert TikTok. Génère un script de post performant.',
  youtube:   'Tu es un expert YouTube. Génère une description de vidéo performante.',
  pinterest: 'Tu es un expert Pinterest. Génère une description de pin performante.',
}

export const TONE_INSTRUCTIONS: Record<string, string> = {
  direct: `TON DIRECT :
Définition : ${TONE_DEFINITIONS.direct.description}
Règles de rédaction :
${TONE_DEFINITIONS.direct.rules.map(r => `- ${r}`).join('\n')}
Ce que le post doit contenir :
${TONE_DEFINITIONS.direct.contentRequirements.map(r => `- ${r}`).join('\n')}
Exemples d'accroches calibrantes :
${TONE_DEFINITIONS.direct.hooksExamples.map(e => `- ${e}`).join('\n')}
Exemple de post complet :
${TONE_DEFINITIONS.direct.fullPostExample}`,

  inspirant: `TON INSPIRANT :
Définition : ${TONE_DEFINITIONS.inspirant.description}
Règles de rédaction :
${TONE_DEFINITIONS.inspirant.rules.map(r => `- ${r}`).join('\n')}
Ce que le post doit contenir :
${TONE_DEFINITIONS.inspirant.contentRequirements.map(r => `- ${r}`).join('\n')}
Exemples d'accroches calibrantes :
${TONE_DEFINITIONS.inspirant.hooksExamples.map(e => `- ${e}`).join('\n')}
Exemple de post complet :
${TONE_DEFINITIONS.inspirant.fullPostExample}`,

  emotionnel: `TON ÉMOTIONNEL :
Définition : ${TONE_DEFINITIONS.emotionnel.description}
Règles de rédaction :
${TONE_DEFINITIONS.emotionnel.rules.map(r => `- ${r}`).join('\n')}
Ce que le post doit contenir :
${TONE_DEFINITIONS.emotionnel.contentRequirements.map(r => `- ${r}`).join('\n')}
Exemples d'accroches calibrantes :
${TONE_DEFINITIONS.emotionnel.hooksExamples.map(e => `- ${e}`).join('\n')}
Exemple de post complet :
${TONE_DEFINITIONS.emotionnel.fullPostExample}`,

  humoristique: `TON HUMORISTIQUE :
Définition : ${TONE_DEFINITIONS.humoristique.description}
Règles de rédaction :
${TONE_DEFINITIONS.humoristique.rules.map(r => `- ${r}`).join('\n')}
Ce que le post doit contenir :
${TONE_DEFINITIONS.humoristique.contentRequirements.map(r => `- ${r}`).join('\n')}
Exemples d'accroches calibrantes :
${TONE_DEFINITIONS.humoristique.hooksExamples.map(e => `- ${e}`).join('\n')}
Exemple de post complet :
${TONE_DEFINITIONS.humoristique.fullPostExample}`,

  professionnel: `TON PROFESSIONNEL :
Définition : ${TONE_DEFINITIONS.professionnel.description}
Règles de rédaction :
${TONE_DEFINITIONS.professionnel.rules.map(r => `- ${r}`).join('\n')}
Ce que le post doit contenir :
${TONE_DEFINITIONS.professionnel.contentRequirements.map(r => `- ${r}`).join('\n')}
Exemples d'accroches calibrantes :
${TONE_DEFINITIONS.professionnel.hooksExamples.map(e => `- ${e}`).join('\n')}
Exemple de post complet :
${TONE_DEFINITIONS.professionnel.fullPostExample}`,
}

const LENGTH_INSTRUCTIONS: Record<string, string> = {
  court:  'Rédige un post COURT et percutant (50-150 caractères pour Twitter/TikTok, 200-400 pour les autres plateformes). Va droit au but.',
  moyen:  'Rédige un post de longueur MOYENNE (280 caractères max pour Twitter/TikTok, 500-900 pour les autres). Équilibre entre concision et détail.',
  long:   'Rédige un post LONG et développé. Approche la limite de chaque plateforme. Développe le sujet en profondeur.',
}

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  direct:   'Format DIRECT : affirmation claire, message central en une phrase forte, sans détour.',
  liste:    'Format LISTÉ : utilise des points de liste, emojis ou numéros pour structurer l\'information. Facilite la lecture.',
  narratif: 'Format NARRATIF : commence par une anecdote ou histoire courte, développe le sujet de façon fluide et engageante.',
  question: 'Format QUESTION : commence par une question accrocheuse pour interpeller l\'audience et inciter à répondre.',
}

const CTA_INSTRUCTIONS: Record<string, string> = {
  acheter:        'Inclus un CTA orienté achat/conversion (ex: "Découvrez", "Commandez", "Profitez de", "Obtenez").',
  commenter:      'Inclus un CTA orienté commentaire/interaction (ex: "Donnez votre avis", "Et vous ?", "Racontez-nous").',
  partager:       'Inclus un CTA orienté partage (ex: "Partagez si", "Taguez quelqu\'un qui", "Envoyez à").',
  en_savoir_plus: 'Inclus un CTA orienté information (ex: "En savoir plus", "Lien en bio", "Consultez notre site").',
  aucun:          'N\'inclus pas de CTA explicite. Laisse le message parler de lui-même.',
}

const OBJECTIVE_INSTRUCTIONS: Record<string, string> = {
  vendre:    'OBJECTIF : Vendre. Mets en avant la valeur unique, crée un sentiment d\'urgence ou de désir.',
  engager:   'OBJECTIF : Engager. Favorise les interactions, pose des questions, invite à participer.',
  eduquer:   'OBJECTIF : Éduquer. Apporte de la valeur et du savoir de manière claire et structurée.',
  inspirer:  'OBJECTIF : Inspirer. Crée une connexion émotionnelle forte, partage une vision ou une conviction.',
  annoncer:  'OBJECTIF : Annoncer. Présente la nouveauté de façon claire, enthousiaste et mémorable.',
  fideliser: 'OBJECTIF : Fidéliser. Renforce le lien avec la communauté existante, valorise et remercie.',
}

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildBrandContext(req: GenerateRequest): string {
  const lines: string[] = []
  if (req.brand_name)        lines.push(`Marque : ${req.brand_name}`)
  if (req.brand_description) lines.push(`Description : ${req.brand_description}`)
  if (req.brand_value_proposition) lines.push(`Proposition de valeur (pourquoi les clients nous choisissent) : ${req.brand_value_proposition}`)
  if (req.brand_industry)    lines.push(`Secteur : ${req.brand_industry}`)
  if (req.brand_audience)    lines.push(`Audience cible : ${req.brand_audience}`)
  if (req.brand_pillars?.length) lines.push(`Types de contenus publiés / Piliers : ${req.brand_pillars.join(', ')}`)
  if (req.brand_avoid)       lines.push(`À éviter absolument : ${req.brand_avoid}`)
  return lines.join('\n')
}

function buildPrompt(req: GenerateRequest, targetPlatform?: Platform): string {
  if (targetPlatform === 'facebook') {
    return buildFacebookPrompt(req)
  }
  if (targetPlatform === 'linkedin') {
    return buildLinkedinPrompt(req)
  }
  if (targetPlatform === 'instagram') {
    return buildInstagramPrompt(req)
  }
  if (targetPlatform === 'twitter') {
    return buildTwitterPrompt(req)
  }
  if (targetPlatform === 'tiktok') {
    return buildTiktokPrompt(req)
  }
  if (targetPlatform === 'youtube') {
    return buildYoutubePrompt(req)
  }
  if (targetPlatform === 'pinterest') {
    return buildPinterestPrompt(req)
  }

  const platforms = targetPlatform ? [targetPlatform] : req.platforms

  const platformInstructions = platforms
    .map(p => `**${p.toUpperCase()}**: ${PLATFORM_CONSTRAINTS[p]}`)
    .join('\n')

  const brandContext = buildBrandContext(req)

  const briefLine = req.brief
    ? `Sujet / brief : ${req.brief}`
    : `Aucun brief fourni. Choisis un sujet DIRECTEMENT lié à l'activité de cette marque${req.brand_industry ? ` (secteur : ${req.brand_industry})` : ''}. INTERDIT : nature, statistiques génériques, citations motivationnelles sans rapport, contenu lifestyle non lié à la marque. Reste 100% dans l'univers professionnel de la marque.`

  // Nouvelles instructions contextuelles
  const objectiveLine  = req.objective  ? OBJECTIVE_INSTRUCTIONS[req.objective]  : ''
  const lengthLine     = req.length     ? LENGTH_INSTRUCTIONS[req.length]         : ''
  const formatLine     = req.format     ? FORMAT_INSTRUCTIONS[req.format]         : ''
  const ctaLine        = req.cta        ? CTA_INSTRUCTIONS[req.cta]               : ''
  // Le ton PostTone (professionnel/decontracte/emotionnel/expert) prime sur le GenerateTone si présent
  const toneLine       = TONE_INSTRUCTIONS[req.tone] || ''

  const contextLines = [objectiveLine, lengthLine, formatLine, toneLine, ctaLine]
    .filter(Boolean)
    .join('\n')

  const brandSection = brandContext
    ? `PROFIL DE MARQUE (respecte-le strictement) :\n${brandContext}`
    : `ATTENTION : Aucun profil de marque défini. Génère un contenu professionnel générique sur la productivité ou la croissance des entreprises.`

  return `Tu es un expert Community Manager. Génère des posts pour les réseaux sociaux suivants.

${brandSection}

${briefLine}
${contextLines}

RÈGLE ABSOLUE : Tout contenu généré DOIT être directement lié à l'activité et au secteur de la marque. Ne génère jamais de contenu hors-sujet (nature, animaux, citations sans rapport, statistiques génériques, etc.).

Contraintes par plateforme :
${platformInstructions}

Réponds UNIQUEMENT en JSON valide avec ce format exact :
{
  "variants": {
    ${platforms.map(p => `"${p}": "texte du post"`).join(',\n    ')}
  }
}

Aucun texte avant ou après le JSON.`
}

function buildWeekPrompt(req: GenerateRequest, postsCount: number): string {
  const platformInstructions = req.platforms
    .map(p => `**${p.toUpperCase()}**: ${PLATFORM_CONSTRAINTS[p]}`)
    .join('\n')

  const brandContext = req.brand_name
    ? `Marque : ${req.brand_name}${req.brand_description ? `. Description : ${req.brand_description}` : ''}${req.brand_industry ? `. Secteur : ${req.brand_industry}` : ''}${req.brand_audience ? `. Audience : ${req.brand_audience}` : ''}.`
    : ''

  const weekBriefLine = req.brief
    ? `Thème général de la semaine : ${req.brief}`
    : `Choisis des sujets variés DIRECTEMENT liés à l'activité de la marque${req.brand_industry ? ` (secteur : ${req.brand_industry})` : ''}. INTERDIT : nature, citations génériques, contenu hors-sujet.`

  return `Tu es un expert Community Manager. Génère ${postsCount} posts différents pour la semaine.

${brandContext}
RÈGLE ABSOLUE : Tout contenu généré DOIT être directement lié à l'activité et au secteur de la marque.
Ton : ${TONE_INSTRUCTIONS[req.tone]}
${weekBriefLine}

Contraintes par plateforme :
${platformInstructions}

Génère ${postsCount} posts variés avec des sujets différents. Réponds UNIQUEMENT en JSON :
{
  "week": [
    ${Array.from({ length: postsCount }, (_, i) => `{
      "day": ${i + 1},
      "topic": "sujet court du post",
      "variants": { ${req.platforms.map(p => `"${p}": "texte du post"`).join(', ')} }
    }`).join(',\n    ')}
  ]
}

Aucun texte avant ou après le JSON.`
}


// ─── Helpers de parsing JSON ──────────────────────────────────────────────────

function extractJsonObject(raw: string): string {
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim()
  const first = cleaned.indexOf('{')
  const last = cleaned.lastIndexOf('}')
  return (first !== -1 && last !== -1) ? cleaned.slice(first, last + 1) : cleaned
}

function shapeGenerateResponse(parsed: any, targetPlatform?: Platform): GenerateResponse {
  if (targetPlatform && parsed?.post) {
    return { variants: { [targetPlatform]: parsed.post }, ...parsed } as any
  }
  return parsed as GenerateResponse
}

// ─── Générateurs par fournisseur (découplés, sans repli interne) ──────────────

async function genViaAnthropic(req: GenerateRequest, targetPlatform?: Platform): Promise<GenerateResponse> {
  const systemPrompt = targetPlatform ? PLATFORM_SYSTEM_PROMPTS[targetPlatform] : undefined
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    system: systemPrompt || undefined,
    messages: [{ role: 'user', content: buildPrompt(req, targetPlatform) }],
  })
  const text = message.content?.[0]?.type === 'text' ? message.content[0].text : ''
  return shapeGenerateResponse(JSON.parse(extractJsonObject(text)), targetPlatform)
}

// ─── Génération via OpenAI / GPT (clé OpenAI directe ou GitHub Models) ────────

async function genViaOpenAI(req: GenerateRequest, targetPlatform?: Platform): Promise<GenerateResponse> {
  const systemPrompt = targetPlatform ? PLATFORM_SYSTEM_PROMPTS[targetPlatform] : undefined
  const response = await openaiClient.chat.completions.create({
    model: GPT_MODEL,
    messages: [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      { role: 'user' as const, content: buildPrompt(req, targetPlatform) },
    ],
  })
  const text = response?.choices?.[0]?.message?.content || '{}'
  return shapeGenerateResponse(JSON.parse(extractJsonObject(text)), targetPlatform)
}

// ─── Génération via Gemini 2.5 Flash (fournisseur principal) ──────────────────

async function generateWithGeminiFree(req: GenerateRequest, targetPlatform?: Platform): Promise<GenerateResponse> {
  if (!gemini) throw new Error('GEMINI_API_KEY manquante.')
  const prompt = buildPrompt(req, targetPlatform)
  const model = gemini.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' }
  })
  const text = result.response.text()
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned)
  if (targetPlatform && parsed.post) {
    return { variants: { [targetPlatform]: parsed.post }, ...parsed } as any
  }
  return parsed as GenerateResponse
}

// ─── Génération Simple avec repli en chaîne (Gemini → Claude → GPT) ───────────

export async function callSimpleAI(promptText: string, isJson: boolean = false): Promise<string> {
  const chain: { name: string; run: () => Promise<string> }[] = []

  if (gemini) {
    const g = gemini
    chain.push({ name: 'Gemini', run: async () => {
      const model = g.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        generationConfig: isJson ? { responseMimeType: 'application/json' } : undefined,
      })
      return result.response.text()
    } })
  }
  if (anthropicKey) {
    chain.push({ name: 'Anthropic', run: async () => {
      const msg = await anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2048,
        messages: [{ role: 'user', content: promptText }],
      })
      return msg.content[0]?.type === 'text' ? msg.content[0].text : ''
    } })
  }
  if (openaiKey || process.env.GITHUB_TOKEN) {
    chain.push({ name: 'OpenAI', run: async () => {
      const res = await openaiClient.chat.completions.create({
        model: GPT_MODEL,
        messages: [{ role: 'user', content: promptText }],
        ...(isJson ? { response_format: { type: 'json_object' } } : {}),
      })
      return res.choices[0]?.message?.content || ''
    } })
  }

  if (chain.length === 0) {
    throw new Error('Aucun fournisseur IA configuré. Renseignez GEMINI_API_KEY dans vos variables d’environnement (Vercel).')
  }

  const errors: string[] = []
  if (!gemini) errors.push('Gemini → non configuré (GEMINI_API_KEY absente côté serveur)')
  for (let i = 0; i < chain.length; i++) {
    const step = chain[i]
    try {
      const out = await step.run()
      if (out && out.trim()) return out
      throw new Error('réponse vide')
    } catch (e: any) {
      errors.push(`${step.name} → ${e?.message || e}`)
      const suite = i < chain.length - 1 ? `Repli sur « ${chain[i + 1].name} »…` : 'Plus de repli disponible.'
      console.error(`[AI] Fournisseur « ${step.name} » a échoué : ${e?.message}. ${suite}`)
    }
  }
  throw new Error(`Tous les fournisseurs IA ont échoué. Détail : ${errors.join(' | ')}`)
}

// ─── Génération d'images via Gemini (modèle image « Nano Banana ») ────────────

// Appel REST direct (indépendant du SDK) pour générer une image avec un modèle donné.
// Retourne une data URL base64. Essaie plusieurs combinaisons de modalités.
async function callGeminiImageREST(key: string, model: string, prompt: string): Promise<string> {
  const modalityCombos: string[][] = [['TEXT', 'IMAGE'], ['IMAGE']]
  let lastErr = ''
  for (const modalities of modalityCombos) {
    const res = await fetch(`${GEMINI_API_BASE}/models/${model}:generateContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: modalities },
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      lastErr = `HTTP ${res.status} ${body.slice(0, 160)}`
      // 400 = souvent une combinaison de modalités non supportée → on tente la suivante.
      if (res.status === 400) continue
      throw new Error(lastErr)
    }
    const j: any = await res.json()
    const parts = j?.candidates?.[0]?.content?.parts || []
    const inline = parts.map((p: any) => p.inlineData || p.inline_data).find((d: any) => d?.data)
    if (inline?.data) {
      const mime = inline.mimeType || inline.mime_type || 'image/png'
      return `data:${mime};base64,${inline.data}`
    }
    lastErr = 'réponse sans partie image'
  }
  throw new Error(lastErr || 'échec inconnu')
}

// Découvre dynamiquement un modèle image disponible sur le compte (résilient aux renommages Google).
async function discoverGeminiImageModel(key: string): Promise<string | null> {
  const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}&pageSize=1000`)
  if (!res.ok) return null
  const j: any = await res.json()
  const models: any[] = j.models || []
  const supportsGen = (m: any) => (m.supportedGenerationMethods || []).includes('generateContent')
  const name = (m: any) => String(m.name || '').replace('models/', '')
  // 1. Un des candidats connus, s'il est présent et actif
  for (const c of GEMINI_IMAGE_CANDIDATES) {
    if (models.find(m => name(m) === c && supportsGen(m))) return c
  }
  // 2. N'importe quel « *flash-image* » supportant generateContent
  const flashImg = models.find(m => /flash.*image/i.test(name(m)) && supportsGen(m))
  if (flashImg) return name(flashImg)
  // 3. N'importe quel modèle « image » supportant generateContent
  const anyImg = models.find(m => /image/i.test(name(m)) && supportsGen(m))
  return anyImg ? name(anyImg) : null
}

/**
 * Génère une image avec Gemini et retourne une data URL base64.
 * Stratégie : modèle configuré → candidats connus → auto-découverte via l'API.
 * Lève une erreur détaillée (par modèle) si tout échoue.
 */
export async function generateGeminiImage(prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY absente côté serveur')

  const attempts: string[] = []
  if (GEMINI_IMAGE_MODEL) attempts.push(GEMINI_IMAGE_MODEL)
  if (cachedGeminiImageModel) attempts.push(cachedGeminiImageModel)
  attempts.push(...GEMINI_IMAGE_CANDIDATES)
  const unique = Array.from(new Set(attempts))

  const errors: string[] = []
  for (const model of unique) {
    try {
      const dataUrl = await callGeminiImageREST(key, model, prompt)
      cachedGeminiImageModel = model
      console.log(`[gemini-image] image générée avec « ${model} »`)
      return dataUrl
    } catch (e: any) {
      errors.push(`${model} → ${e?.message || e}`)
    }
  }

  // Dernier recours : découverte dynamique du bon modèle sur ce compte
  try {
    const discovered = await discoverGeminiImageModel(key)
    if (discovered && !unique.includes(discovered)) {
      const dataUrl = await callGeminiImageREST(key, discovered, prompt)
      cachedGeminiImageModel = discovered
      console.log(`[gemini-image] image générée via auto-découverte « ${discovered} »`)
      return dataUrl
    }
    errors.push(discovered
      ? `auto-découverte a proposé « ${discovered} » (déjà essayé, échec)`
      : 'auto-découverte → aucun modèle image disponible sur ce compte')
  } catch (e: any) {
    errors.push(`auto-découverte → ${e?.message || e}`)
  }

  throw new Error(`Gemini image a échoué. Détail : ${errors.join(' | ')}`)
}

// ─── Réécriture ────────────────────────────────────────────────────────────────

export async function rewritePost(content: string, platform: Platform, instruction: string, plan: Plan): Promise<string> {
  const prompt = `Réécris ce post ${platform} selon cette instruction : "${instruction}"

Post original :
${content}

Contraintes ${platform} : ${PLATFORM_CONSTRAINTS[platform]}

Réponds UNIQUEMENT avec le texte du post réécrit, sans explication.`

  const result = await callSimpleAI(prompt, false)
  return result.trim() || content
}

// ─── Hashtags ──────────────────────────────────────────────────────────────────

export async function suggestHashtags(content: string, platform: Platform, plan: Plan): Promise<string[]> {
  const prompt = `Suggère 10 hashtags pertinents pour ce post ${platform}. Mélange populaires et de niche.

Post : ${content}

Réponds UNIQUEMENT en JSON : {"hashtags": ["#tag1", "#tag2", ...]}`

  try {
    const rawText = await callSimpleAI(prompt, true)
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned).hashtags || []
  } catch {
    return []
  }
}

export async function generatePosts(req: GenerateRequest, plan: Plan): Promise<GenerateResponse> {
  async function callAI(targetPlatform?: Platform): Promise<GenerateResponse> {
    // Chaîne de repli : on tente chaque fournisseur configuré dans l'ordre,
    // et on passe au suivant dès qu'un échoue (réponse vide, erreur réseau…).
    const chain: { name: string; run: () => Promise<GenerateResponse> }[] = []
    if (gemini) {
      chain.push({ name: 'Gemini', run: () => generateWithGeminiFree(req, targetPlatform) })
    }
    if (anthropicKey) {
      chain.push({ name: 'Anthropic', run: () => genViaAnthropic(req, targetPlatform) })
    }
    if (openaiKey || process.env.GITHUB_TOKEN) {
      chain.push({ name: 'OpenAI', run: () => genViaOpenAI(req, targetPlatform) })
    }

    if (chain.length === 0) {
      throw new Error('Aucun fournisseur IA configuré. Renseignez GEMINI_API_KEY dans vos variables d’environnement (Vercel).')
    }

    const errors: string[] = []
    if (!gemini) errors.push('Gemini → non configuré (GEMINI_API_KEY absente côté serveur)')
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i]
      try {
        return await step.run()
      } catch (e: any) {
        errors.push(`${step.name} → ${e?.message || e}`)
        const suite = i < chain.length - 1 ? `Repli sur « ${chain[i + 1].name} »…` : 'Plus de repli disponible.'
        console.error(`[AI] Fournisseur « ${step.name} » a échoué : ${e?.message}. ${suite}`)
      }
    }
    throw new Error(`Tous les fournisseurs IA ont échoué. Détail : ${errors.join(' | ')}`)
  }

  // Mode UNIFIÉ : 1 seul appel avec la plateforme principale, distribué sur toutes
  if (req.distributionMode === 'unified') {
    const mainPlatform = req.platforms[0]
    const result = await callAI(mainPlatform)
    // Distribuer le même texte sur toutes les plateformes
    if (result.variants) {
      const mainText = result.variants[mainPlatform] || Object.values(result.variants).find(v => v && v.trim())
      if (mainText) {
        for (const p of req.platforms) {
          result.variants[p] = mainText
        }
      }
    }
    return result
  }

  // Mode PERSONNALISÉ : 1 appel par plateforme en parallèle
  const results = await Promise.all(
    req.platforms.map(async (platform) => {
      const singleReq = { ...req, platforms: [platform] }
      const result = await callAI(platform)
      const text = result.variants?.[platform] || Object.values(result.variants || {}).find(v => v && v.trim()) || ''
      return { platform, text, rawResult: result }
    })
  )

  const variants: Partial<Record<Platform, string>> = {}
  let mergedExtra: Record<string, any> = {}
  for (const { platform, text, rawResult } of results) {
    variants[platform] = text
    if (rawResult && typeof rawResult === 'object') {
      const { variants: _, ...extra } = rawResult as any
      mergedExtra = { ...mergedExtra, ...extra }
    }
  }

  return { variants, ...mergedExtra }
}

export async function generateWeekPosts(req: GenerateRequest, postsCount: number, plan: Plan): Promise<{ week: { day: number; topic: string; variants: Partial<Record<Platform, string>> }[] }> {
  const prompt = buildWeekPrompt(req, postsCount)
  const rawText = await callSimpleAI(prompt, true)
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
  const parsed = JSON.parse(cleaned || '{"week":[]}')
  if (!Array.isArray(parsed.week)) {
    console.error('[ai/generateWeekPosts] Structure invalide')
    throw new Error('Réponse invalide du modèle — veuillez réessayer')
  }
  return parsed
}

// ─── Tunnel de Génération (Étape 1 & 2) ────────────────────────────────────────

function buildIdeasPrompt(req: GenerateIdeasRequest): string {
  return `Tu es un stratège en contenu LinkedIn qui écrit exclusivement en français.

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Secteur : ${req.brand_industry || 'Non spécifié'}
- Description : ${req.brand_description || 'Non spécifié'}
- Piliers de contenu : ${req.brand_pillars?.join(', ') || 'Non spécifiés'}
- Objectifs : ${req.brand_objectives?.join(', ') || 'Non spécifiés'}
- Audience cible : ${req.brand_audience || 'Non spécifiée'}
- Plateforme : ${req.platform || 'Non spécifiée'}

MISSION :
Génère exactement 5 idées de posts adaptées à la plateforme et au profil de la marque.
Chaque idée doit être différente — angle différent, approche différente, émotion différente.
Aucune idée générique. Chaque idée doit sembler écrite spécifiquement pour cette marque.

RÈGLES :
- Les idées doivent couvrir des types de posts variés
- Chaque accroche suggérée doit arrêter le scroll
- Les angles doivent être concrets et exploitables immédiatement par l'utilisateur
- Pas d'idée abstraite ou vague

SORTIE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "idees": [
    {
      "numero": 1,
      "angle": "...",
      "type": "...",
      "accroche": "..."
    },
    {
      "numero": 2,
      "angle": "...",
      "type": "...",
      "accroche": "..."
    },
    {
      "numero": 3,
      "angle": "...",
      "type": "...",
      "accroche": "..."
    },
    {
      "numero": 4,
      "angle": "...",
      "type": "...",
      "accroche": "..."
    },
    {
      "numero": 5,
      "angle": "...",
      "type": "...",
      "accroche": "..."
    }
  ]
}
`
}

function buildBriefPrompt(req: GenerateBriefRequest): string {
  return `Tu es un stratège en contenu LinkedIn qui écrit exclusivement en français.

IDÉE CHOISIE :
- Angle : ${req.angle}
- Type de post : ${req.post_type}
- Accroche suggérée : ${req.accroche}

CONTEXTE DE LA MARQUE :
- Nom : ${req.brand_name || 'Non spécifié'}
- Secteur : ${req.brand_industry || 'Non spécifié'}
- Description : ${req.brand_description || 'Non spécifié'}

MISSION :
Génère un brief court et précis qui résume ce que le post va raconter. Ce brief sera lu par l'utilisateur avant la génération finale — il doit comprendre immédiatement l'angle, le ton et la direction du post.

RÈGLES :
- Maximum 5 phrases
- Clair et direct — pas de jargon
- Doit donner envie de générer le post immédiatement
- Mentionne l'accroche de départ
- Indique ce que le post va démontrer ou raconter

SORTIE :
Réponds UNIQUEMENT avec ce JSON, sans texte avant ni après, sans balises markdown :
{
  "brief": "..."
}
`
}

export async function generateIdeas(req: GenerateIdeasRequest, plan: Plan): Promise<GenerateIdeasResponse> {
  const prompt = buildIdeasPrompt(req)
  const rawText = await callSimpleAI(prompt, true)
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned

  try {
    const parsed = JSON.parse(jsonStr)
    if (parsed && parsed.idees && Array.isArray(parsed.idees)) {
      return parsed as GenerateIdeasResponse
    }
    if (Array.isArray(parsed)) {
      return { idees: parsed } as any
    }
    return parsed as GenerateIdeasResponse
  } catch (err) {
    console.error('[generateIdeas] JSON parse error, raw:', rawText)
    throw new Error('Format de réponse invalide reçu du modèle IA.')
  }
}

export async function generateBrief(req: GenerateBriefRequest, plan: Plan): Promise<GenerateBriefResponse> {
  const prompt = buildBriefPrompt(req)
  const rawText = await callSimpleAI(prompt, true)
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  const jsonStr = (firstBrace !== -1 && lastBrace !== -1) ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned

  try {
    return JSON.parse(jsonStr) as GenerateBriefResponse
  } catch (err) {
    console.error('[generateBrief] JSON parse error, raw:', rawText)
    throw new Error('Format de brief invalide reçu du modèle IA.')
  }
}
