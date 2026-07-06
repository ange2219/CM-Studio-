import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

const OnboardingSchema = z.object({
  full_name:          z.string().min(1, "Le nom et prénom sont obligatoires.").max(200),
  account_type:       z.string().min(1, "Le type de profil est obligatoire.").max(50),
  brand_name:         z.string().min(1, "Le nom de la marque est obligatoire.").max(100),
  industry:           z.string().min(1, "Le secteur d'activité est obligatoire.").max(100),
  description:        z.string().min(1, "La description de la marque est obligatoire.").max(2000),
  website:            z.string().url().optional().or(z.literal('')),
  target_audience:    z.string().min(1, "Le public cible est obligatoire.").max(500),
  value_proposition:  z.string().min(1, "La proposition de valeur est obligatoire.").max(2000),
  tone:               z.string().min(1, "Le ton de communication est obligatoire.").max(50),
  logo_url:           z.string().url().optional().or(z.literal('')),
  color_primary:      z.string().max(20).optional().or(z.literal('')),
  color_secondary:    z.string().max(20).optional().or(z.literal('')),
  objectives:         z.array(z.string().max(100)).min(1, "Veuillez choisir au moins un objectif.").max(10),
  content_pillars:    z.array(z.string().max(100)).min(1, "Veuillez choisir au moins un type de contenu.").max(15),
  platforms:          z.array(z.string().max(50)).min(1, "Veuillez choisir au moins une plateforme.").max(10),
  username:           z.string().regex(/^[a-zA-Z0-9_-]{3,30}$/, "Le pseudo doit faire entre 3 et 30 caractères (lettres, chiffres, tirets, underscores)."),
})

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = OnboardingSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data
  const admin = createAdminClient()

  // Sauvegarder le profil de marque complet
  const { error: brandError } = await admin
    .from('brand_profiles')
    .upsert({
      user_id:             user.id,
      account_type:        data.account_type,
      brand_name:          data.brand_name,
      industry:            data.industry,
      description:         data.description,
      website:             data.website,
      target_audience:     data.target_audience,
      tone:                data.tone,
      objectives:          data.objectives,
      content_pillars:     data.content_pillars,
      audience_interests:  data.value_proposition, // Storing value proposition in audience_interests
      audience_location:   JSON.stringify({       // Storing logo, colors and platforms in audience_location
        logo_url: data.logo_url || '',
        color_primary: data.color_primary || '',
        color_secondary: data.color_secondary || '',
        platforms: data.platforms || [],
      }),
      updated_at:          new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (brandError) return NextResponse.json({ error: brandError.message }, { status: 500 })

  // Vérifier l'unicité du pseudo si fourni
  if (data.username) {
    const cleanUsername = data.username.toLowerCase().trim()
    const { data: existing } = await admin.from('users').select('id').eq('username', cleanUsername).neq('id', user.id).maybeSingle()
    if (existing) {
      return NextResponse.json({ error: 'Ce pseudo est déjà utilisé. Veuillez en choisir un autre.' }, { status: 400 })
    }
  }

  // Marquer l'utilisateur comme onboardé et mettre à jour le pseudo/nom complet s'ils sont fournis
  const { error: userError } = await admin
    .from('users')
    .update({ 
      onboarded: true,
      full_name: data.full_name.trim(),
      ...(data.username ? { username: data.username.toLowerCase().trim() } : {})
    })
    .eq('id', user.id)

  if (userError) {
    if (userError.code === '23505') {
      return NextResponse.json({ error: 'Ce pseudo est déjà utilisé. Veuillez en choisir un autre.' }, { status: 400 })
    }
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('onboarded', '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
