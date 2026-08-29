'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const ROTATING_VERBS = [
    "Créez",
    "Générez",
    "Planifiez",
    "Postez",
    "Optimisez",
    "Automatisez",
    "Analysez"
  ]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    const timer = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % ROTATING_VERBS.length)
    }, 2400)
    return () => clearInterval(timer)
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { 
      setError('Email ou mot de passe incorrect')
      setLoading(false) 
    } else {
      router.push('/workspace')
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { 
      setError('Entrez votre adresse email')
      return 
    }
    setLoading(true)
    setError('')
    setForgotMsg('')

    try {
      const res = await fetch('/api/auth/check-provider', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      
      if (data.provider === 'google') {
        setError("Ce compte est associé à Google. Veuillez vous connecter avec le bouton Google.")
        setLoading(false)
        return
      }
    } catch (err) {
      console.error(err)
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setForgotMsg('Un email contenant le lien de réinitialisation vous a été envoyé.')
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, 
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) { 
      setError(error.message)
      setLoading(false) 
    } else {
      router.push('/onboarding')
    }
  }

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,500&display=swap');

        html, body {
          overflow-x: hidden !important;
          min-height: 100vh;
          margin: 0;
          padding: 0;
          background: #0B1120;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        .login-immersive-container {
          min-height: 100vh;
          width: 100vw;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(circle at 20% 25%, #172554 0%, #0F172A 48%, #070D19 100%);
          padding: 24px;
          box-sizing: border-box;
        }

        /* ── Vagues et lueurs ambiantes immersives ── */
        .ambient-glow-1 {
          position: absolute;
          top: -10%;
          left: 15%;
          width: 700px;
          height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(22, 119, 255, 0.28) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 70%);
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-glow-2 {
          position: absolute;
          bottom: -15%;
          right: 5%;
          width: 650px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(30, 58, 138, 0.35) 0%, rgba(14, 165, 233, 0.10) 50%, transparent 70%);
          filter: blur(85px);
          pointer-events: none;
          z-index: 0;
        }

        .ambient-curve-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.18;
          z-index: 0;
        }

        /* ── Grille principale 2 colonnes ── */
        .login-stage-wrapper {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1240px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 48px;
        }

        /* ── Colonne de Gauche (Illustration & Marque) ── */
        .login-visual-stage {
          flex: 1.25;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 20px;
          color: #FFFFFF;
        }

        .brand-top-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 8px 16px;
          border-radius: 9999px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          text-decoration: none;
          transition: transform 0.2s, background 0.2s;
        }
        .brand-top-badge:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.12);
        }
        .brand-top-badge img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
        .brand-top-badge span.brand-text {
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          color: #FFFFFF;
          letter-spacing: -0.01em;
        }
        .brand-top-badge span.brand-bold {
          font-weight: 900;
        }
        .brand-top-badge span.brand-regular {
          font-weight: 500;
          color: #93C5FD;
        }

        .stage-headline h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 38px;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0 0 10px 0;
          color: #FFFFFF;
        }
        .stage-headline h1 span.gradient-text {
          background: linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #93C5FD 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stage-headline p {
          font-size: 15px;
          line-height: 1.5;
          color: #94A3B8;
          margin: 0;
          max-width: 480px;
        }

        /* Cadre de l'Illustration Bureau CM Studio */
        .illustration-card-frame {
          position: relative;
          width: 100%;
          max-width: 580px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(30, 58, 138, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.1);
          backdrop-filter: blur(12px);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .illustration-card-frame:hover {
          transform: translateY(-3px);
          box-shadow: 0 30px 70px -12px rgba(22, 119, 255, 0.3), 0 0 0 1px rgba(56, 189, 248, 0.25);
        }
        .illustration-img-cm {
          width: 100%;
          height: auto;
          display: block;
          object-fit: cover;
        }

        /* Barre d'action animée & Réseaux sociaux */
        .bottom-action-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 4px;
        }
        .rotating-verb-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(22, 119, 255, 0.18);
          border: 1px solid rgba(56, 189, 248, 0.35);
          padding: 6px 14px;
          border-radius: 9999px;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 800;
          color: #38BDF8;
          box-shadow: 0 0 15px rgba(22, 119, 255, 0.25);
        }
        .rotating-verb-text {
          animation: fluidFadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes fluidFadeUp {
          0% { transform: translateY(12px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .rotating-static-text {
          font-size: 14px;
          font-weight: 600;
          color: #CBD5E1;
        }
        .social-pill-group {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-left: 6px;
        }
        .social-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 11px;
          font-weight: 700;
          color: #94A3B8;
        }

        /* ── Colonne de Droite : Carte Blanche Flottante ── */
        .login-card-column {
          width: 440px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .floating-white-card {
          width: 100%;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 36px 36px 32px;
          box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15);
          position: relative;
          box-sizing: border-box;
          animation: floatIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes floatIn {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .card-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .card-header-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          box-shadow: 0 4px 10px rgba(22, 119, 255, 0.12);
        }
        .card-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 27px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .card-header p {
          font-size: 13.5px;
          color: #64748B;
          margin: 0;
        }

        /* Champs de saisie */
        .form-group {
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon-left {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .floating-input {
          width: 100%;
          background: #F8FAFC;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          font-family: inherit;
          font-size: 14px;
          color: #0F172A;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .floating-input:focus {
          background: #FFFFFF;
          border-color: #1677FF;
          box-shadow: 0 0 0 3.5px rgba(22, 119, 255, 0.12);
        }
        .floating-input::placeholder {
          color: #94A3B8;
        }

        .password-toggle-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: #94A3B8;
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .password-toggle-btn:hover {
          color: #1677FF;
        }

        /* Ligne Se souvenir de moi & Mot de passe oublié */
        .remember-forgot-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 12.5px;
        }
        .remember-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }
        .remember-wrap input[type="checkbox"] {
          accent-color: #1677FF;
          width: 15px;
          height: 15px;
          cursor: pointer;
          border-radius: 4px;
        }
        .forgot-link-btn {
          color: #1677FF;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: text-decoration 0.15s;
        }
        .forgot-link-btn:hover {
          text-decoration: underline;
        }

        /* Bouton CTA Principal */
        .cta-btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #1677FF 0%, #0056D2 100%);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 13px 18px;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 6px 18px rgba(22, 119, 255, 0.35);
        }
        .cta-btn-primary:hover {
          background: linear-gradient(135deg, #2582FF 0%, #0047B3 100%);
          box-shadow: 0 8px 22px rgba(22, 119, 255, 0.45);
          transform: translateY(-1px);
        }
        .cta-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* Séparateur */
        .card-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0;
          color: #94A3B8;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .card-divider::before, .card-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }

        /* Bouton Google Social */
        .google-auth-btn {
          width: 100%;
          background: #FFFFFF;
          border: 1.5px solid #E2E8F0;
          border-radius: 12px;
          padding: 11px 16px;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          color: #1E293B;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.15s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }
        .google-auth-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        /* Sous la carte (zone immersive bleue) */
        .under-card-switch {
          margin-top: 18px;
          text-align: center;
          font-size: 13.5px;
          color: #CBD5E1;
        }
        .under-card-switch a {
          color: #38BDF8;
          font-weight: 700;
          cursor: pointer;
          margin-left: 5px;
          text-decoration: none;
          transition: color 0.15s, text-decoration 0.15s;
        }
        .under-card-switch a:hover {
          color: #60A5FA;
          text-decoration: underline;
        }

        /* Alertes et erreurs */
        .alert-error-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
        }
        .alert-success-box {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #16A34A;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-stage-wrapper {
            flex-direction: column;
            align-items: center;
            gap: 36px;
          }
          .login-visual-stage {
            align-items: center;
            text-align: center;
          }
          .stage-headline h1 {
            font-size: 30px;
          }
          .illustration-card-frame {
            max-width: 480px;
          }
          .login-card-column {
            width: 100%;
            max-width: 440px;
          }
        }

        @media (max-width: 640px) {
          .login-immersive-container {
            padding: 16px;
          }
          .login-visual-stage {
            display: none;
          }
          .floating-white-card {
            padding: 28px 22px;
          }
          .stage-headline h1 {
            font-size: 26px;
          }
        }
      ` }} />

      <div className="login-immersive-container">
        {/* Lueurs ambiantes et vagues subtiles */}
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <svg className="ambient-curve-svg" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="none">
          <path d="M0,280 C320,400 420,150 740,240 C1060,330 1150,180 1440,220 L1440,900 L0,900 Z" fill="rgba(30, 58, 138, 0.12)" />
          <path d="M0,450 C360,520 540,360 900,420 C1260,480 1340,380 1440,400 L1440,900 L0,900 Z" fill="rgba(15, 23, 42, 0.25)" />
        </svg>

        <div className="login-stage-wrapper">
          {/* ── Colonne de Gauche (Illustration & Ambiance Studio) ── */}
          <div className="login-visual-stage">
            <Link href="/" className="brand-top-badge">
              <img src="/logo-blue.png?v=15" alt="CM Studio" />
              <span className="brand-text">
                <span className="brand-bold">CM S</span><span className="brand-regular">tudio</span>
              </span>
              <span style={{ fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', color: '#38BDF8', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700 }}>
                IA Platform
              </span>
            </Link>

            <div className="stage-headline">
              <h1>
                Pilotez vos réseaux avec <span className="gradient-text">l&apos;IA</span>
              </h1>
              <p>
                Créez, planifiez et analysez vos publications multi-plateformes en un clin d&apos;œil.
              </p>
            </div>

            {/* Illustration moderne du Community Manager à son bureau */}
            <div className="illustration-card-frame">
              <Image
                src="/images/login-cm-desk.jpg"
                alt="Community Manager Dashboard"
                width={720}
                height={540}
                className="illustration-img-cm"
                priority
              />
            </div>

            {/* Action animée + Réseaux sociaux */}
            <div className="bottom-action-banner">
              <div className="rotating-verb-pill">
                <Sparkles size={14} />
                <span key={phraseIndex} className="rotating-verb-text">
                  {ROTATING_VERBS[phraseIndex]}
                </span>
              </div>
              <span className="rotating-static-text">vos contenus chaque semaine</span>
              <div className="social-pill-group">
                <span className="social-pill">LinkedIn</span>
                <span className="social-pill">Instagram</span>
                <span className="social-pill">TikTok</span>
                <span className="social-pill">Facebook</span>
                <span className="social-pill">X</span>
              </div>
            </div>
          </div>

          {/* ── Colonne de Droite (Carte Blanche Flottante) ── */}
          <div className="login-card-column">
            <div className="floating-white-card">
              {mode === 'forgot' ? (
                <>
                  <div className="card-header">
                    <div className="card-header-icon">
                      <Mail size={24} color="#1677FF" />
                    </div>
                    <h2>Mot de passe oublié</h2>
                    <p>On vous envoie un lien de réinitialisation</p>
                  </div>

                  {error && <div className="alert-error-box">{error}</div>}
                  {forgotMsg && (
                    <div className="alert-success-box">
                      <CheckCircle2 size={16} className="shrink-0" />
                      <span>{forgotMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPassword}>
                    <div className="form-group">
                      <label className="form-label">EMAIL</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <Mail size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <button className="cta-btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px' }}>
                    <a 
                      onClick={() => { setMode('login'); setError(''); setForgotMsg('') }}
                      style={{ color: '#1677FF', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Retour à la connexion
                    </a>
                  </div>
                </>
              ) : mode === 'login' ? (
                <>
                  <div className="card-header">
                    <div className="card-header-icon">
                      <Lock size={22} color="#1677FF" />
                    </div>
                    <h2>Connexion</h2>
                    <p>Connectez-vous à votre espace CM Studio</p>
                  </div>

                  {error && <div className="alert-error-box">{error}</div>}

                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label">EMAIL</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <Mail size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">MOT DE PASSE</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <Lock size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          style={{ paddingRight: '42px' }}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Masquer' : 'Afficher'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="remember-forgot-row">
                      <label className="remember-wrap">
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={e => setRememberMe(e.target.checked)} 
                        />
                        <span>Se souvenir de moi</span>
                      </label>
                      <span
                        className="forgot-link-btn"
                        onClick={() => { setMode('forgot'); setError(''); setForgotMsg('') }}
                      >
                        Mot de passe oublié ?
                      </span>
                    </div>

                    <button className="cta-btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Connexion...' : 'Se connecter'}
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div className="card-divider">ou</div>

                  <button className="google-auth-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </button>
                </>
              ) : (
                <>
                  <div className="card-header">
                    <div className="card-header-icon">
                      <User size={22} color="#1677FF" />
                    </div>
                    <h2>Inscription</h2>
                    <p>Commencez gratuitement dès maintenant</p>
                  </div>

                  {error && <div className="alert-error-box">{error}</div>}

                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <label className="form-label">NOM OU PSEUDO</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <User size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type="text"
                          placeholder="Ex : Alex Martin"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">EMAIL</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <Mail size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">MOT DE PASSE</label>
                      <div className="input-wrap">
                        <span className="input-icon-left">
                          <Lock size={16} />
                        </span>
                        <input
                          className="floating-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          minLength={8}
                          required
                          style={{ paddingRight: '42px' }}
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Masquer' : 'Afficher'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button className="cta-btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Inscription...' : "S'inscrire"}
                      <ArrowRight size={16} />
                    </button>
                  </form>

                  <div className="card-divider">ou</div>

                  <button className="google-auth-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </button>
                </>
              )}
            </div>

            {/* Lien sous la carte flottante dans le décor bleu immersif */}
            <div className="under-card-switch">
              {mode === 'register' ? (
                <>
                  Déjà un compte ?{' '}
                  <a onClick={() => { setMode('login'); setError('') }}>
                    Se connecter
                  </a>
                </>
              ) : (
                <>
                  Nouveau sur CM Studio ?{' '}
                  <a onClick={() => { setMode('register'); setError('') }}>
                    Créer un compte
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
