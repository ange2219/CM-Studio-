'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { ChevronRight, ChevronLeft, Check, Sparkles, User, Building2, Briefcase, Megaphone, DollarSign, Users, Globe, Target, Trophy, Upload, Palette } from 'lucide-react'
import { PlatformIcon } from '@/components/ui/PlatformIcon'

interface OnboardingData {
  full_name: string
  account_type: string
  brand_name: string
  industry: string
  description: string
  website: string
  target_audience: string
  value_proposition: string
  tone: string
  logo_url: string
  color_primary: string
  color_secondary: string
  objectives: string[]
  content_pillars: string[]
  platforms: string[]
  username: string
}

const INITIAL: OnboardingData = {
  full_name: '',
  account_type: '',
  brand_name: '',
  industry: '',
  description: '',
  website: '',
  target_audience: '',
  value_proposition: '',
  tone: 'professionnel',
  logo_url: '',
  color_primary: '#1E57CD',
  color_secondary: '#059669',
  objectives: [],
  content_pillars: [],
  platforms: [],
  username: '',
}

const ACCOUNT_TYPES = [
  { value: 'freelance_cm', label: 'Community Manager Freelance', desc: 'Indépendant gérant les comptes de plusieurs clients', icon: User },
  { value: 'corporate_cm', label: 'Community Manager d\'entreprise', desc: 'Salarié gérant les comptes d\'une marque ou société', icon: Building2 },
  { value: 'agency', label: 'Agence Social Media', desc: 'Équipe ou agence gérant plusieurs marques clients', icon: Briefcase },
  { value: 'creator', label: 'Créateur de contenu', desc: 'Créateur, influenceur ou marque personnelle', icon: Sparkles },
  { value: 'com_manager', label: 'Responsable communication', desc: 'Responsable de la stratégie de com globale', icon: Megaphone },
]

const INDUSTRIES = [
  'Mode & Beauté', 'Tech & SaaS', 'E-commerce', 'Santé & Bien-être',
  'Finance & Crypto', 'Restauration & Food', 'Immobilier', 'Sport & Fitness',
  'Éducation', 'Art & Créativité', 'Voyage & Tourisme', 'Autre',
]

const TARGET_AUDIENCE_OPTIONS = [
  'Grand public', 'Entrepreneurs', 'Étudiants', 'Parents',
  'Professionnels', 'Entreprises', 'Autre',
]

const CONTENT_PILLARS_OPTIONS = [
  'Conseils', 'Tutoriels', 'Coulisses', 'Promotions',
  'Témoignages', 'Storytelling', 'Actualités', 'Divertissement', 'Éducation'
]

const TONES = [
  { value: 'professionnel', label: 'Professionnel', desc: 'Expert, crédible, soigné' },
  { value: 'moderne', label: 'Moderne', desc: 'Innovant, dynamique, frais' },
  { value: 'decontracte', label: 'Décontracté', desc: 'Sympathique, accessible, proche' },
  { value: 'inspirant', label: 'Inspirant', desc: 'Motivant, inspirant, visionnaire' },
  { value: 'premium', label: 'Premium', desc: 'Haut de gamme, élégant, sélectif' },
  { value: 'humoristique', label: 'Humoristique', desc: 'Amusant, léger, wit, fun' },
]

const OBJECTIVES = [
  { value: 'notoriete', label: 'Développer la notoriété', icon: Megaphone },
  { value: 'engagement', label: 'Augmenter l\'engagement', icon: Trophy },
  { value: 'ventes', label: 'Générer des ventes', icon: DollarSign },
  { value: 'leads', label: 'Générer des prospects', icon: Target },
  { value: 'fidelisation', label: 'Fidéliser les clients', icon: Globe },
  { value: 'communaute', label: 'Développer la communauté', icon: Users },
]

const PLATFORM_LABEL: Record<string, string> = {
  facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok',
  twitter: 'Twitter / X', linkedin: 'LinkedIn',
}
const PLATFORM_DESC: Record<string, string> = {
  facebook: 'Page professionnelle',
  instagram: 'Compte professionnel requis',
  tiktok: 'Compte TikTok',
  twitter: 'Compte Twitter / X',
  linkedin: 'Profil ou page LinkedIn',
}

const STEPS = ['Votre profil', 'Votre marque', 'Identité de la marque', 'Stratégie de contenu', 'Plateformes utilisées']

const STEP_META = [
  { motivation: 'Cette étape permet de configurer votre identité personnelle', title: 'Votre profil', subtitle: 'Présentez-vous pour personnaliser votre espace de travail' },
  { motivation: 'Cette étape permet à l\'IA de comprendre votre marque', title: 'Votre marque', subtitle: 'Quelques infos de base sur la marque que vous gérez' },
  { motivation: 'Cette étape permet à l\'IA d\'écrire comme votre marque', title: 'Identité de la marque', subtitle: 'Définissez la voix, la cible et le style visuel de la marque' },
  { motivation: 'Cette étape permet à l\'IA de construire votre stratégie', title: 'Stratégie de contenu', subtitle: 'Choisissez vos objectifs et vos formats de publication' },
  { motivation: 'Cette étape définit où vous publierez vos contenus', title: 'Plateformes utilisées', subtitle: 'Sélectionnez les réseaux sur lesquels vous êtes actif' },
]

const fieldStyle: React.CSSProperties = {
  display: 'block', width: '100%', background: 'var(--s2)',
  border: '1px solid var(--b1)', borderRadius: '8px',
  color: 'var(--t1)', fontSize: '.875rem', padding: '.6rem .85rem',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '.78rem', color: 'var(--t2)',
  fontWeight: 600, marginBottom: '.4rem',
}
const optionStyle: React.CSSProperties = {
  background: 'var(--s2)',
  color: 'var(--t1)',
}

function ChipGrid({ options, selected, onToggle, max }: {
  options: string[], selected: string[], onToggle: (v: string) => void, max?: number
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.45rem' }}>
      {options.map(opt => {
        const sel = selected.includes(opt)
        const disabled = !sel && max !== undefined && selected.length >= max
        return (
          <button
            key={opt}
            type="button"
            onClick={() => !disabled && onToggle(opt)}
            style={{
              padding: '.38rem .85rem', borderRadius: '20px', fontSize: '.82rem', fontWeight: 500,
              border: sel ? '1.5px solid var(--accent)' : '1px solid var(--b1)',
              background: sel ? 'rgba(30,87,205,0.12)' : 'var(--s2)',
              color: sel ? 'var(--accent)' : disabled ? 'var(--t3)' : 'var(--t2)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', opacity: disabled ? 0.45 : 1,
            }}
          >
            {sel && <Check size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(INITIAL)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Charger le profil utilisateur au montage
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(me => {
        if (me) {
          setData(prev => ({
            ...prev,
            full_name: me.full_name || '',
            username: me.username || '',
          }))
        }
      })
      .catch(() => {})
  }, [])

  // Permettre le défilement de la page entière uniquement pour l'onboarding (contournement du overflow: hidden global)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow
      
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
      
      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [])

  function update(key: keyof OnboardingData, value: unknown) {
    setData(prev => ({ ...prev, [key]: value }))
  }

  function toggleObjective(val: string) {
    setData(prev => ({
      ...prev,
      objectives: prev.objectives.includes(val)
        ? prev.objectives.filter(o => o !== val)
        : [...prev.objectives, val],
    }))
  }

  function toggleContentPillar(val: string) {
    setData(prev => ({
      ...prev,
      content_pillars: prev.content_pillars.includes(val)
        ? prev.content_pillars.filter(p => p !== val)
        : [...prev.content_pillars, val],
    }))
  }

  function togglePlatform(val: string) {
    setData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(val)
        ? prev.platforms.filter(p => p !== val)
        : [...prev.platforms, val],
    }))
  }

  // Détection des couleurs du logo via canvas
  function extractDominantColors(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = 50
        canvas.height = 50
        ctx.drawImage(img, 0, 0, 50, 50)
        const imgData = ctx.getImageData(0, 0, 50, 50).data
        
        const colorCounts: Record<string, number> = {}
        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i]
          const g = imgData[i+1]
          const b = imgData[i+2]
          const a = imgData[i+3]
          if (a < 150) continue // Ignorer transparent
          
          const qr = Math.round(r / 16) * 16
          const qg = Math.round(g / 16) * 16
          const qb = Math.round(b / 16) * 16
          const qhex = '#' + [qr, qg, qb].map(x => {
            const clamp = Math.max(0, Math.min(255, x))
            const hex = clamp.toString(16)
            return hex.length === 1 ? '0' + hex : hex
          }).join('')
          
          colorCounts[qhex] = (colorCounts[qhex] || 0) + 1
        }
        
        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1])
        if (sorted.length >= 2) {
          const primary = sorted[0][0]
          const secondary = sorted[1][0]
          setData(prev => ({
            ...prev,
            color_primary: primary,
            color_secondary: secondary,
          }))
          toast(`Identité visuelle détectée : Primaire ${primary}, Secondaire ${secondary}`, 'success')
        } else if (sorted.length >= 1) {
          const primary = sorted[0][0]
          setData(prev => ({
            ...prev,
            color_primary: primary,
            color_secondary: primary,
          }))
          toast(`Identité visuelle détectée : Primaire ${primary}`, 'success')
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    update('logo_url', URL.createObjectURL(file))
    extractDominantColors(file)
  }

  function canNext(): boolean {
    if (step === 0) return !!data.full_name?.trim() && !!data.account_type && !!data.username && /^[a-zA-Z0-9_-]{3,30}$/.test(data.username)
    if (step === 1) return !!data.brand_name?.trim() && !!data.industry && !!data.description?.trim()
    if (step === 2) return !!data.target_audience && !!data.value_proposition?.trim() && !!data.tone
    if (step === 3) return data.objectives.length >= 1 && data.content_pillars.length >= 1
    if (step === 4) return data.platforms.length >= 1
    return true
  }

  async function handleFinish() {
    setSaving(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erreur lors de la sauvegarde')
      }
      router.push('/home')
    } catch (err: any) {
      toast(err.message || 'Erreur lors de la sauvegarde', 'error')
      setSaving(false)
    }
  }

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setData(prev => ({ ...prev })) // force refresh
    document.documentElement.setAttribute('data-theme', next)
  }

  const meta = STEP_META[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmerOnboarding {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}} />
      <button onClick={toggleTheme} type="button" style={{ position: 'fixed', top: 20, right: 20, zIndex: 100, width: 40, height: 40, borderRadius: '50%', background: 'var(--card)', border: '1px solid var(--b1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px var(--shadow)' }}>
        {theme === 'dark'
          ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t1)" strokeWidth="1.8" strokeLinecap="round"><path d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75 9.75 9.75 0 0 1 8.25 6c0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 12c0 5.385 4.365 9.75 9.75 9.75 4.282 0 7.937-2.764 9.002-6.998Z"/></svg>
          : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t1)" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>
        }
      </button>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.06)', zIndex: 100 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,var(--accent),var(--accent-secondary))', width: `${progress}%`, transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)', boxShadow: '0 0 8px var(--accent)' }} />
      </div>

      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '3rem 1.5rem 2rem', position: 'relative' }}>

        <div style={{ position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse at center,var(--accent-light) 0%,transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
          <span style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(135deg,var(--accent),var(--accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>CM Studio</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem', maxWidth: '460px', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: '.6rem' }}>{meta.motivation}</p>
          <h1 style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: '1.9rem', fontWeight: 800, color: 'var(--t1)', lineHeight: 1.15, marginBottom: '.5rem' }}>{meta.title}</h1>
          <p style={{ fontSize: '.875rem', color: 'var(--t3)', lineHeight: 1.5 }}>{meta.subtitle}</p>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.6rem' }}>
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--t2)' }}>
              Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
            </span>
          </div>
          <div style={{ height: '8px', width: '100%', background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '12px', overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)' }}>
            <div 
              style={{ 
                height: '100%', 
                width: `${progress}%`, 
                background: 'linear-gradient(90deg, var(--accent), var(--accent-secondary))', 
                borderRadius: '12px', 
                transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', 
                position: 'relative',
                boxShadow: '0 0 10px var(--accent)'
              }} 
            >
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25) 50%, transparent)',
                animation: 'shimmerOnboarding 2.5s infinite linear',
                backgroundSize: '200% 100%'
              }} />
            </div>
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: '500px', background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.5rem', position: 'relative', zIndex: 1 }}>

          {/* ── Étape 1: Votre profil ── */}
          {step === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Nom et prénom *</label>
                <input style={fieldStyle} placeholder="Ex: Jean Dupont" value={data.full_name} onChange={e => update('full_name', e.target.value)} />
              </div>

              <div>
                <p style={labelStyle}>Type de profil *</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {ACCOUNT_TYPES.map(type => {
                    const selected = data.account_type === type.value
                    return (
                      <button key={type.value} type="button" onClick={() => update('account_type', type.value)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.75rem 1rem', borderRadius: '12px', textAlign: 'left', border: selected ? '1.5px solid var(--accent)' : '1px solid var(--b1)', background: selected ? 'var(--accent-light)' : 'var(--s2)', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: selected ? 'var(--accent-light)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <type.icon size={17} style={{ color: selected ? 'var(--accent)' : 'var(--t3)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '.875rem', fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--t1)', marginBottom: '.15rem' }}>{type.label}</div>
                          <div style={{ fontSize: '.75rem', color: 'var(--t3)' }}>{type.desc}</div>
                        </div>
                        {selected && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check size={11} color="#fff" /></div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Pseudo unique (ex: jean.dupont) *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--t3)', fontSize: '.88rem', fontWeight: 600 }}>@</span>
                  <input style={fieldStyle} placeholder="votre.pseudo" value={data.username} onChange={e => update('username', e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))} />
                </div>
                <p style={{ fontSize: '.72rem', color: 'var(--t3)', marginTop: '.3rem' }}>Sera affiché à la place de l&apos;email. 3 caractères minimum. Lettres, chiffres, tirets, underscores.</p>
              </div>
            </div>
          )}

          {/* ── Étape 2: Votre marque ── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Nom de la marque *</label>
                <input style={fieldStyle} placeholder="Ex: Pixel Agency" value={data.brand_name} onChange={e => update('brand_name', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Secteur d&apos;activité *</label>
                <select style={{ ...fieldStyle, cursor: 'pointer' }} value={data.industry} onChange={e => update('industry', e.target.value)}>
                  <option style={optionStyle} value="">Choisir un secteur...</option>
                  {INDUSTRIES.map(ind => <option style={optionStyle} key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Description de la marque *</label>
                <textarea style={{ ...fieldStyle, resize: 'none' }} rows={3} placeholder="Ce que fait la marque, sa mission, son offre de produits..." value={data.description} onChange={e => update('description', e.target.value)} />
                <p style={{ fontSize: '.72rem', color: 'var(--t3)', marginTop: '.3rem' }}>L&apos;IA utilisera cette description pour contextualiser chaque publication</p>
              </div>

              <div>
                <label style={labelStyle}>Site web <span style={{ fontWeight: 400, color: 'var(--t3)' }}>(optionnel)</span></label>
                <input style={fieldStyle} placeholder="https://votre-site.com" value={data.website} onChange={e => update('website', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Étape 3: Identité de la marque ── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={labelStyle}>Public cible *</label>
                <select style={{ ...fieldStyle, cursor: 'pointer' }} value={data.target_audience} onChange={e => update('target_audience', e.target.value)}>
                  <option style={optionStyle} value="">Choisir la cible principale...</option>
                  {TARGET_AUDIENCE_OPTIONS.map(o => <option style={optionStyle} key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Pourquoi les clients choisissent-ils cette marque ? *</label>
                <textarea style={{ ...fieldStyle, resize: 'none' }} rows={2.5} placeholder="Décrivez votre proposition de valeur unique, pourquoi vous êtes choisi plutôt qu'un autre..." value={data.value_proposition} onChange={e => update('value_proposition', e.target.value)} />
              </div>

              <div>
                <label style={labelStyle}>Ton de communication *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  {TONES.map(t => {
                    const sel = data.tone === t.value
                    return (
                      <button key={t.value} type="button" onClick={() => update('tone', t.value)} style={{ padding: '.6rem .75rem', borderRadius: '12px', textAlign: 'left', border: sel ? '1.5px solid var(--accent)' : '1px solid var(--b1)', background: sel ? 'var(--accent-light)' : 'var(--s2)', cursor: 'pointer', transition: 'all 0.2s' }}>
                        <div style={{ fontSize: '.825rem', fontWeight: 600, color: sel ? 'var(--accent)' : 'var(--t1)', marginBottom: '.15rem' }}>{t.label}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--t3)', lineHeight: 1.25 }}>{t.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Logo de la marque <span style={{ fontWeight: 400, color: 'var(--t3)' }}>(facultatif)</span></label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--s2)', padding: '.75rem', borderRadius: '12px', border: '1px dashed var(--b1)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--b1)' }}>
                    {data.logo_url ? (
                      <img src={data.logo_url} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <Upload size={18} style={{ color: 'var(--t3)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <input type="file" accept="image/*" id="logo-onboarding" style={{ display: 'none' }} onChange={handleLogoChange} />
                    <label htmlFor="logo-onboarding" style={{ fontSize: '.75rem', fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', padding: '.3rem .6rem', background: 'var(--accent-light)', borderRadius: '6px', border: '1px solid var(--accent)' }}>
                      Choisir une image
                    </label>
                    <p style={{ fontSize: '.68rem', color: 'var(--t3)', marginTop: '.25rem' }}>Extraction auto des couleurs primaires/secondaires</p>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', background: 'var(--s2)', padding: '.75rem', borderRadius: '12px', border: '1px solid var(--b1)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: data.color_primary, border: '1px solid var(--b1)', cursor: 'pointer', display: 'inline-block' }} />
                  <div>
                    <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Primaire</div>
                    <input type="color" value={data.color_primary} onChange={e => update('color_primary', e.target.value)} style={{ border: 'none', padding: 0, width: 0, height: 0, opacity: 0, position: 'absolute' }} id="primary-color-picker" />
                    <label htmlFor="primary-color-picker" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t1)', cursor: 'pointer' }}>{data.color_primary}</label>
                  </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: data.color_secondary, border: '1px solid var(--b1)', cursor: 'pointer', display: 'inline-block' }} />
                  <div>
                    <div style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Secondaire</div>
                    <input type="color" value={data.color_secondary} onChange={e => update('color_secondary', e.target.value)} style={{ border: 'none', padding: 0, width: 0, height: 0, opacity: 0, position: 'absolute' }} id="secondary-color-picker" />
                    <label htmlFor="secondary-color-picker" style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--t1)', cursor: 'pointer' }}>{data.color_secondary}</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Étape 4: Stratégie de contenu ── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={labelStyle}>Objectifs de marque <span style={{ fontWeight: 400, color: 'var(--t3)' }}>(sélectionnez au moins un)</span></label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                  {OBJECTIVES.map(obj => {
                    const selected = data.objectives.includes(obj.value)
                    return (
                      <button key={obj.value} type="button" onClick={() => toggleObjective(obj.value)} style={{ padding: '.75rem', borderRadius: '12px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '.6rem', border: selected ? '1.5px solid var(--accent)' : '1px solid var(--b1)', background: selected ? 'var(--accent-light)' : 'var(--s2)', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}>
                        <obj.icon size={15} style={{ color: selected ? 'var(--accent)' : 'var(--t3)', flexShrink: 0 }} />
                        <span style={{ fontSize: '.8rem', fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--t1)' }}>{obj.label}</span>
                        {selected && <div style={{ position: 'absolute', top: 5, right: 5, width: 14, height: 14, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={8} color="#fff" /></div>}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Types de contenus publiés <span style={{ fontWeight: 400, color: 'var(--t3)' }}>(sélection multiple)</span></label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                  {CONTENT_PILLARS_OPTIONS.map(opt => {
                    const selected = data.content_pillars.includes(opt)
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleContentPillar(opt)}
                        style={{
                          padding: '.4rem .8rem',
                          borderRadius: '20px',
                          fontSize: '.78rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          border: selected ? '1px solid var(--accent)' : '1px solid var(--b1)',
                          background: selected ? 'var(--accent-light)' : 'var(--s2)',
                          color: selected ? 'var(--accent)' : 'var(--t2)',
                        }}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Étape 5: Plateformes utilisées ── */}
          {step === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <p style={{ fontSize: '.8rem', color: 'var(--t3)', lineHeight: 1.4 }}>
                Sélectionnez les réseaux sur lesquels vous publiez activement. <strong style={{ color: 'var(--t2)' }}>Aucune connexion de compte n&apos;est requise maintenant.</strong>
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.6rem' }}>
                {([
                  { id: 'facebook', name: 'Facebook', color: '#1877f2' },
                  { id: 'instagram', name: 'Instagram', color: '#e1306c' },
                  { id: 'tiktok', name: 'TikTok', color: '#000000' },
                  { id: 'linkedin', name: 'LinkedIn', color: '#0a66c2' },
                  { id: 'twitter', name: 'X (Twitter)', color: '#000000' },
                  { id: 'pinterest', name: 'Pinterest', color: '#bd081c' },
                  { id: 'youtube', name: 'YouTube', color: '#ff0000' },
                  { id: 'snapchat', name: 'Snapchat', color: '#fffc00' }
                ]).map(p => {
                  const selected = data.platforms.includes(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlatform(p.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '.75rem',
                        padding: '.75rem .9rem',
                        borderRadius: '12px',
                        border: selected ? '1.5px solid var(--accent)' : '1px solid var(--b1)',
                        background: selected ? 'var(--accent-light)' : 'var(--s2)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left',
                        position: 'relative'
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: p.id === 'tiktok' || p.id === 'twitter' ? '#111' : 'transparent', flexShrink: 0 }}>
                        {p.id === 'pinterest' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={p.color}><path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.16-.1-.95-.19-2.4.04-3.43.21-.92 1.35-5.72 1.35-5.72s-.34-.69-.34-1.7c0-1.59.92-2.78 2.07-2.78 1.02 0 1.52.77 1.52 1.69 0 1.03-.66 2.57-1 3.99-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.51 0-2.88-2.07-4.9-5.03-4.9-3.43 0-5.44 2.57-5.44 5.22 0 1.04.4 2.15.9 2.75.1.12.11.23.08.35-.09.38-.29 1.18-.33 1.35-.06.23-.19.28-.43.17-1.6-.74-2.6-3.08-2.6-4.95 0-4.03 2.93-7.73 8.44-7.73 4.43 0 7.87 3.16 7.87 7.38 0 4.4-2.77 7.94-6.62 7.94-1.29 0-2.51-.67-2.93-1.47l-.8 3.03c-.29 1.1-.1.2.4.92 1.1 2.2 4.6 3.6 8.6 3.6 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
                        )}
                        {p.id === 'youtube' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill={p.color}><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        )}
                        {p.id === 'snapchat' && (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="#EBF01B"><path d="M12 2.766c-2.977 0-6.19 1.834-6.19 5.845 0 .285.04.58.118.882-.53-.162-1.077-.245-1.634-.245-1.42 0-2.294.673-2.294 1.776 0 .807.508 1.488 1.492 1.633a2.38 2.38 0 00-.31 1.139c0 1.05.679 1.674 1.775 1.674.373 0 .741-.065 1.082-.193.308.977.893 2.138 2.051 2.859-.444.333-.941.696-1.427.973-.807.458-1.503.882-1.503 1.61 0 .747.882 1.066 2.33 1.066h8.02c1.448 0 2.33-.319 2.33-1.066 0-.728-.696-1.152-1.503-1.61-.486-.277-.983-.64-1.427-.973 1.158-.721 1.743-1.882 2.051-2.859.34.128.708.193 1.082.193 1.096 0 1.775-.624 1.775-1.674 0-.422-.113-.815-.31-1.139.984-.145 1.492-.826 1.492-1.633 0-1.103-.874-1.776-2.294-1.776-.557 0-1.104.083-1.634.245.078-.302.118-.597.118-.882 0-4.011-3.213-5.845-6.19-5.845z" fill="#000"/></svg>
                        )}
                        {p.id !== 'pinterest' && p.id !== 'youtube' && p.id !== 'snapchat' && (
                          <PlatformIcon platform={p.id as never} size={28} />
                        )}
                      </div>
                      <span style={{ fontSize: '.85rem', fontWeight: 600, color: selected ? 'var(--accent)' : 'var(--t1)' }}>{p.name}</span>
                      {selected && <div style={{ position: 'absolute', top: 6, right: 6, width: 15, height: 15, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={9} color="#fff" /></div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--b1)' }}>
            <button type="button" onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', color: step === 0 ? 'var(--t3)' : 'var(--t2)', background: 'none', border: 'none', cursor: step === 0 ? 'not-allowed' : 'pointer', padding: 0 }}>
              <ChevronLeft size={16} /> Précédent
            </button>

            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canNext()} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: canNext() ? 'var(--blue)' : 'rgba(255,255,255,0.06)', color: canNext() ? '#fff' : 'var(--t3)', border: 'none', borderRadius: '8px', padding: '.55rem 1.2rem', fontSize: '.875rem', fontWeight: 600, cursor: canNext() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                Continuer <ChevronRight size={16} />
              </button>
            ) : (
              <button type="button" onClick={handleFinish} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '.4rem', background: saving ? 'rgba(255,255,255,0.06)' : 'var(--blue)', color: saving ? 'var(--t3)' : '#fff', border: 'none', borderRadius: '8px', padding: '.55rem 1.2rem', fontSize: '.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {saving ? 'Finalisation...' : <><Check size={15} style={{ marginRight: '.2rem' }} /> Accéder à CM Studio</>}
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  )
}
