import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai' // utilisé pour GitHub Models (GPT-4o-mini)
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GenerateRequest, GenerateResponse, Platform, Plan } from '@/types'
import { TONE_DEFINITIONS } from './tones'

// ─── Clients ──────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const githubAI = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN || 'dummy',
})

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

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
  facebook:  'Tu es un expert Facebook. Génère un post performant.',
  twitter:   'Tu es un expert Twitter/X. Génère un post performant.',
  tiktok:    'Tu es un expert TikTok. Génère un script de post performant.',
  youtube:   'Tu es un expert YouTube. Génère une description de vidéo performante.',
  pinterest: 'Tu es un expert Pinterest. Génère une description de pin performante.',
}

const TONE_INSTRUCTIONS: Record<string, string> = {
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
  if (req.brand_industry)    lines.push(`Secteur : ${req.brand_industry}`)
  if (req.brand_audience)    lines.push(`Audience cible : ${req.brand_audience}`)
  if (req.brand_pillars?.length) lines.push(`Piliers de contenu : ${req.brand_pillars.join(', ')}`)
  if (req.brand_avoid)       lines.push(`À éviter absolument : ${req.brand_avoid}`)
  return lines.join('\n')
}

function buildPrompt(req: GenerateRequest, targetPlatform?: Platform): string {
  const platform = targetPlatform || 'linkedin'
  const settings = req.platformSettings?.[platform] || getDefaultPlatformSettings(platform)

  const brandContext = buildBrandContext(req)
  const brandSection = brandContext
    ? `CONTEXTE DE LA MARQUE :
${brandContext}`
    : `ATTENTION : Aucun profil de marque défini.`

  const toneDef = req.tone || 'professionnel'
  const toneInstruction = TONE_INSTRUCTIONS[toneDef] || ''

  // Build type details
  let typeDescription = ''
  if (platform === 'linkedin') {
    const typeMap: Record<string, string> = {
      storytelling: 'STORYTELLING : Récit d\'expérience vécue avec tension dramatique, un tournant clair et une leçon finale.',
      analyse: 'ANALYSE : Opinion tranchée qui divise, décryptage d\'un sujet avec des arguments forts ou des données clés.',
      conseil: 'CONSEIL : Une méthode ou vérité inconfortable/contre-intuitive que personne ne dit sur le secteur.',
      liste: 'LISTE : Révélation surprenante ou plan d\'action structuré en points numérotés ou à puces.',
      profil: 'PROFIL : Mise en avant humaine et percutante d\'un parcours, d\'un client ou d\'un collaborateur.',
    }
    typeDescription = typeMap[settings.postType] || typeMap.storytelling
  } else if (platform === 'instagram') {
    const typeMap: Record<string, string> = {
      citation: 'CITATION : Une citation inspirante, forte ou punchy mise en valeur, suivie d\'une explication courte.',
      carousel: 'CAROUSEL : Un plan structuré diapositive par diapositive (slide 1, slide 2...) clair, visuel et progressif.',
      temoignage: 'TÉMOIGNAGE : Un retour d\'expérience client authentique ou une mini-étude de cas émotionnelle avec un avant/après.',
      coulisses: 'COULISSES : Partage authentique des coulisses, de la vie de l\'entreprise ou du processus de création d\'un produit.',
    }
    typeDescription = typeMap[settings.postType] || typeMap.citation
  } else if (platform === 'facebook') {
    const typeMap: Record<string, string> = {
      question: 'QUESTION : Une interrogation ouverte et engageante conçue pour lancer une discussion au sein de la communauté.',
      annonce: 'ANNONCE : Présentation enthousiaste, claire et attrayante d\'un nouveau produit, événement ou actualité majeure.',
      partage_experience: 'PARTAGE D\'EXPÉRIENCE : Une anecdote personnelle ou professionnelle vécue avec un enseignement pratique.',
    }
    typeDescription = typeMap[settings.postType] || typeMap.question
  } else if (platform === 'tiktok') {
    const typeMap: Record<string, string> = {
      accroche_choc: 'ACCROCHE CHOC : Script court avec un concept provocateur ou intrigue forte de 3 secondes pour retenir l\'attention.',
      revelation: 'RÉVÉLATION : Révélation d\'un secret d\'expert ou d\'une astuce méconnue indispensable.',
      tendance: 'TENDANCE : Adaptation créative et humoristique d\'un concept viral ou mème du moment au secteur de la marque.',
    }
    typeDescription = typeMap[settings.postType] || typeMap.accroche_choc
  } else if (platform === 'twitter') {
    const typeMap: Record<string, string> = {
      opinion: 'OPINION : Un avis tranché, direct et impactant sur un sujet d\'actualité ou un débat du secteur.',
      punchline: 'PUNCHLINE : Une phrase choc ultra-percutante formulée pour faire réagir et susciter le débat.',
      fact: 'FACT : Une statistique marquante, un chiffre insolite ou un fait précis analysé de manière synthétique.',
    }
    typeDescription = typeMap[settings.postType] || typeMap.opinion
  }

  // Build length details
  let lengthDescription = ''
  if (platform === 'linkedin') {
    const lenMap: Record<string, string> = {
      court: 'COURT : environ 150 mots maximum',
      moyen: 'MOYEN : environ 200 mots',
      long: 'LONG : environ 300 mots',
    }
    lengthDescription = lenMap[settings.length] || lenMap.moyen
  } else if (platform === 'instagram') {
    const lenMap: Record<string, string> = {
      tres_court: 'TRÈS COURT : environ 50 mots maximum',
      court: 'COURT : environ 80 mots',
    }
    lengthDescription = lenMap[settings.length] || lenMap.court
  } else if (platform === 'facebook') {
    const lenMap: Record<string, string> = {
      tres_court: 'TRÈS COURT : environ 40 mots maximum',
      court: 'COURT : environ 60 mots',
    }
    lengthDescription = lenMap[settings.length] || lenMap.court
  } else if (platform === 'tiktok') {
    lengthDescription = 'ULTRA COURT : environ 30-40 mots uniquement'
  } else if (platform === 'twitter') {
    const lenMap: Record<string, string> = {
      tweet: 'TWEET UNIQUE : maximum 240 caractères',
      thread: 'THREAD : une série de 3 à 5 tweets connectés et numérotés (ex: 1/4, 2/4...) pour développer le sujet de manière fluide.',
    }
    lengthDescription = lenMap[settings.length] || lenMap.tweet
  }

  return `Tu es un rédacteur et Community Manager expert qui écrit exclusivement en français.
Génère un post performant optimisé pour la plateforme ${platform.toUpperCase()}.

${brandSection}

SUJET / BRIEF DE GÉNÉRATION :
${req.brief || 'Reste dans le secteur d\'activité et génère un contenu captivant.'}

CONTRAINTES DE FORMAT ET DE STRUCTURE :
- Type de post demandé : ${typeDescription}
- Longueur demandée : ${lengthDescription}
- Recommandations de la plateforme : ${PLATFORM_CONSTRAINTS[platform]}

${toneInstruction}

RÈGLES ABSOLUES ET INTERDICTIONS :
- Rédige UNIQUEMENT en français.
- Tout contenu généré doit être DIRECTEMENT lié au secteur et à l'activité de la marque.
- Aucun markdown de mise en forme décorative (pas de gras, pas d'italique, etc.) sauf si structurellement requis (comme les listes à puces).
- Ne commence jamais par des formules bateau ou typiques d'IA (ex: "Dans un monde en constante évolution...", "Aujourd'hui, découvrons...", "Il est essentiel de...").
- Termine par une question pertinente ou un appel à l'action court et direct.

FORMAT DE RÉPONSE REQUIS :
Réponds EXCLUSIVEMENT sous la forme d'un objet JSON valide. Ne mets aucun texte explicatif avant ou après, et n'utilise pas de balises de bloc de code (comme \`\`\`json ou de \`\`\`).
Structure JSON attendue :
{
  "type_detecte": "${settings.postType}",
  "post": "Le texte du post généré ici. Respecte les sauts de ligne. Si c'est un thread Twitter, sépare chaque tweet par un double saut de ligne avec sa numérotation.",
  "image_prompt": "An image generation prompt in English, descriptive, realistic photographic style, details about composition and lighting, no text in the image"
}`
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

// ─── Génération via GitHub Models (GPT-4o-mini) — plan gratuit ─────────────────

async function generateWithGitHub(req: GenerateRequest, targetPlatform?: Platform): Promise<GenerateResponse> {
  const systemPrompt = targetPlatform ? PLATFORM_SYSTEM_PROMPTS[targetPlatform] : undefined
  const messages: { role: 'system' | 'user'; content: string }[] = []
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })
  messages.push({ role: 'user', content: buildPrompt(req, targetPlatform) })

  const response = await githubAI.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    max_tokens: 1500,
    temperature: 0.8,
    response_format: { type: 'json_object' },
  })

  const text = response.choices[0]?.message?.content || '{}'
  const parsed = JSON.parse(text)
  if (targetPlatform && parsed.post) {
    return {
      variants: {
        [targetPlatform]: parsed.post
      },
      ...parsed
    } as any
  }
  return parsed as GenerateResponse
}

// ─── Génération via Claude (Anthropic) — plans payants ────────────────────────

async function generateWithClaude(req: GenerateRequest, targetPlatform?: Platform): Promise<GenerateResponse> {
  const systemPrompt = targetPlatform ? PLATFORM_SYSTEM_PROMPTS[targetPlatform] : undefined
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt || undefined,
    messages: [{ role: 'user', content: buildPrompt(req, targetPlatform) }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const parsed = JSON.parse(text.trim())
  if (targetPlatform && parsed.post) {
    return {
      variants: {
        [targetPlatform]: parsed.post
      },
      ...parsed
    } as any
  }
  return parsed as GenerateResponse
}

// ─── Réécriture ────────────────────────────────────────────────────────────────

export async function rewritePost(content: string, platform: Platform, instruction: string, plan: Plan): Promise<string> {
  const prompt = `Réécris ce post ${platform} selon cette instruction : "${instruction}"

Post original :
${content}

Contraintes ${platform} : ${PLATFORM_CONSTRAINTS[platform]}

Réponds UNIQUEMENT avec le texte du post réécrit, sans explication.`

  if (plan === 'free') {
    const res = await githubAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    })
    return res.choices[0]?.message?.content?.trim() || content
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
  return msg.content[0].type === 'text' ? msg.content[0].text.trim() : content
}

// ─── Hashtags ──────────────────────────────────────────────────────────────────

export async function suggestHashtags(content: string, platform: Platform, plan: Plan): Promise<string[]> {
  const prompt = `Suggère 10 hashtags pertinents pour ce post ${platform}. Mélange populaires et de niche.

Post : ${content}

Réponds UNIQUEMENT en JSON : {"hashtags": ["#tag1", "#tag2", ...]}`

  if (plan === 'free') {
    const res = await githubAI.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      response_format: { type: 'json_object' },
    })
    const parsed = JSON.parse(res.choices[0]?.message?.content || '{}')
    return parsed.hashtags || []
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  return JSON.parse(text.trim()).hashtags || []
}

// ─── Génération d'image via Gemini 2.0 Flash (Imagen 3 / "Nano Banana 2") ─────

export async function generateImage(prompt: string): Promise<string | null> {
  try {
    if (!gemini) return null

    const model = gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-exp-image-generation',
    })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `Image professionnelle pour un post social media : ${prompt.slice(0, 800)}` }] }],
      generationConfig: {
        // @ts-expect-error responseModalities est un param Gemini image non encore typé dans le SDK
        responseModalities: ['image', 'text'],
      },
    })

    const parts = result.response.candidates?.[0]?.content?.parts || []
    for (const part of parts) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const p = part as any
      if (p.inlineData?.mimeType?.startsWith('image/')) {
        return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
      }
    }
    return null
  } catch (err) {
    console.error('[generateImage] Gemini error:', err)
    return null
  }
}

// ─── Export principal ──────────────────────────────────────────────────────────

export async function generatePosts(req: GenerateRequest, plan: Plan): Promise<GenerateResponse> {
  const isFree = plan === 'free' && !!process.env.GITHUB_TOKEN

  async function callAI(targetPlatform?: Platform): Promise<GenerateResponse> {
    if (isFree) {
      try {
        return await generateWithGitHub(req, targetPlatform)
      } catch (err) {
        console.error('[ai/generatePosts] GitHub Models failed, falling back to Claude:', err instanceof Error ? err.message : err)
        return await generateWithClaude(req, targetPlatform)
      }
    }
    return await generateWithClaude(req, targetPlatform)
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
      return { platform, text }
    })
  )

  const variants: Partial<Record<Platform, string>> = {}
  for (const { platform, text } of results) {
    variants[platform] = text
  }

  return { variants }
}

export async function generateWeekPosts(req: GenerateRequest, postsCount: number, plan: Plan): Promise<{ week: { day: number; topic: string; variants: Partial<Record<Platform, string>> }[] }> {
  const prompt = buildWeekPrompt(req, postsCount)

  if (plan === 'free' && process.env.GITHUB_TOKEN) {
    try {
      const res = await githubAI.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 3000,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      })
      const parsed = JSON.parse(res.choices[0]?.message?.content || '{"week":[]}')
      if (!Array.isArray(parsed.week) || parsed.week.length === 0) {
        console.warn('[ai/generateWeekPosts] GitHub Models returned empty week, falling back to Claude')
        throw new Error('Empty week response from GitHub Models')
      }
      return parsed
    } catch (err) {
      console.error('[ai/generateWeekPosts] GitHub Models failed, falling back to Claude:', err instanceof Error ? err.message : err)
    }
  }

  const msg = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{"week":[]}'
  const parsed = JSON.parse(text.trim())
  if (!Array.isArray(parsed.week)) {
    console.error('[ai/generateWeekPosts] Claude returned invalid week structure')
    throw new Error('Réponse invalide du modèle — veuillez réessayer')
  }
  return parsed
}
