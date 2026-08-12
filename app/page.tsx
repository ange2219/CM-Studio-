'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PlatformIcon } from '@/components/ui/PlatformIcon'
import { 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  Image as ImageIcon, 
  ShieldCheck, 
  ChevronDown, 
  MessageSquare, 
  Clock, 
  Share2, 
  Check, 
  Star,
  Globe,
  Bot,
  Flame,
  LayoutGrid
} from 'lucide-react'

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'linkedin' | 'instagram' | 'facebook' | 'tiktok'>('linkedin')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--t1)', fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── 1. NAVBAR TOP ── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--b1)',
        padding: '0.85rem 1.5rem',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent), #6366F1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(22, 119, 255, 0.35)',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--t1)', lineHeight: 1.1 }}>
                CM Studio <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'var(--accent-light)', color: 'var(--accent)', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase', marginLeft: 4 }}>AI 3.0</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--t3)', fontWeight: 500 }}>Social Media Copilot</div>
            </div>
          </Link>

          {/* Nav Links */}
          <nav style={{ display: 'none', gap: '1.75rem', alignItems: 'center' }} className="md:flex">
            <a href="#features" style={{ fontSize: '0.875rem', color: 'var(--t2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}>Fonctionnalités</a>
            <a href="#pipeline" style={{ fontSize: '0.875rem', color: 'var(--t2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}>Pipeline IA</a>
            <a href="#demo" style={{ fontSize: '0.875rem', color: 'var(--t2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}>Démo en direct</a>
            <a href="#pricing" style={{ fontSize: '0.875rem', color: 'var(--t2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}>Tarifs</a>
            <a href="#faq" style={{ fontSize: '0.875rem', color: 'var(--t2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--t2)'}>FAQ</a>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link href="/login" style={{
              padding: '0.55rem 1.1rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--t1)',
              border: '1px solid var(--b1)',
              background: 'var(--s2)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}>
              Se connecter
            </Link>

            <Link href="/login" style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, var(--accent), #4F46E5)',
              boxShadow: '0 4px 16px rgba(22, 119, 255, 0.35)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'transform 0.2s, boxShadow 0.2s',
            }}>
              Essayer gratuitement <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION ── */}
      <section style={{
        position: 'relative',
        padding: '5rem 1.5rem 3.5rem',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(22, 119, 255, 0.15) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge top */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.9rem',
            borderRadius: '20px',
            background: 'var(--accent-light)',
            border: '1px solid rgba(22, 119, 255, 0.25)',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--accent)',
            marginBottom: '1.5rem',
          }}>
            <Flame size={14} style={{ color: '#F59E0B' }} />
            <span>Le Copilote IA pour Community Managers & Créateurs</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          </div>

          {/* Hero Headline */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            color: 'var(--t1)',
            maxWidth: '900px',
            margin: '0 auto 1.25rem',
          }}>
            Générez des posts viraux et des visuels captivants en <span style={{
              background: 'linear-gradient(135deg, var(--accent), #818CF8, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>3 clics grâce à l&apos;IA</span>
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '1.1rem',
            color: 'var(--t2)',
            maxWidth: '720px',
            margin: '0 auto 2.2rem',
            lineHeight: 1.6,
          }}>
            CM Studio apprend le profil de votre marque, votre audience et votre ton unique pour concevoir des campagnes complètes, rédiger du contenu sur-mesure et créer des visuels HD.
          </p>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/login" style={{
              padding: '0.85rem 2rem',
              borderRadius: '12px',
              fontSize: '0.975rem',
              fontWeight: 700,
              color: '#ffffff',
              background: 'linear-gradient(135deg, var(--accent), #4F46E5)',
              boxShadow: '0 8px 24px rgba(22, 119, 255, 0.4)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s',
            }}>
              <Zap size={18} /> Démarrer l&apos;essai gratuit
            </Link>

            <a href="#demo" style={{
              padding: '0.85rem 1.75rem',
              borderRadius: '12px',
              fontSize: '0.975rem',
              fontWeight: 600,
              color: 'var(--t1)',
              background: 'var(--s2)',
              border: '1px solid var(--b1)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <Wand2 size={18} style={{ color: 'var(--accent)' }} /> Voir le démo interactive
            </a>
          </div>

          {/* Reassurance Metrics Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap',
            padding: '1.25rem 2rem',
            background: 'var(--card)',
            border: '1px solid var(--b1)',
            borderRadius: '14px',
            maxWidth: '850px',
            margin: '0 auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          }}>
            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)' }}>+5 000</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>Posts générés</div>
              </div>
            </div>

            <div style={{ width: 1, height: 30, background: 'var(--b1)' }} className="hidden sm:block" />

            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(22, 119, 255, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)' }}>98% de temps</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>Économisé / semaine</div>
              </div>
            </div>

            <div style={{ width: 1, height: 30, background: 'var(--b1)' }} className="hidden sm:block" />

            <div style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={18} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--t1)' }}>4.9 / 5</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--t3)' }}>Satisfaction CMs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. LIVE INTERACTIVE DEMO SHOWCASE ── */}
      <section id="demo" style={{ padding: '3.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Démo Interactive</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--t1)', marginTop: '0.4rem' }}>
            Aperçu de ce que l&apos;IA génère pour vous
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--t2)' }}>
            Chaque post est personnalisé selon vos contraintes de plateforme, votre audience et votre charte visuelle.
          </p>
        </div>

        {/* Demo Box */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--b1)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        }}>
          {/* Tabs header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'var(--s2)',
            borderBottom: '1px solid var(--b1)',
            overflowX: 'auto',
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--t3)', marginRight: '0.5rem' }}>Plateforme :</span>
            {[
              { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
              { id: 'instagram', label: 'Instagram', icon: 'instagram' },
              { id: 'facebook', label: 'Facebook', icon: 'facebook' },
              { id: 'tiktok', label: 'TikTok', icon: 'tiktok' },
            ].map(tab => {
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    border: active ? '1px solid var(--accent)' : '1px solid transparent',
                    background: active ? 'var(--accent-light)' : 'transparent',
                    color: active ? 'var(--accent)' : 'var(--t2)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <PlatformIcon platform={tab.id as any} size={16} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Demo Content View */}
          <div style={{ padding: '1.75rem', display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="md:grid-cols-12">
            
            {/* Left: Metadata & Context */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="md:col-span-4">
              <div style={{ background: 'var(--s2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--b1)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Profil de Marque</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t1)' }}>Pixel Agency</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--t2)', marginTop: '0.2rem' }}>SaaS & Agence de Design Digital</div>
              </div>

              <div style={{ background: 'var(--s2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--b1)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Paramètres Appliqués</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.3rem' }}>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(22, 119, 255, 0.1)', color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}>Ton Professionnel</span>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', fontSize: '0.75rem', fontWeight: 600 }}>Pilier Conseils</span>
                  <span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', fontSize: '0.75rem', fontWeight: 600 }}>Objectif Conversion</span>
                </div>
              </div>

              <div style={{ background: 'var(--s2)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--b1)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>Image Générée par l&apos;IA</div>
                <div style={{ width: '100%', height: '140px', borderRadius: '8px', background: 'linear-gradient(135deg, #1E1B4B, #312E81)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', flexDirection: 'column', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <ImageIcon size={32} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)' }}>Visuel HD 1080x1080</span>
                </div>
              </div>
            </div>

            {/* Right: Actual Generated Post Preview */}
            <div style={{ background: 'var(--s2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--b1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }} className="md:col-span-8">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #6366F1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                    PA
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--t1)' }}>Pixel Agency</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>Généré par CM Studio • Il y a 2 min</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.9rem', color: 'var(--t1)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {activeTab === 'linkedin' && `🚀 80% des marques échouent sur les réseaux sociaux pour une seule raison : le manque de constance.

Voici la stratégie simple en 3 étapes qu'on applique chez Pixel Agency :

1️⃣ Définir 3 piliers de contenu maximum
2️⃣ Automatiser la rédaction avec les bons briefs
3️⃣ Analyser les hooks qui convertissent le mieux

💬 Et vous, quelle est votre plus grande difficulté en gestion de contenu ?

#SocialMediaMarketing #CommunityManagement #GrowthHacking #DigitalStrategy`}

                  {activeTab === 'instagram' && `✨ Transformez votre grille Instagram en machine à conversion ! 📱💥

Le secret ne réside pas dans le nombre de posts, mais dans la clarté de votre message.

💡 3 astuces rapides :
• Un hook visuel fort dans les 2 premières secondes
• Une légende structurée qui apporte de la vraie valeur
• Un CTA clair en fin de post

👇 Enregistrez ce post pour votre prochaine session de création !

#InstagramMarketing #ContentStrategy #DesignStudio #CommunityManager #SocialMediaTips`}

                  {activeTab === 'facebook' && `📢 Vous cherchez à booster l'engagement de votre page Facebook sans dépenser une fortune en publicité ?

Découvrez nos conseils pratiques pour capter l'attention de votre communauté locale et transformer vos abonnés en clients fidèles !

👉 Cliquez sur le lien en bio pour lire le guide complet.`}

                  {activeTab === 'tiktok' && `🔥 Hook : "Arrête de publier sur TikTok sans faire CETTE erreur !" 🛑

Script vidéo (15 sec) :
[00:00-00:03] Montre l'écran de création avec l'accroche.
[00:04-00:10] Explique les 2 règles d'or d'un hook viral.
[00:11-00:15] Abonne-toi pour plus d'astuces CM ! 🚀

#TikTokTips #ViralContent #ContentCreator #Growth`}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--b1)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={14} style={{ color: 'var(--green)' }} /> Format optimisé pour {activeTab.toUpperCase()}
                </div>

                <button style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}>
                  Copier le texte
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. PIPELINE IA EN 4 ÉTAPES ── */}
      <section id="pipeline" style={{ padding: '4rem 1.5rem', background: 'var(--card)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workflow Intelligent</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--t1)', marginTop: '0.4rem' }}>
              Le Pipeline de Génération CM Studio
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--t2)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
              Passez de l&apos;idée brute à une campagne prête à publier en quelques secondes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            
            {/* Step 1 */}
            <div style={{ background: 'var(--s2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--b1)', position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(22, 119, 255, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                1
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Détection d&apos;Idées Virales</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                L&apos;IA analyse votre secteur et vous génère 5 angles de contenu uniques qui captent l&apos;attention dès l&apos;accroche.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'var(--s2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--b1)', position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                2
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Brief Stratégique Instantané</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                Un résumé clair définit la structure du post, le message clé et le Call-To-Action (CTA) pour maximiser la conversion.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'var(--s2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--b1)', position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                3
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Rédaction Multi-Plateformes</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                Générez simultanément les versions sur-mesure pour Instagram, LinkedIn, Facebook, TikTok et Twitter.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ background: 'var(--s2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--b1)', position: 'relative' }}>
              <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1rem' }}>
                4
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Création Visuelle IA</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--t2)', lineHeight: 1.5 }}>
                Concevez des illustrations et images professionnelles alignées avec votre identité visuelle en un clic.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. BENTO GRID / FEATURES ── */}
      <section id="features" style={{ padding: '5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Fonctionnalités</span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--t1)', marginTop: '0.4rem' }}>
            Tout ce dont un Community Manager a besoin
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--t2)' }}>
            Conçu pour la vitesse, la précision et la qualité professionnelle.
          </p>
        </div>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          
          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'var(--accent-light)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Bot size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Profil de Marque Intelligent</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              L&apos;IA enregistre votre histoire, votre proposition de valeur, votre public cible et votre ton unique. Fini les prompts génériques à répéter chaque jour !
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ImageIcon size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Génération d&apos;Images IA Intégrée</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              Créez des visuels haute définition directement depuis le studio sans devoir basculer vers d&apos;autres outils de design payants.
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Espace Communauté & Feed</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              Partagez vos meilleurs posts, inspirez-vous des créations des autres CMs et échangez avec une communauté passionnée.
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Globe size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Recherche Web en Temps Réel</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              Intégration du grounding Google Search pour des posts factuels et à jour sur l&apos;actualité de votre secteur.
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(236, 72, 153, 0.1)', color: '#EC4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <LayoutGrid size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Mode Unifié ou Personnalisé</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              Choisissez de générer un message unique harmonisé ou de créer des variantes fortement adaptées à chaque réseau social.
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '10px', background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Conformité & Données Sécurisées</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6 }}>
              Vos briefs et profils de marques restent strictement privés sur votre espace de travail sécurisé Supabase.
            </p>
          </div>

        </div>
      </section>

      {/* ── 6. PRICING SECTION ── */}
      <section id="pricing" style={{ padding: '4rem 1.5rem', background: 'var(--card)', borderTop: '1px solid var(--b1)', borderBottom: '1px solid var(--b1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tarifs Shémas</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--t1)', marginTop: '0.4rem' }}>
              Des plans adaptés à chaque étape de votre croissance
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--t2)' }}>
              Commencez gratuitement, puis passez au niveau supérieur selon vos besoins.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            
            {/* Plan Free */}
            <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.25rem' }}>Plan Free</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--t3)', marginBottom: '1.25rem' }}>Pour découvrir le potentiel de l&apos;IA</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--t1)', marginBottom: '1.5rem' }}>
                  0 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--t3)' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--t2)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> 10 générations par semaine</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Instagram & Facebook</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Modèle Gemini 2.0 Flash</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Profil de marque basique</li>
                </ul>
              </div>

              <Link href="/login" style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid var(--b1)',
                background: 'var(--card)',
                color: 'var(--t1)',
                fontWeight: 700,
                fontSize: '0.875rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}>
                Commencer gratuitement
              </Link>
            </div>

            {/* Plan Premium (Featured) */}
            <div style={{
              background: 'linear-gradient(180deg, rgba(22, 119, 255, 0.08) 0%, var(--s2) 100%)',
              border: '2px solid var(--accent)',
              borderRadius: '14px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 12px 30px rgba(22, 119, 255, 0.2)',
            }}>
              <div style={{ position: 'absolute', top: -12, right: 20, background: 'var(--accent)', color: '#fff', fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Recommandé
              </div>

              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.25rem' }}>Plan Premium</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--t3)', marginBottom: '1.25rem' }}>Pour les CMs et créateurs indépendants</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--t1)', marginBottom: '1.5rem' }}>
                  9 900 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--t3)' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--t1)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--accent)' }} /> <strong>Générations Illimitées</strong></li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--accent)' }} /> Toutes les 7 plateformes sociales</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--accent)' }} /> Modèles Claude 3.5 & Gemini Search</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--accent)' }} /> Génération d&apos;Images IA HD</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--accent)' }} /> Réécriture & suggestions d&apos;hashtags</li>
                </ul>
              </div>

              <Link href="/login" style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent), #4F46E5)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.875rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
                boxShadow: '0 4px 14px rgba(22, 119, 255, 0.3)',
              }}>
                Passer au Premium
              </Link>
            </div>

            {/* Plan Business */}
            <div style={{ background: 'var(--s2)', border: '1px solid var(--b1)', borderRadius: '14px', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.25rem' }}>Plan Agence / Business</div>
                <div style={{ fontSize: '0.825rem', color: 'var(--t3)', marginBottom: '1.25rem' }}>Pour les agences gérant plusieurs clients</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--t1)', marginBottom: '1.5rem' }}>
                  24 900 FCFA <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--t3)' }}>/ mois</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--t2)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Tout le plan Premium inclus</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Multi-marques illimitées</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Collaboration d&apos;équipe</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={16} style={{ color: 'var(--green)' }} /> Support prioritaire VIP</li>
                </ul>
              </div>

              <Link href="/login" style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                border: '1px solid var(--b1)',
                background: 'var(--card)',
                color: 'var(--t1)',
                fontWeight: 700,
                fontSize: '0.875rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'block',
              }}>
                Contacter l&apos;équipe commerciale
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── 7. FAQ ACCORDION ── */}
      <section id="faq" style={{ padding: '5rem 1.5rem', maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>FAQ</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--t1)', marginTop: '0.4rem' }}>
            Questions Fréquentes
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { q: "Puis-je essayer CM Studio gratuitement ?", a: "Oui ! Le plan Free vous donne droit à 10 générations hebdomadaires sur Instagram et Facebook sans aucune carte de crédit requise." },
            { q: "Est-ce que l'IA respecte le style et la voix de ma marque ?", a: "Absolument. Grâce à l'onboarding et au profil de marque enregistré, l'IA adapte ses mots, son vocabulaire et son ton spécifiquement à votre entreprise." },
            { q: "Comment fonctionne la génération d'images IA ?", a: "CM Studio embarque les modèles génératifs de pointe (Imagen 3 / Gemini Image). Vous saisissez ou laissez l'IA créer le prompt visuel pour obtenir une illustration HD adaptée." },
            { q: "Faut-il connecter mes comptes de réseaux sociaux dès le départ ?", a: "Non, aucune connexion n'est obligatoire au démarrage. Vous pouvez copier-coller le contenu ou utiliser nos fonctionnalités de planification." }
          ].map((item, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} style={{
                background: 'var(--card)',
                border: '1px solid var(--b1)',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}>
                <button
                  onClick={() => toggleFaq(idx)}
                  style={{
                    width: '100%',
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    color: 'var(--t1)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--t3)' }} />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 1.25rem 1.1rem', fontSize: '0.875rem', color: 'var(--t2)', lineHeight: 1.6, borderTop: '1px solid var(--b1)', paddingTop: '0.85rem' }}>
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── 8. BOTTOM CTA BANNER ── */}
      <section style={{ padding: '4rem 1.5rem', background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)', borderTop: '1px solid var(--b1)', color: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Prêt à révolutionner votre présence sur les réseaux sociaux ?
          </h2>
          <p style={{ fontSize: '1rem', color: '#94A3B8', marginBottom: '2rem' }}>
            Rejoignez des milliers de Community Managers qui créent du contenu 10x plus vite.
          </p>
          <Link href="/login" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.9rem 2.2rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--accent), #4F46E5)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1rem',
            textDecoration: 'none',
            boxShadow: '0 8px 25px rgba(22, 119, 255, 0.4)',
          }}>
            Créer mon compte gratuit <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── 9. FOOTER ── */}
      <footer style={{ padding: '2.5rem 1.5rem', background: 'var(--bg)', borderTop: '1px solid var(--b1)', fontSize: '0.825rem', color: 'var(--t3)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={14} />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--t1)' }}>CM Studio AI</span>
            <span>• © {new Date().getFullYear()} Tous droits réservés.</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/login" style={{ color: 'var(--t2)', textDecoration: 'none' }}>Connexion</Link>
            <Link href="/onboarding" style={{ color: 'var(--t2)', textDecoration: 'none' }}>Onboarding</Link>
            <a href="#privacy" style={{ color: 'var(--t2)', textDecoration: 'none' }}>Confidentialité</a>
            <a href="#terms" style={{ color: 'var(--t2)', textDecoration: 'none' }}>CGU</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
