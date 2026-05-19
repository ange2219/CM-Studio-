'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [showPassword, setShowPassword] = useState(false)
  const [forgotMsg, setForgotMsg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect'); setLoading(false) }
    else router.push('/home')
  }

  async function handleForgotPassword() {
    if (!email) { setError('Entrez votre email d\'abord'); return }
    setLoading(true); setError(''); setForgotMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setLoading(false)
    if (error) setError(error.message)
    else setForgotMsg('Un lien de réinitialisation a été envoyé à votre email.')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/onboarding')
  }

  async function handleGoogleLogin() {
    setLoading(true); setError('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        .login-page-wrap {
          --bg: #F8FAFC; 
          --card: #FFFFFF; 
          --border: #E2E8F0;
          --accent: #115E36; 
          --accent-hover: #147040;
          --accent-light: rgba(17, 94, 54, 0.08);
          --text: #0F172A; 
          --text2: #475569; 
          --text3: #94A3B8;
          --input-bg: #FFFFFF; 
          --input-border: #CBD5E1;
          --shadow: rgba(0, 0, 0, 0.05);
          font-family: 'Outfit', sans-serif;
          background: var(--card);
          color: var(--text);
          min-height: 100vh;
          display: flex;
          align-items: stretch;
          overflow-x: hidden;
        }
        [data-theme="dark"] .login-page-wrap {
          --bg: #0B100D; 
          --card: #131815; 
          --border: rgba(255,255,255,0.08);
          --accent: #1EB063; 
          --accent-hover: #24C873;
          --accent-light: rgba(30,176,99,0.15);
          --text: #FFFFFF;
          --text2: #9CA3AF;
          --text3: #4B5563;
          --input-bg: #0F1411;
          --input-border: rgba(255,255,255,0.1);
        }

        /* ── Layout ── */
        .login-left {
          flex: 1.2;
          display: flex;
          flex-direction: column;
          padding: 40px 60px;
          position: relative;
          z-index: 1;
          background: var(--bg);
          overflow-y: auto;
        }
        .login-left::before {
          content: '';
          position: absolute;
          top: -20%;
          right: -10%;
          width: 800px;
          height: 800px;
          background: var(--accent-light);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
        }
        
        .login-right {
          width: 500px;
          flex-shrink: 0;
          background: var(--card);
          display: flex;
          flex-direction: column;
          padding: 40px 60px;
          position: relative;
          z-index: 1;
        }

        /* ── Left Content ── */
        .login-logo-left {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
        }
        
        .login-content-left {
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }

        .login-tagline {
          text-align: left;
          margin-bottom: 40px;
        }
        .login-tagline h1 {
          font-family: 'Outfit', sans-serif;
          font-size: 42px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .login-tagline p {
          font-size: 16px;
          color: var(--text2);
          line-height: 1.6;
          max-width: 500px;
        }

        /* ── Illustration (Background) ── */
        .phone-illustration {
          width: 100%;
          max-width: 600px;
          height: 380px;
          margin: 0 auto 40px;
          background-image: url('/illustration.jpg');
          background-size: contain;
          background-position: center;
          background-repeat: no-repeat;
        }

        /* ── Features ── */
        .login-features {
          display: flex;
          gap: 20px;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .feature-item {
          flex: 1;
          text-align: center;
        }
        .feature-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }
        .feature-item h4 {
          font-size: 14px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text);
        }
        .feature-item p {
          font-size: 12px;
          color: var(--text2);
          line-height: 1.5;
        }
        .hashtag {
          color: #E84C3D;
          font-weight: 800;
          font-size: 15px;
          margin-top: 20px;
        }

        /* ── Form ── */
        .login-form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .login-form h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--accent);
        }
        .login-form p.subtitle {
          font-size: 15px;
          color: var(--text2);
          margin-bottom: 40px;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text);
          display: block;
          margin-bottom: 8px;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .form-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 14px 16px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .form-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-light);
        }
        .form-input::placeholder {
          color: var(--text3);
        }
        .btn-primary {
          width: 100%;
          background: var(--accent);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s;
          margin-top: 8px;
        }
        .btn-primary:hover {
          background: var(--accent-hover);
        }
        .btn-primary:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: var(--text3);
          font-size: 13px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }
        
        .btn-social {
          width: 100%;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all .2s;
          margin-bottom: 12px;
        }
        .btn-social:hover {
          border-color: var(--accent);
          background: var(--bg);
        }
        
        .login-switch {
          text-align: center;
          margin-top: 32px;
          font-size: 14px;
          color: var(--text2);
        }
        .login-switch a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }
        
        .error-box {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          color: #EF4444;
          font-size: 13px;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
        }
        
        .theme-toggle {
          position: absolute;
          top: 40px;
          right: 40px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: transparent;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s;
          color: var(--text);
        }
        .theme-toggle:hover {
          background: var(--bg);
          border-color: var(--text3);
        }
        
        .password-wrap { position: relative; }
        .password-wrap .form-input { padding-right: 44px; }
        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          color: var(--text3);
          display: flex;
          align-items: center;
        }
        .eye-btn:hover { color: var(--accent); }
        .password-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .forgot-link {
          font-size: 12px;
          color: var(--text2);
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
        }
        .forgot-link:hover { color: var(--accent); text-decoration: underline; }
        .forgot-msg { font-size: 12px; color: #22c55e; margin-top: 6px; }

        .auth-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text3);
          padding-top: 40px;
        }
        .auth-footer-links {
          display: flex;
          gap: 16px;
        }
        .auth-footer-links a {
          color: var(--text3);
          text-decoration: none;
          cursor: pointer;
        }
        .auth-footer-links a:hover {
          color: var(--text);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-left { padding: 40px; }
          .login-right { width: 420px; padding: 40px; }
          .login-tagline h1 { font-size: 32px; }
          .login-features { flex-wrap: wrap; }
          .feature-item { min-width: 45%; margin-bottom: 20px; }
        }
        @media (max-width: 768px) {
          .login-page-wrap { flex-direction: column; }
          .login-left { display: none; }
          .login-right { width: 100%; min-height: 100vh; padding: 40px 24px; }
          .theme-toggle { top: 20px; right: 20px; }
        }
      `}</style>

      <div className="login-page-wrap">
        {/* Left — Brand & Illustration */}
        <div className="login-left">
          <div className="login-logo-left">
            <img src="/logo.jpg" alt="CM Studio" style={{ height: '36px', borderRadius: '4px' }} 
                 onError={(e) => { 
                   e.currentTarget.style.display = 'none'; 
                   const fallback = document.getElementById('logo-fallback');
                   if(fallback) fallback.style.display = 'flex'; 
                 }} />
            <div id="logo-fallback" style={{ display: 'none', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: 'var(--accent)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', fontFamily: 'Syne' }}>CM</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent)', fontFamily: 'Syne' }}>CM Studio</div>
            </div>
          </div>

          <div className="login-content-left">
            <div className="login-tagline">
              <h1>
                Générez, planifiez et<br />
                publiez vos contenus
              </h1>
              <p>La plateforme tout-en-un pour créer du contenu, le distribuer sur plusieurs réseaux et suivre vos performances.</p>
            </div>
            
            <div className="phone-illustration">
            </div>

            <div className="login-features">
              <div className="feature-item">
                 <div className="feature-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                 </div>
                 <h4>Générez du contenu</h4>
                 <p>Créez des posts accrocheurs en quelques secondes avec l'IA.</p>
              </div>
              <div className="feature-item">
                 <div className="feature-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                 </div>
                 <h4>Planifiez</h4>
                 <p>Programmez vos publications au meilleur moment.</p>
              </div>
              <div className="feature-item">
                 <div className="feature-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                 </div>
                 <h4>Publiez partout</h4>
                 <p>Diffusez sur Facebook, Instagram, LinkedIn, TikTok et plus.</p>
              </div>
              <div className="feature-item">
                 <div className="feature-icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                 </div>
                 <h4>Analysez & optimisez</h4>
                 <p>Suivez les performances et améliorez vos résultats.</p>
              </div>
            </div>
            
            <div className="hashtag">
              #servicepublicbj
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="login-right">
          <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            )}
          </button>

          <div className="login-form-container">
            <div className="login-form">
              {mode === 'login' ? (
                <>
                  <h2>Bon retour</h2>
                  <p className="subtitle">Connectez-vous à votre espace CM Studio</p>

                  <form onSubmit={handleLogin}>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="votre@email.com"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <div className="password-row">
                        <label className="form-label" style={{ margin: 0 }}>Mot de passe</label>
                        <span className="forgot-link" onClick={handleForgotPassword}>Mot de passe oublié ?</span>
                      </div>
                      <div className="password-wrap">
                        <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} required />
                        <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                      {forgotMsg && <div className="forgot-msg">{forgotMsg}</div>}
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                  </form>

                  <div className="divider">ou continuer avec</div>

                  <button className="btn-social" type="button" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </button>

                  <div className="login-switch">
                    Vous n&apos;avez pas de compte ?{' '}
                    <a onClick={() => { setMode('register'); setError('') }}>Créer un compte</a>
                  </div>
                </>
              ) : (
                <>
                  <h2>Créer un compte</h2>
                  <p className="subtitle">Commencez gratuitement dès maintenant</p>

                  <form onSubmit={handleRegister}>
                    <div className="form-group">
                      <label className="form-label">Prénom</label>
                      <input className="form-input" type="text" placeholder="Ex : Alex"
                        value={fullName} onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="votre@email.com"
                        value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mot de passe</label>
                      <div className="password-wrap">
                        <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                          value={password} onChange={e => setPassword(e.target.value)} minLength={8} required />
                        <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                          {showPassword ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                  </form>

                  <div className="divider">ou continuer avec</div>

                  <button className="btn-social" type="button" onClick={handleGoogleLogin} disabled={loading}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuer avec Google
                  </button>

                  <div className="login-switch">
                    Déjà un compte ?{' '}
                    <a onClick={() => { setMode('login'); setError('') }}>Se connecter</a>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="auth-footer">
            <div>© 2025 CM Studio. Tous droits réservés.</div>
            <div className="auth-footer-links">
              <a href="#">Mentions légales</a>
              <a href="#">Confidentialité</a>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}
