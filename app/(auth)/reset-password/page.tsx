'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Eye, 
  EyeOff, 
  Share2, 
  BarChart3,
  ShieldCheck
} from 'lucide-react'
import { FeatherLogo } from '@/components/FeatherLogo'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }
    if (password.length < 8) {
      setError('Minimum 8 caractères requis')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          margin: 0;
          padding: 0;
          background: #070A12;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
        }

        .auth-container {
          display: flex;
          height: 100vh;
          max-height: 100vh;
          width: 100vw;
          overflow: hidden;
          background: #070A12;
        }

        /* ── Left Showcase Panel ── */
        .auth-left {
          flex: 1.25;
          position: relative;
          background: radial-gradient(circle at 20% 20%, #0F172A 0%, #070A12 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 44px;
          overflow: hidden;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 1;
        }

        .glow-orb-1 {
          position: absolute;
          top: -10%;
          left: 15%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(22, 119, 255, 0.25) 0%, rgba(56, 189, 248, 0.08) 50%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .glow-orb-2 {
          position: absolute;
          bottom: 5%;
          right: -10%;
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.20) 0%, rgba(22, 119, 255, 0.05) 50%, transparent 70%);
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }

        .left-header {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .brand-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(22, 119, 255, 0.18);
          color: #38BDF8;
          border: 1px solid rgba(56, 189, 248, 0.3);
          letter-spacing: 0.04em;
        }

        .left-body {
          position: relative;
          z-index: 2;
          margin: auto 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 540px;
        }

        .hero-title {
          font-size: 30px;
          font-weight: 800;
          line-height: 1.25;
          letter-spacing: -0.025em;
          color: #FFFFFF;
          margin: 0;
        }
        .hero-gradient-text {
          background: linear-gradient(135deg, #38BDF8 0%, #1677FF 50%, #8B5CF6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: 13.5px;
          color: #94A3B8;
          line-height: 1.45;
          margin: 0;
        }

        .glass-showcase {
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          padding: 18px;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: #38BDF8;
          background: rgba(56, 189, 248, 0.1);
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid rgba(56, 189, 248, 0.25);
          width: fit-content;
        }

        .security-checklist {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 12px;
          color: #CBD5E1;
        }
        .check-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .features-grid {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .feat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 8px 10px;
          border-radius: 8px;
        }
        .feat-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: rgba(22, 119, 255, 0.15);
          color: #38BDF8;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .feat-title {
          font-size: 11px;
          font-weight: 600;
          color: #E2E8F0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Right Form Panel ── */
        .auth-right {
          width: 480px;
          flex-shrink: 0;
          background: #FFFFFF;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 36px 44px;
          height: 100vh;
          overflow-y: auto;
          box-shadow: -10px 0 30px rgba(0, 0, 0, 0.15);
          z-index: 2;
        }

        .mobile-brand {
          display: none;
        }

        .auth-form-wrap {
          margin: auto 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .form-header p {
          font-size: 13.5px;
          color: #64748B;
          margin: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-label {
          font-size: 11.5px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          color: #94A3B8;
          pointer-events: none;
          display: flex;
          align-items: center;
        }
        .form-input {
          width: 100%;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 11px 14px 11px 38px;
          font-size: 13.5px;
          color: #0F172A;
          outline: none;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .form-input:focus {
          background: #FFFFFF;
          border-color: #1677FF;
          box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12);
        }
        .form-input::placeholder {
          color: #94A3B8;
        }

        .input-with-eye .form-input {
          padding-right: 40px;
        }
        .eye-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94A3B8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.15s ease;
        }
        .eye-toggle-btn:hover {
          color: #1677FF;
        }

        .btn-submit {
          width: 100%;
          background: #1677FF;
          color: #FFFFFF;
          border: none;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
          box-shadow: 0 4px 12px rgba(22, 119, 255, 0.25);
          font-family: inherit;
        }
        .btn-submit:hover {
          background: #1266DF;
          box-shadow: 0 6px 16px rgba(22, 119, 255, 0.35);
        }
        .btn-submit:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        .error-alert {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .success-box {
          text-align: center;
          padding: 30px 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .success-icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-switch {
          text-align: center;
          font-size: 13px;
          color: #64748B;
          margin-top: 4px;
        }
        .auth-switch a {
          color: #1677FF;
          font-weight: 700;
          cursor: pointer;
          margin-left: 4px;
        }
        .auth-switch a:hover {
          text-decoration: underline;
        }

        .auth-footer-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #94A3B8;
          border-top: 1px solid #F1F5F9;
          padding-top: 16px;
        }
        .auth-footer-bar a {
          color: #94A3B8;
          text-decoration: none;
          margin-left: 12px;
        }
        .auth-footer-bar a:hover {
          color: #64748B;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .auth-left { padding: 30px; }
          .auth-right { width: 420px; padding: 30px; }
          .hero-title { font-size: 26px; }
          .features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .auth-container { flex-direction: column; }
          .auth-left { display: none; }
          .auth-right { 
            width: 100%; 
            min-height: 100vh; 
            padding: 30px 20px;
          }
          .mobile-brand { display: flex; }
        }
      ` }} />

      <div className="auth-container">
        {/* ── Left Showcase Panel ── */}
        <div className="auth-left">
          <div className="glow-orb-1" />
          <div className="glow-orb-2" />

          {/* Left Top Brand */}
          <div className="left-header">
            <Link href="/" className="flex items-center gap-2.5 group">
              <FeatherLogo darkMode={true} />
              <span className="font-extrabold text-[20px] tracking-tight text-white flex items-center gap-2 font-['Inter']">
                CM Studio <span className="brand-badge">AI</span>
              </span>
            </Link>
          </div>

          {/* Left Body */}
          <div className="left-body">
            <div>
              <h1 className="hero-title">
                Sécurisez votre <br />
                <span className="hero-gradient-text">espace de travail</span>
              </h1>
              <p className="hero-subtitle" style={{ marginTop: '8px' }}>
                Réinitialisez votre mot de passe pour retrouver l'accès à tous vos outils d'automatisation et de publication.
              </p>
            </div>

            {/* Glassmorphic Security Card */}
            <div className="glass-showcase">
              <div className="security-badge">
                <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                Sécurité et chiffrement AES-256
              </div>

              <div className="security-checklist">
                <div className="check-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Au moins 8 caractères recommandés</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Mélange de lettres et de chiffres</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Protection contre les accès non autorisés</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Bottom Features */}
          <div className="features-grid">
            <div className="feat-item">
              <div className="feat-icon-wrap">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="feat-title">Génération IA</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon-wrap">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <span className="feat-title">Planification</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon-wrap">
                <Share2 className="w-3.5 h-3.5" />
              </div>
              <span className="feat-title">Multi-Canal</span>
            </div>
            <div className="feat-item">
              <div className="feat-icon-wrap">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="feat-title">Analytics</span>
            </div>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="auth-right">
          {/* Mobile Brand */}
          <div className="mobile-brand mb-4">
            <Link href="/" className="flex items-center gap-2.5">
              <FeatherLogo />
              <span className="font-bold text-lg text-[#0F172A]">CM Studio</span>
            </Link>
          </div>

          {/* Form Container */}
          <div className="auth-form-wrap">
            {done ? (
              <div className="success-box">
                <div className="success-icon-wrap">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-[#0F172A]">Mot de passe mis à jour !</h2>
                <p className="text-sm text-[#64748B]">
                  Votre mot de passe a été modifié avec succès. Redirection vers la page de connexion…
                </p>
              </div>
            ) : (
              <>
                <div className="form-header">
                  <h2>Nouveau mot de passe</h2>
                  <p>Définissez un mot de passe sécurisé pour votre compte.</p>
                </div>

                {error && (
                  <div className="error-alert">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div className="form-group">
                    <label className="form-label">Nouveau mot de passe</label>
                    <div className="input-wrapper input-with-eye">
                      <span className="input-icon">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8 caractères minimum"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirmer le mot de passe</label>
                    <div className="input-wrapper input-with-eye">
                      <span className="input-icon">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        className="form-input"
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Répétez le mot de passe"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="eye-toggle-btn"
                        onClick={() => setShowConfirm(v => !v)}
                        tabIndex={-1}
                        aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="btn-submit" type="submit" disabled={loading}>
                    {loading ? 'Mise à jour en cours...' : 'Enregistrer le nouveau mot de passe'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <div className="auth-switch">
                  <Link href="/login">
                    ← Retour à la connexion
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="auth-footer-bar">
            <span>© {new Date().getFullYear()} CM Studio</span>
            <div>
              <Link href="/">Accueil</Link>
              <a href="#">Confidentialité</a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
