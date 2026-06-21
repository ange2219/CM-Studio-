import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'

const Schema = z.object({
  brief: z.string().min(3).max(2000),
  platforms: z.array(z.string()).optional(),
})

const githubAI = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN || 'dummy',
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'brief invalide' }, { status: 400 })

  const { brief, platforms } = parsed.data
  const platformList = platforms?.length ? platforms.join(', ') : 'non spécifiées'

  try {
    const completion = await githubAI.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 120,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en stratégie social media. Analyse le brief et les plateformes cibles pour déterminer :
1. L'objectif principal du post en UN SEUL MOT (ex: Vendre, Engager, Éduquer, Inspirer, Recruter, Promouvoir, Informer, Célébrer... tu n'es pas limité).
2. Les paramètres optimaux pour ce brief et ces plateformes.

Plateformes cibles : ${platformList}

Pour les paramètres, choisis parmi ces valeurs EXACTES :
- length : "court" (Twitter, TikTok), "moyen" (usage courant), "long" (LinkedIn, Facebook)
- format : "direct" (message clair), "liste" (points structurés), "narratif" (histoire), "question" (interpeller)
- tone : "direct", "inspirant", "emotionnel", "humoristique", "professionnel"
- cta : "acheter", "commenter", "partager", "en_savoir_plus", "aucun"

Réponds UNIQUEMENT en JSON :
{"objective": "Mot", "params": {"length": "...", "format": "...", "tone": "...", "cta": "..."}}`,
        },
        { role: 'user', content: brief },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? '{}'
    const result = JSON.parse(raw)

    const objective = typeof result.objective === 'string'
      ? result.objective.split(/\s+/)[0]?.replace(/[^a-zA-ZÀ-ÿ]/g, '') || null
      : null

    // Valider les params retournés
    const validLengths = ['court', 'moyen', 'long']
    const validFormats = ['direct', 'liste', 'narratif', 'question']
    const validTones = ['direct', 'inspirant', 'emotionnel', 'humoristique', 'professionnel']
    const validCtas = ['acheter', 'commenter', 'partager', 'en_savoir_plus', 'aucun']

    const params = result.params && typeof result.params === 'object' ? {
      length: validLengths.includes(result.params.length) ? result.params.length : 'moyen',
      format: validFormats.includes(result.params.format) ? result.params.format : 'direct',
      tone:   validTones.includes(result.params.tone)     ? result.params.tone   : 'professionnel',
      cta:    validCtas.includes(result.params.cta)        ? result.params.cta    : 'aucun',
    } : null

    return NextResponse.json({ objective, params })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Detection failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
