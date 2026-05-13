import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'

const Schema = z.object({ brief: z.string().min(3).max(2000) })

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

  const { brief } = parsed.data

  try {
    const completion = await githubAI.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      max_tokens: 10,
      messages: [
        {
          role: 'system',
          content: `Tu es un expert en stratégie social media. Analyse le brief ci-dessous et détermine l'objectif principal du post en UN SEUL MOT.

Exemples de mots possibles : Vendre, Engager, Éduquer, Inspirer, Annoncer, Fidéliser, Recruter, Promouvoir, Informer, Divertir, Convertir, Sensibiliser, Témoigner, Lancer, Célébrer...

Tu n'es PAS limité à cette liste. Choisis le mot le plus pertinent pour décrire l'intention du brief.

Réponds UNIQUEMENT avec un seul mot, première lettre en majuscule.`,
        },
        { role: 'user', content: brief },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim() ?? ''
    // Prendre uniquement le premier mot, nettoyé
    const objective = raw.split(/\s+/)[0]?.replace(/[^a-zA-ZÀ-ÿ]/g, '') || null
    return NextResponse.json({ objective })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Detection failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
