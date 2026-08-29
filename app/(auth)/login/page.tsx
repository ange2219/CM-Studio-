'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
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

        /* ── L'arrière-plan plein écran est l'illustration ── */
        .login-wallpaper-screen {
          min-height: 100vh;
          width: 100vw;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          background-image: url('/images/login-background.jpg');
          background-size: cover;
          background-position: center left;
          background-repeat: no-repeat;
          background-color: #0B1120;
          box-sizing: border-box;
          padding: 30px 10%;
        }

        /* Conteneur de positionnement pour la carte */
        .login-card-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 10;
        }

        /* ── La Carte Blanche Flottante ── */
        .floating-auth-card {
          width: 100%;
          background: #FFFFFF;
          border-radius: 16px;
          padding: 36px 32px 28px;
          box-shadow: 0 25px 60px -10px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.2);
          box-sizing: border-box;
          animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes cardFadeIn {
          0% { transform: translateY(18px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .auth-card-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .auth-card-logo {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          text-decoration: none;
        }
        .auth-card-logo img {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
        .auth-card-logo span.logo-title {
          font-family: 'Outfit', sans-serif;
          font-size: 21px;
          color: #0F172A;
          letter-spacing: -0.02em;
        }
        .auth-card-logo span.logo-bold {
          font-weight: 900;
        }
        .auth-card-logo span.logo-regular {
          font-weight: 500;
          color: #475569;
        }

        .auth-card-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 26px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px 0;
          letter-spacing: -0.02em;
        }
        .auth-card-header p {
          font-size: 13.5px;
          color: #64748B;
          margin: 0;
        }

        /* Groupes de formulaire */
        .auth-form-group {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .auth-form-label {
          font-size: 11px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .auth-input-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .auth-input {
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
        .auth-input:focus {
          background: #FFFFFF;
          border-color: #1677FF;
          box-shadow: 0 0 0 3.5px rgba(22, 119, 255, 0.12);
        }
        .auth-input::placeholder {
          color: #94A3B8;
        }

        .auth-eye-btn {
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
        .auth-eye-btn:hover {
          color: #1677FF;
        }

        /* Ligne Se souvenir de moi & Mot de passe oublié */
        .auth-options-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          font-size: 12.5px;
        }
        .auth-remember-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #475569;
          cursor: pointer;
          user-select: none;
          font-weight: 500;
        }
        .auth-remember-label input[type="checkbox"] {
          accent-color: #1677FF;
          width: 15px;
          height: 15px;
          cursor: pointer;
          border-radius: 4px;
        }
        .auth-forgot-link {
          color: #1677FF;
          text-decoration: none;
          font-weight: 600;
          cursor: pointer;
          transition: text-decoration 0.15s;
        }
        .auth-forgot-link:hover {
          text-decoration: underline;
        }

        /* Bouton d'action principal */
        .auth-btn-primary {
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
        .auth-btn-primary:hover {
          background: linear-gradient(135deg, #2582FF 0%, #0047B3 100%);
          box-shadow: 0 8px 22px rgba(22, 119, 255, 0.45);
          transform: translateY(-1px);
        }
        .auth-btn-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
          transform: none;
        }

        /* Séparateur */
        .auth-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 16px 0;
          color: #94A3B8;
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .auth-divider::before, .auth-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #E2E8F0;
        }

        /* Bouton Google */
        .auth-google-btn {
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
        .auth-google-btn:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
        }

        /* Lien de bascule sous la carte */
        .auth-bottom-switch {
          margin-top: 16px;
          text-align: center;
          font-size: 13px;
          color: #64748B;
        }
        .auth-bottom-switch a {
          color: #1677FF;
          font-weight: 700;
          cursor: pointer;
          margin-left: 4px;
          text-decoration: none;
          transition: text-decoration 0.15s;
        }
        .auth-bottom-switch a:hover {
          text-decoration: underline;
        }

        /* Boîtes d'alertes */
        .auth-error-box {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          color: #DC2626;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
        }
        .auth-success-box {
          background: #F0FDF4;
          border: 1px solid #BBF7D0;
          color: #16A34A;
          font-size: 12.5px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-wallpaper-screen {
            justify-content: center;
            padding: 24px;
            background-position: 25% center;
          }
        }

        @media (max-width: 640px) {
          .login-wallpaper-screen {
            padding: 16px;
            background-position: 20% center;
          }
          .floating-auth-card {
            padding: 28px 20px 22px;
          }
        }
      ` }} />

      <div className="login-wallpaper-screen">
        {/* La Carte Blanche Flottante est le SEUL élément affiché */}
        <div className="login-card-container">
          <div className="floating-auth-card">
            
            {/* Header avec Logo CM Studio */}
            <div className="auth-card-header">
              <Link href="/" className="auth-card-logo">
                <img src="/logo-blue.png?v=15" alt="CM Studio" />
                <span className="logo-title">
                  <span className="logo-bold">CM S</span><span className="logo-regular">tudio</span>
                </span>
              </Link>

              {mode === 'forgot' ? (
                <>
                  <h2>Mot de passe oublié</h2>
                  <p>On vous envoie un lien de réinitialisation</p>
                </>
              ) : mode === 'register' ? (
                <>
                  <h2>Inscription</h2>
                  <p>Commencez gratuitement dès maintenant</p>
                </>
              ) : (
                <>
                  <h2>Connexion</h2>
                  <p>Connectez-vous à votre espace CM Studio</p>
                </>
              )}
            </div>

            {error && <div className="auth-error-box">{error}</div>}
            {forgotMsg && (
              <div className="auth-success-box">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{forgotMsg}</span>
              </div>
            )}

            {/* ── Mode Mot de passe oublié ── */}
            {mode === 'forgot' && (
              <>
                <form onSubmit={handleForgotPassword}>
                  <div className="auth-form-group">
                    <label className="auth-form-label">EMAIL</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        className="auth-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-bottom-switch">
                  <a onClick={() => { setMode('login'); setError(''); setForgotMsg('') }}>
                    ← Retour à la connexion
                  </a>
                </div>
              </>
            )}

            {/* ── Mode Connexion ── */}
            {mode === 'login' && (
              <>
                <form onSubmit={handleLogin}>
                  <div className="auth-form-group">
                    <label className="auth-form-label">EMAIL</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        className="auth-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">MOT DE PASSE</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        className="auth-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ paddingRight: '42px' }}
                      />
                      <button
                        type="button"
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="auth-options-row">
                    <label className="auth-remember-label">
                      <input 
                        type="checkbox" 
                        checked={rememberMe} 
                        onChange={e => setRememberMe(e.target.checked)} 
                      />
                      <span>Se souvenir de moi</span>
                    </label>
                    <span
                      className="auth-forgot-link"
                      onClick={() => { setMode('forgot'); setError(''); setForgotMsg('') }}
                    >
                      Mot de passe oublié ?
                    </span>
                  </div>

                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Connexion...' : 'Se connecter'}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-divider">ou</div>

                <button className="auth-google-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="auth-bottom-switch">
                  Vous n&apos;avez pas de compte ?
                  <a onClick={() => { setMode('register'); setError('') }}>
                    Inscription
                  </a>
                </div>
              </>
            )}

            {/* ── Mode Inscription ── */}
            {mode === 'register' && (
              <>
                <form onSubmit={handleRegister}>
                  <div className="auth-form-group">
                    <label className="auth-form-label">NOM OU PSEUDO</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <User size={16} />
                      </span>
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="Ex : Alex Martin"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">EMAIL</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Mail size={16} />
                      </span>
                      <input
                        className="auth-input"
                        type="email"
                        placeholder="votre@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label className="auth-form-label">MOT DE PASSE</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon">
                        <Lock size={16} />
                      </span>
                      <input
                        className="auth-input"
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
                        className="auth-eye-btn"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Masquer' : 'Afficher'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button className="auth-btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Inscription...' : "S'inscrire"}
                    <ArrowRight size={16} />
                  </button>
                </form>

                <div className="auth-divider">ou</div>

                <button className="auth-google-btn" type="button" onClick={handleGoogleLogin} disabled={loading}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continuer avec Google
                </button>

                <div className="auth-bottom-switch">
                  Déjà un compte ?
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
