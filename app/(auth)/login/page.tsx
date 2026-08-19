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
  CheckCircle2 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
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
    document.documentElement.setAttribute('data-theme', 'light')
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
          overflow: hidden !important;
          height: 100vh !important;
          margin: 0;
          padding: 0;
          background: #FFFFFF;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        .login-page-wrap {
          --bg-left: linear-gradient(155deg, #EEF4FC 0%, #E2EDF9 45%, #EAF1FA 100%);
          --card: #FFFFFF;
          --border: #E2E8F0;
          --accent: #1677FF;
          --accent-hover: #1266DF;
          --accent-light: rgba(22, 119, 255, 0.08);
          --text: #0F172A;
          --text2: #475569;
          --text3: #94A3B8;
          --input-bg: #FFFFFF;
          --input-border: #CBD5E1;
          
          height: 100vh;
          max-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: stretch;
          overflow: hidden;
          background: #FFFFFF;
        }

        /* ── Left Column ── */
        .login-left {
          flex: 1.45;
          background: var(--bg-left);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 30px 40px;
          overflow: hidden;
          z-index: 1;
          border-right: 1px solid var(--border);
        }

        /* Decorative Grid Overlay */
        .left-grid-pattern {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(22, 119, 255, 0.09) 1.2px, transparent 1.2px);
          background-size: 26px 26px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.9;
        }

        /* Ambient Lighting matching the 3D Image */
        .ambient-glow-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 850px;
          height: 650px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(22, 119, 255, 0.18) 0%, rgba(56, 189, 248, 0.12) 45%, transparent 75%);
          filter: blur(85px);
          pointer-events: none;
          z-index: 0;
        }
        .ambient-glow-top {
          position: absolute;
          top: -60px;
          right: -30px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.14) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
          z-index: 0;
        }
        .ambient-glow-bottom {
          position: absolute;
          bottom: -80px;
          left: -40px;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.16) 0%, transparent 70%);
          filter: blur(75px);
          pointer-events: none;
          z-index: 0;
        }

        /* Left Header & Logo */
        .left-logo-row {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .logo-icon-wrap {
          width: 25px;
          height: 25px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: transparent;
          border: none;
          padding: 0;
          box-shadow: none;
        }
        .logo-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .brand-name {
          font-family: 'Outfit', sans-serif;
          font-size: 20px;
          color: #0F172A;
          letter-spacing: -0.02em;
          display: inline-flex;
          align-items: baseline;
        }
        .brand-bold {
          font-weight: 900;
          color: #0F172A;
        }
        .brand-regular {
          font-weight: 500;
          color: #475569;
        }
        .header-pro-pill {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          color: #1677FF;
          background: rgba(22, 119, 255, 0.08);
          border: 1px solid rgba(22, 119, 255, 0.18);
          padding: 5px 12px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          backdrop-filter: blur(6px);
        }

        /* Modern Premium Top Header */
        .login-tagline {
          position: relative;
          z-index: 2;
          margin: 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .login-tagline h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 30px;
          font-weight: 900;
          color: #0F172A;
          line-height: 1.15;
          margin: 0 0 6px 0;
          letter-spacing: -0.035em;
          text-align: center;
        }
        .login-tagline h1 .title-gradient-accent {
          background: linear-gradient(135deg, #1677FF 0%, #0066FF 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .login-tagline p {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          color: #475569;
          line-height: 1.45;
          margin: 0;
          font-weight: 500;
          max-width: 520px;
          text-align: center;
        }

        /* ── Expansive 3D Illustration Stage ── */
        .illustration-container {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 0;
          padding: 0;
        }
        .showcase-glass-card {
          position: relative;
          width: 100%;
          max-width: 720px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.85) 0%, rgba(240, 246, 255, 0.55) 100%);
          border: 1px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 20px 45px -12px rgba(22, 119, 255, 0.12), 0 1px 3px rgba(15, 23, 42, 0.04);
          border-radius: 20px;
          padding: 10px 14px;
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .illustration-img-3d {
          width: 100%;
          height: auto;
          max-height: 360px;
          object-fit: contain;
          display: block;
          filter: drop-shadow(0 15px 35px rgba(22, 119, 255, 0.10));
          transition: transform 0.35s ease;
        }
        .showcase-glass-card:hover .illustration-img-3d {
          transform: scale(1.02);
        }

        /* ── Dribbble Animated Bottom Headline (Single Centered Line) ── */
        .login-bottom-banner {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 0;
          padding: 0;
          width: 100%;
        }
        .dribbble-title-wrap {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          width: 100%;
          text-align: center;
        }
        .dribbble-verb-box {
          height: 36px;
          overflow: hidden;
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
        }
        .dribbble-verb-text {
          display: inline-block;
          font-family: 'Outfit', sans-serif;
          font-size: 27px;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 36px;
          background: linear-gradient(135deg, #1677FF 0%, #0066FF 45%, #E11D48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
          animation: dribbbleFluidUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .dribbble-static-text {
          font-family: 'Outfit', sans-serif;
          font-size: 27px;
          font-weight: 800;
          color: #0F172A;
          letter-spacing: -0.03em;
          line-height: 36px;
          margin: 0;
          white-space: nowrap;
        }

        @keyframes dribbbleFluidUp {
          0% {
            transform: translateY(100%);
            opacity: 0;
            filter: blur(4px);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            filter: blur(0px);
          }
        }
        .social-pills-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
        }
        .social-pill-item {
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(226, 232, 240, 0.85);
          padding: 2.5px 10px;
          border-radius: 9999px;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
          backdrop-filter: blur(6px);
        }
        .social-pill-dot {
          color: #94A3B8;
          font-size: 8px;
        }

        /* ── Right Column (Form) ── */
        .login-right {
          width: 480px;
          flex-shrink: 0;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 32px 44px;
          position: relative;
          z-index: 2;
          height: 100vh;
          overflow-y: auto;
        }

        .right-top-logo-row {
          position: absolute;
          top: 24px;
          left: 28px;
          display: flex;
          align-items: center;
          z-index: 10;
        }

        .login-form-container {
          margin: auto 0;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-form-header h2 {
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .login-form-header p.subtitle {
          font-size: 13.5px;
          color: var(--text2);
          margin: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          margin-bottom: 12px;
        }
        .form-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .input-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-left-icon {
          position: absolute;
          left: 14px;
          color: var(--text3);
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .form-input {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          padding: 12px 14px 12px 42px;
          color: var(--text);
          font-family: inherit;
          font-size: 13.5px;
          outline: none;
          transition: all 0.15s ease;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .form-input::placeholder {
          color: var(--text3);
        }

        .password-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .forgot-link {
          font-size: 12px;
          color: var(--accent);
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
        }
        .forgot-link:hover {
          text-decoration: underline;
        }

        .password-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-wrap .form-input {
          padding-right: 42px;
        }
        .eye-btn {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: var(--text3);
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .eye-btn:hover {
          color: var(--accent);
        }

        .btn-primary {
          width: 100%;
          background: var(--accent);
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 13px 16px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
          margin-top: 4px;
          box-shadow: 0 4px 12px rgba(22, 119, 255, 0.22);
        }
        .btn-primary:hover {
          background: var(--accent-hover);
          box-shadow: 0 6px 16px rgba(22, 119, 255, 0.32);
        }
        .btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 14px 0;
          color: var(--text3);
          font-size: 11.5px;
          font-weight: 500;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .btn-social {
          width: 100%;
          background: #FFFFFF;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 16px;
          color: var(--text);
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.15s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }
        .btn-social:hover {
          border-color: #CBD5E1;
          background: #F8FAFC;
        }

        .login-switch {
          text-align: center;
          margin-top: 16px;
          font-size: 13px;
          color: var(--text2);
        }
        .login-switch a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
          margin-left: 4px;
        }
        .login-switch a:hover {
          text-decoration: underline;
        }

        .error-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 12px;
        }
        .forgot-msg {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #16A34A;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-logo-mobile {
          display: none;
          margin-bottom: 18px;
          align-items: center;
          gap: 10px;
        }

        .auth-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: var(--text3);
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
        }
        .auth-footer-links {
          display: flex;
          gap: 14px;
        }
        .auth-footer-links a {
          color: var(--text3);
          text-decoration: none;
        }
        .auth-footer-links a:hover {
          color: var(--text2);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-left { padding: 24px; }
          .login-right { width: 400px; padding: 24px; }
          .login-tagline h1 { font-size: 24px; }
          .login-features { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        }
        @media (max-width: 768px) {
          .login-page-wrap { flex-direction: column; }
          .login-left { display: none; }
          .login-right { 
            width: 100%; 
            min-height: 100vh; 
            padding: 30px 20px; 
          }
          .form-logo-mobile { display: flex; }
        }
        @media (max-height: 720px) {
          .login-left { padding: 18px 28px; }
          .illustration-img-3d { max-height: 320px; }
          .login-tagline h1 { font-size: 21px; }
          .login-tagline p { font-size: 11.5px; }
          .feature-icon { width: 30px; height: 30px; margin-bottom: 2px; }
          .feature-item h4 { font-size: 10.5px; }
          .feature-item p { font-size: 8.5px; }
        }
      ` }} />

      <div className="login-page-wrap">
        {/* ── Left Column ── */}
        <div className="login-left">
          {/* Decorative Grid Mesh & Ambient Glows */}
          <div className="left-grid-pattern" />
          <div className="ambient-glow-center" />
          <div className="ambient-glow-top" />
          <div className="ambient-glow-bottom" />

          {/* Premium Top Headline */}
          <div className="login-tagline">
            <h1>Bienvenue sur <span className="title-gradient-accent">CM Studio</span></h1>
            <p>Votre assistant intelligent pour concevoir, planifier et propulser vos réseaux sociaux.</p>
          </div>

          {/* 3D Modern SaaS Illustration - Clean Glass Stage Card */}
          <div className="illustration-container">
            <div className="showcase-glass-card">
              <Image
                src="/images/login-illustration.png?v=12"
                alt="CM Studio - Création et Planification IA"
                width={820}
                height={510}
                className="illustration-img-3d"
                unoptimized
                priority
              />
            </div>
          </div>

          {/* Dribbble-style Animated Bottom Headline (Single Centered Line) */}
          <div className="login-bottom-banner">
            <div className="dribbble-title-wrap">
              <div className="dribbble-verb-box">
                <span key={phraseIndex} className="dribbble-verb-text">
                  {ROTATING_VERBS[phraseIndex]}
                </span>
              </div>
              <span className="dribbble-static-text">vos contenus avec l'IA</span>
            </div>
            <div className="social-pills-row">
              <span className="social-pill-item">LinkedIn</span>
              <span className="social-pill-dot">•</span>
              <span className="social-pill-item">Instagram</span>
              <span className="social-pill-dot">•</span>
              <span className="social-pill-item">TikTok</span>
              <span className="social-pill-dot">•</span>
              <span className="social-pill-item">Facebook</span>
              <span className="social-pill-dot">•</span>
              <span className="social-pill-item">X</span>
            </div>
          </div>
        </div>

        {/* ── Right Column (Form) ── */}
        <div className="login-right">
          {/* Brand Logo in Top-Left of Right Column */}
          <div className="right-top-logo-row">
            <Link href="/" className="brand-link">
              <div className="logo-icon-wrap">
                <img
                  src="/logo-blue.png?v=15"
                  alt="CM Studio"
                  className="logo-icon-img"
                />
              </div>
              <span className="brand-name">
                <span className="brand-bold">CM S</span><span className="brand-regular">tudio</span>
              </span>
            </Link>
          </div>

          <div className="login-form-container">
            {mode === 'forgot' ? (
              <>
                <div className="login-form-header">
                  <h2>Mot de passe oublié</h2>
                  <p className="subtitle">On vous envoie un lien de réinitialisation</p>
                </div>

                {error && <div className="error-box">{error}</div>}
                {forgotMsg && (
                  <div className="forgot-msg">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{forgotMsg}</span>
                  </div>
                )}

                <form onSubmit={handleForgotPassword}>
                  <div className="form-group">
                    <label className="form-label">EMAIL</label>
                    <div className="input-icon-wrap">
                      <span className="input-left-icon">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="login-switch">
                  <a onClick={() => { setMode('login'); setError(''); setForgotMsg('') }}>
                    ← Retour à la connexion
                  </a>
                </div>
              </>
            ) : mode === 'login' ? (
              <>
                <div className="login-form-header">
                  <h2>Connexion</h2>
                  <p className="subtitle">Connectez-vous à votre espace CM Studio</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label className="form-label">EMAIL</label>
                    <div className="input-icon-wrap">
                      <span className="input-left-icon">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="password-row">
                      <label className="form-label" style={{ margin: 0 }}>MOT DE PASSE</label>
                      <span
                        className="forgot-link"
                        onClick={() => { setMode('forgot'); setError(''); setForgotMsg('') }}
                      >
                        Mot de passe oublié ?
                      </span>
                    </div>
                    <div className="password-wrap">
                      <div className="input-icon-wrap" style={{ width: '100%' }}>
                        <span className="input-left-icon">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          className="form-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>

                <div className="divider">ou continuer avec</div>

                <button className="btn-social" type="button" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="login-switch">
                  Vous n&apos;avez pas de compte ?{' '}
                  <a onClick={() => { setMode('register'); setError('') }}>
                    Inscription
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="login-form-header">
                  <h2>Inscription</h2>
                  <p className="subtitle">Commencez gratuitement dès maintenant</p>
                </div>

                {error && <div className="error-box">{error}</div>}

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label className="form-label">PRÉNOM OU NOM COMPLET</label>
                    <div className="input-icon-wrap">
                      <span className="input-left-icon">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
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
                    <div className="input-icon-wrap">
                      <span className="input-left-icon">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
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
                    <div className="password-wrap">
                      <div className="input-icon-wrap" style={{ width: '100%' }}>
                        <span className="input-left-icon">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          className="form-input"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          minLength={8}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Inscription...' : "S'inscrire"}
                  </button>
                </form>

                <div className="divider">ou continuer avec</div>

                <button className="btn-social" type="button" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="login-switch">
                  Déjà un compte ?{' '}
                  <a onClick={() => { setMode('login'); setError('') }}>
                    Se connecter
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
