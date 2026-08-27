/**
 * Système de génération d'images personnalisées par marque
 * Couche 1 : Classification automatique du type d'image
 * Couche 2 : Transformateur IA Post → Prompt (chaîne Gemini → Claude → GPT)
 * Couche 3 : Constructeur de prompt de base (fallback)
 * Couche 4 : Génération des pixels via Pollinations/Flux (gratuit, sans clé)
 */

import { callSimpleAI } from './ai'
import type { Platform, Plan } from '@/types'

// Instantiation moved inside the function to prevent build errors

// ─── Types ────────────────────────────────────────────────────────────────────

export type ImageType =
  | 'infographic'   // Schéma, étapes numérotées, organigramme
  | 'cover'         // Visuel épuré avec titre centré
  | 'lifestyle'     // Photo réaliste, ambiance, émotion
  | 'product'       // Mise en valeur d'un produit/service
  | 'quote'         // Citation sur fond graphique
  | 'data_visual'   // Graphique, stats, dashboard
  | 'tutorial'      // Étapes illustrées, how-to

export interface BrandContext {
  brand_name: string
  industry: string
  tone: string
  description?: string
  target_audience?: string
  color_primary?: string
  color_secondary?: string
  visual_style?: string
}

export interface ImagePromptContext {
  postContent: string
  imageType: ImageType
  brand: BrandContext
  platform: Platform
  tone?: string
}

export interface ImageResult {
  url: string
  provider: 'pollinations-flux'
  imageType: ImageType
}

// ─── Couche 1 : Classification ────────────────────────────────────────────────

const KEYWORD_TYPE_MAP: Record<ImageType, string[]> = {
  infographic: ['étapes', 'comment', 'guide', 'processus', 'workflow', 'schéma', 'structure', 'liste', 'méthode en', 'top ', 'les ', 'clés'],
  data_visual: ['statistiques', 'données', 'résultats', 'chiffres', '%', 'étude', 'analyse', 'rapport', 'croissance', 'performance'],
  quote:       ['citation', 'inspiration', 'leçon', 'conseil', 'vérité', '"', '«', 'croire', 'mantra', 'mindset'],
  tutorial:    ['tutoriel', 'apprendre', 'astuce', 'tip', 'comment faire', 'tuto', 'formation', 'explique', 'découvrez'],
  lifestyle:   ['expérience', 'moment', 'vécu', 'ressenti', 'partage', 'vie', 'quotidien', 'équipe', 'coulisses', 'derrière'],
  product:     ['produit', 'service', 'offre', 'lancement', 'nouveau', 'disponible', 'commandez', 'découvrez notre', 'promo'],
  cover:       ['annonce', 'événement', 'news', 'webinar', 'podcast', 'partenariat', 'collaboration', 'live'],
}

const INDUSTRY_TYPE_MAP: Record<string, ImageType[]> = {
  'Tech & SaaS':          ['infographic', 'data_visual', 'tutorial', 'cover'],
  'E-commerce':           ['product', 'lifestyle', 'cover'],
  'Mode & Beauté':        ['lifestyle', 'product', 'cover'],
  'Restauration & Food':  ['lifestyle', 'product', 'cover'],
  'Finance & Crypto':     ['data_visual', 'infographic', 'cover'],
  'Santé & Bien-être':    ['lifestyle', 'quote', 'infographic'],
  'Éducation':            ['tutorial', 'infographic', 'quote'],
  'Sport & Fitness':      ['lifestyle', 'quote', 'infographic'],
  'Immobilier':           ['lifestyle', 'cover', 'product'],
  'Art & Créativité':     ['lifestyle', 'cover', 'quote'],
  'Voyage & Tourisme':    ['lifestyle', 'cover', 'product'],
  'Autre':                ['cover', 'lifestyle', 'infographic'],
}

export function classifyImageType(postContent: string, industry: string): ImageType {
  const content = postContent.toLowerCase()

  // 1. Check keywords (priorité haute — plus précis)
  let bestType: ImageType = 'cover'
  let bestScore = 0

  for (const [type, keywords] of Object.entries(KEYWORD_TYPE_MAP) as [ImageType, string[]][]) {
    const score = keywords.filter(kw => content.includes(kw)).length
    if (score > bestScore) {
      bestScore = score
      bestType = type
    }
  }

  if (bestScore > 0) return bestType

  // 2. Fallback sur le secteur
  const industryTypes = INDUSTRY_TYPE_MAP[industry] || ['cover', 'lifestyle']
  return industryTypes[0]
}

// ─── Couche 2 : Prompt builder ────────────────────────────────────────────────

// Flux/Pollinations ne sait PAS écrire de texte lisible : toute demande de
// typographie, chiffres ou étapes numérotées produit des fausses lettres.
// → Chaque guide décrit une SCÈNE VISUELLE concrète, jamais de texte.
const NO_TEXT_NEGATIVE =
  'no text, no words, no letters, no numbers, no typography, no captions, no labels, no watermark, no logo, no signage, no UI elements'

const IMAGE_STYLE_GUIDES: Record<ImageType, { base: string; negative: string }> = {
  infographic: {
    base: 'Clean conceptual still-life or symbolic flat-lay representing the topic purely through real objects and composition, soft studio lighting, minimal modern aesthetic, generous negative space',
    negative: NO_TEXT_NEGATIVE + ', no diagrams, no arrows, no charts, no step numbers',
  },
  data_visual: {
    base: 'Abstract visual metaphor of growth and progress: elegant ascending 3D shapes, flowing lines or layered translucent forms, minimal corporate aesthetic, soft gradients, shallow depth of field',
    negative: NO_TEXT_NEGATIVE + ', no real charts, no axes, no data figures',
  },
  cover: {
    base: 'Bold editorial hero photograph, cinematic composition with a single strong subject, dramatic professional lighting, high visual impact, premium magazine quality',
    negative: NO_TEXT_NEGATIVE + ', no title bar, no poster layout',
  },
  lifestyle: {
    base: 'Authentic lifestyle photography, natural light, a genuine human moment in a real environment, candid and emotional, editorial quality, shallow depth of field',
    negative: NO_TEXT_NEGATIVE + ', no obvious stock-photo staging',
  },
  product: {
    base: 'Premium product photography, the product as hero on a clean or softly styled contextual surface, sharp focus, flattering studio lighting, commercial quality',
    negative: NO_TEXT_NEGATIVE + ', no cluttered background',
  },
  quote: {
    base: 'Evocative atmospheric scene with a calm, inspiring mood, soft directional light and rich texture, cinematic and minimal, open uncluttered composition',
    negative: NO_TEXT_NEGATIVE + ', no quote card, no lettering',
  },
  tutorial: {
    base: 'Single clean photographic scene showing hands performing the key action in context, natural light, close-up, authentic instructional feel',
    negative: NO_TEXT_NEGATIVE + ', no step numbers, no annotations',
  },
}

const TONE_VISUAL_STYLES: Record<string, string> = {
  direct:        'direct and striking visual tone, high contrast, bold and clean composition, no clutter',
  inspirant:     'uplifting and aspirational visual tone, dramatic lighting, motivational energy',
  emotionnel:    'authentic and emotional visual tone, warm lighting, human connection and depth',
  humoristique:  'playful and vibrant visual tone, bold colors, dynamic and fun composition',
  professionnel: 'expert and corporate visual tone, clean minimal aesthetic, authoritative and trustworthy',
}

const PLATFORM_SPECS: Record<Platform, string> = {
  instagram: '1:1 square or 4:5 portrait format, visually bold for mobile feed',
  facebook:  '1.91:1 landscape format, clear at small size in feed',
  linkedin:  '1.91:1 landscape format, professional context, clean and legible composition',
  twitter:   '16:9 landscape format, high contrast for timeline',
  tiktok:    '9:16 vertical format, dynamic and eye-catching',
  youtube:   '16:9 landscape format, thumbnail-optimized, bold high-contrast subject',
  pinterest: '2:3 portrait format, vertical scroll-stopping composition',
}

const INDUSTRY_COLOR_HINTS: Record<string, string> = {
  'Tech & SaaS':         'dark blue, electric blue, white, indigo palette',
  'E-commerce':          'brand-appropriate, clean white with accent colors',
  'Mode & Beauté':       'sophisticated neutrals or brand palette, luxurious feel',
  'Restauration & Food': 'warm earthy tones, appetizing warm lighting',
  'Finance & Crypto':    'deep navy, gold accents, professional green or blue',
  'Santé & Bien-être':   'calming greens, soft blues, natural tones',
  'Éducation':           'bright and accessible, blue and yellow palette',
  'Sport & Fitness':     'energetic bold colors, high contrast, dynamic',
  'Immobilier':          'sophisticated neutrals, premium feel, grey and gold',
  'Art & Créativité':    'vibrant creative palette, expressive colors',
  'Voyage & Tourisme':   'vivid travel colors, sky blue, warm sunsets',
  'Autre':               'clean professional palette',
}

export function buildImagePrompt(ctx: ImagePromptContext): string {
  const styleGuide = IMAGE_STYLE_GUIDES[ctx.imageType]
  const platformSpec = PLATFORM_SPECS[ctx.platform]
  const toneStyle = (ctx.tone ? TONE_VISUAL_STYLES[ctx.tone] : undefined) || TONE_VISUAL_STYLES.professionnel
  const colorHint = ctx.brand.color_primary
    ? `Color palette: primary ${ctx.brand.color_primary}${ctx.brand.color_secondary ? `, secondary ${ctx.brand.color_secondary}` : ''}`
    : `Color palette: ${INDUSTRY_COLOR_HINTS[ctx.brand.industry] || 'clean professional palette'}`

  const contentSnippet = ctx.postContent.slice(0, 200)

  return [
    'Professional social media visual, ONE single coherent photographic scene.',
    styleGuide.base,
    `Brand: ${ctx.brand.brand_name}, ${ctx.brand.industry} industry.`,
    `Visual tone: ${toneStyle}.`,
    colorHint + '.',
    `Platform optimized: ${platformSpec}.`,
    ctx.brand.target_audience ? `Target audience: ${ctx.brand.target_audience}.` : '',
    `Subject to evoke visually (do NOT write these words in the image): ${contentSnippet}.`,
    `Strict constraints — ${styleGuide.negative}.`,
  ].filter(Boolean).join(' ')
}

// ─── Couche 3 : Post → Image Prompt Transformer ───────────────────────────────

/**
 * Transforme un post social en prompt d'image détaillé et précis.
 * Utilise la chaîne IA partagée (Gemini → Claude → GPT) via callSimpleAI.
 * Fallback sur buildImagePrompt() si aucun fournisseur n'est disponible.
 */
export async function transformPostToImagePrompt(
  ctx: ImagePromptContext
): Promise<string> {
  const { brand, postContent, platform, imageType } = ctx

  const styleGuide = IMAGE_STYLE_GUIDES[imageType]
  const platformSpec = PLATFORM_SPECS[platform]
  const colorInfo = brand.color_primary
    ? `Brand colors: primary ${brand.color_primary}${brand.color_secondary ? `, secondary ${brand.color_secondary}` : ''}`
    : `Industry: ${brand.industry} → use ${INDUSTRY_COLOR_HINTS[brand.industry] || 'professional'} palette`

  const prompt = `You are an expert art director specializing in AI image generation for social media.
Transform the social media post below into a precise, optimized image generation prompt for the Flux model.

Rules:
- Describe ONE single, concrete, coherent visual scene (realistic photography or clean 3D/illustration)
- ABSOLUTELY NO text, words, letters, numbers, typography, captions, labels, charts or infographics in the image. AI image generators render text as unreadable garbled shapes, so the scene must be 100% visual.
- Integrate the brand colors as dominant tones of the composition (lighting, materials, environment) — NEVER as written text
- Match the visual style to the content type: ${styleGuide.base}
- Target format: ${platformSpec}
- Be specific about: subject, composition, lighting, color palette, mood, camera/lens or render style
- End the prompt with these exact negative constraints: ${styleGuide.negative}
- Reply ONLY with the final image prompt, written in English, no explanation or preamble
- Maximum 200 words

Brand: ${brand.brand_name} (${brand.industry})
Tone: ${brand.tone}
${brand.target_audience ? `Audience: ${brand.target_audience}` : ''}
${brand.description ? `Description: ${brand.description}` : ''}
${colorInfo}
${brand.visual_style ? `Desired visual style: ${brand.visual_style}` : ''}

Post (use ONLY as inspiration for the subject — never reproduce its text in the image):
---
${postContent}
---

Generate the image prompt for this post.`

  try {
    const text = (await callSimpleAI(prompt, false)).trim()
    if (text.length > 50) {
      console.log(`[post-to-prompt] prompt IA généré (${text.length} chars)`)
      return text
    }
  } catch (err) {
    console.warn('[post-to-prompt] IA indisponible, fallback prompt statique :', err instanceof Error ? err.message : err)
  }

  return buildImagePrompt(ctx)
}

// ─── Couche 4 : Génération des pixels via Pollinations/Flux ────────────────────

/**
 * Génère les pixels via Pollinations.ai (modèle Flux) — gratuit, sans clé.
 * Le prompt reçu est déjà nettoyé de toute demande de texte en amont
 * (guides de style + transformateur IA), pour éviter les fausses lettres.
 */
async function generateWithPollinations(prompt: string): Promise<string> {
  const encoded = encodeURIComponent(prompt.slice(0, 1500))
  const seed = Math.floor(Math.random() * 99999)
  const url = `https://image.pollinations.ai/prompt/${encoded}?model=flux&width=1024&height=1024&seed=${seed}&nologo=true&enhance=true`
  const res = await fetch(url, { signal: AbortSignal.timeout(55000) })
  if (!res.ok) throw new Error(`Pollinations error: ${res.status} ${res.statusText}`)
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const buffer = await res.arrayBuffer()
  const base64 = Buffer.from(buffer).toString('base64')
  return `data:${contentType};base64,${base64}`
}

/**
 * Génère l'image de marque via Pollinations/Flux (gratuit).
 * Pipeline : classification → transformateur IA (Post→prompt sans texte) → pixels Flux.
 */
export async function generateBrandedImage(
  ctx: ImagePromptContext,
  _plan: Plan
): Promise<ImageResult> {
  console.log(`[image-generation] type=${ctx.imageType} platform=${ctx.platform}`)

  // Transformer IA : Post → prompt visuel précis, SANS texte (fallback statique intégré)
  const prompt = await transformPostToImagePrompt(ctx)
  console.log(`[image-generation] prompt (200 chars): ${prompt.slice(0, 200)}`)

  const url = await generateWithPollinations(prompt)
  return { url, provider: 'pollinations-flux', imageType: ctx.imageType }
}
