'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

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
      setError('Minimum 8 caractères')
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

        html, body {
          overflow: hidden !important;
          height: 100vh !important;
          margin: 0;
          padding: 0;
        }

        .login-page-wrap {
          --bg: #F4F6F5; 
          --card: #FFFFFF; 
          --border: #E5E7EB;
          --accent: #0D5131; 
          --accent-hover: #0A3E25;
          --accent-light: rgba(13, 81, 49, 0.06);
          --text: #111827; 
          --text2: #4B5563; 
          --text3: #9CA3AF;
          --input-bg: #FFFFFF; 
          --input-border: #D1D5DB;
          --shadow: rgba(0, 0, 0, 0.05);
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: var(--card);
          color: var(--text);
          height: 100vh;
          max-height: 100vh;
          display: flex;
          align-items: stretch;
          overflow: hidden;
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
          flex: 1.3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 35px 50px;
          position: relative;
          z-index: 1;
          background-color: #F9FFE3;
          overflow: hidden;
        }
        .login-left::before {
          display: none;
        }
        .decor-top-circle-1 {
          position: absolute;
          top: -140px;
          left: 180px;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: #EFF1F4;
          z-index: 0;
          pointer-events: none;
        }
        .decor-top-circle-2 {
          position: absolute;
          top: -90px;
          left: -90px;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: rgba(13, 81, 49, 0.04);
          z-index: 0;
          pointer-events: none;
        }
        
        .login-right {
          width: 520px;
          flex-shrink: 0;
          background: var(--card);
          display: flex;
          flex-direction: column;
          padding: 40px 50px;
          position: relative;
          z-index: 1;
          justify-content: space-between;
          border-left: 1px solid var(--border);
          height: 100vh;
          overflow-y: auto;
        }

        /* ── Left Content ── */
        
        .login-content-left {
          width: 100%;
          margin: auto 0;
        }

        .login-tagline {
          text-align: left;
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
          margin-top: 75px;
        }
        .login-tagline h1 {
          font-size: 28px;
          font-weight: 800;
          color: var(--accent);
          line-height: 1.25;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .login-tagline p {
          font-size: 13px;
          color: var(--text2);
          line-height: 1.4;
          max-width: 520px;
        }

        /* ── Illustration ── */
        .illustration-container {
          width: calc(100% + 160px);
          margin-left: -80px;
          margin-right: -80px;
          margin-top: 15px;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        .illustration-img {
          width: 100%;
          height: auto;
          max-height: 440px;
          object-fit: contain;
          display: block;
        }

        /* ── Features ── */
        .login-features {
          display: flex;
          gap: 12px;
          justify-content: space-between;
          margin-top: 10px;
          position: relative;
          z-index: 2;
        }
        .feature-item {
          flex: 1;
          text-align: center;
          padding: 0 2px;
        }
        .feature-icon {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: var(--accent-light);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 8px;
        }
        .feature-item h4 {
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 2px;
          color: var(--text);
        }
        .feature-item p {
          font-size: 9.5px;
          color: var(--text2);
          line-height: 1.3;
        }
        .hashtag {
          color: #E84C3D;
          font-weight: 800;
          font-size: 14px;
          margin-top: 30px;
        }

        .login-logo {
          position: absolute;
          top: 35px;
          left: 50px;
          z-index: 2;
          width: 60px;
          height: 60px;
        }

        .form-logo {
          display: none;
          margin-bottom: 24px;
          justify-content: center;
        }

        /* ── Form ── */
        .login-form-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          margin: 30px 0;
        }
        .login-form h2 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 6px;
          color: var(--accent);
        }
        .login-form p.subtitle {
          font-size: 14px;
          color: var(--text2);
          margin-bottom: 30px;
        }
        .form-group {
          margin-bottom: 18px;
        }
        .form-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text2);
          display: block;
          margin-bottom: 6px;
          letter-spacing: .05em;
        }
        .input-icon-wrap {
          position: relative;
        }
        .input-icon-wrap .form-input {
          padding-left: 44px;
        }
        .input-left-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text3);
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        .form-input {
          width: 100%;
          background: var(--input-bg);
          border: 1px solid var(--input-border);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
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
          padding: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background .2s;
          margin-top: 6px;
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
          margin: 20px 0;
          color: var(--text3);
          font-size: 12px;
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
          padding: 12px;
          color: var(--text);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all .2s;
          margin-bottom: 12px;
        }
        .btn-social:hover {
          border-color: var(--accent);
          background: var(--bg);
        }
        
        .login-switch {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: var(--text2);
        }
        .login-switch a {
          color: var(--text);
          text-decoration: none;
          font-weight: 700;
          cursor: pointer;
        }
        .login-switch a:hover {
          text-decoration: underline;
        }
        
        .error-box {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.2);
          color: #EF4444;
          font-size: 12px;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 14px;
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
          margin-bottom: 6px;
        }
        .forgot-link {
          font-size: 11px;
          color: var(--text);
          text-decoration: none;
          cursor: pointer;
          font-weight: 600;
        }
        .forgot-link:hover { color: var(--accent); text-decoration: underline; }
        .forgot-msg { font-size: 12px; color: #22c55e; margin-top: 6px; }

        .auth-footer {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--text3);
          border-top: 1px solid var(--border);
          padding-top: 20px;
        }
        .auth-footer-links {
          display: flex;
          gap: 12px;
        }
        .auth-footer-links a {
          color: var(--text3);
          text-decoration: none;
          cursor: pointer;
        }
        .auth-footer-links a:hover {
          color: var(--text2);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .login-left { padding: 40px; }
          .login-right { width: 440px; padding: 40px; }
          .login-tagline h1 { font-size: 32px; }
          .login-features { flex-wrap: wrap; }
          .feature-item { min-width: 45%; margin-bottom: 16px; }
          .login-logo { top: 40px; left: 40px; }
        }
        @media (max-width: 768px) {
          .login-page-wrap { flex-direction: column; }
          .login-left { display: none; }
          .login-right { width: 100%; min-height: 100vh; padding: 40px 24px; }
          .theme-toggle { top: 20px; right: 20px; }
          .form-logo { display: flex; }
        }
        @media (max-height: 720px) {
          .login-left {
            padding: 20px 40px;
          }
          .login-logo {
            top: 20px;
            left: 40px;
            width: 48px;
            height: 48px;
          }
          .login-tagline {
            margin-top: 55px;
          }
          .login-tagline h1 {
            font-size: 24px;
            line-height: 1.2;
          }
          .login-tagline p {
            font-size: 11.5px;
            margin-top: 4px;
          }
          .login-features {
            margin-top: 5px;
          }
          .feature-icon {
            width: 34px;
            height: 34px;
          }
          .feature-item h4 {
            font-size: 10.5px;
          }
          .feature-item p {
            font-size: 9px;
          }
        }
      `}</style>

      <div className="login-page-wrap">
        {/* Left — Brand & Illustration */}
        <div className="login-left">
          <Image
            src="/images/cmstudio-illustration.png"
            alt="CM Studio"
            fill
            className="object-cover"
            priority
            style={{ zIndex: 1, transform: 'scale(0.90)' }}
          />

          {/* Decorative Top Circles */}
          <div className="decor-top-circle-1"></div>
          <div className="decor-top-circle-2"></div>

          {/* Logo */}
          <div className="login-logo">
            <Image
              src="/logo.png"
              alt="CM Studio Logo"
              fill
              className="object-contain"
              style={{ borderRadius: '8px' }}
            />
          </div>

          <div className="login-tagline">
            <h1>
              Générez, planifiez et<br />
              publiez vos contenus
            </h1>
            <p>La plateforme tout-en-un pour créer du contenu, le distribuer sur plusieurs réseaux et suivre vos performances.</p>
          </div>

          <div className="login-features">
            <div className="feature-item">
               <div className="feature-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
               </div>
               <h4>Générez du contenu</h4>
               <p>Créez des posts accrocheurs en quelques secondes avec l'IA.</p>
            </div>
            <div className="feature-item">
               <div className="feature-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
               </div>
               <h4>Planifiez</h4>
               <p>Programmez vos publications au meilleur moment.</p>
            </div>
            <div className="feature-item">
               <div className="feature-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
               </div>
               <h4>Publiez partout</h4>
               <p>Diffusez sur Facebook, Instagram, LinkedIn, TikTok et plus.</p>
            </div>
            <div className="feature-item">
               <div className="feature-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
               </div>
               <h4>Analysez & optimisez</h4>
               <p>Suivez les performances et améliorez vos résultats.</p>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="login-right">


          <div className="login-form-container">
            <div className="login-form">
              {/* Logo visible only on mobile */}
              <div className="form-logo">
                <Image src="/logo.png" alt="CM Studio Logo" width={40} height={40} style={{ borderRadius: '8px' }} />
              </div>

              {done ? (
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <CheckCircle size={28} color="#22c55e" />
                  </div>
                  <h2>Mot de passe mis à jour</h2>
                  <p className="subtitle">Redirection vers la connexion…</p>
                </div>
              ) : (
                <>
                  <h2>Nouveau mot de passe</h2>
                  <p className="subtitle">Choisissez un mot de passe sécurisé</p>

                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label className="form-label">NOUVEAU MOT DE PASSE</label>
                      <div className="password-wrap">
                        <div className="input-icon-wrap">
                          <span className="input-left-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </span>
                          <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 caractères"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                        </div>
                        <button type="button" className="eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                          {showPassword ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">CONFIRMER LE MOT DE PASSE</label>
                      <div className="password-wrap">
                        <div className="input-icon-wrap">
                          <span className="input-left-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          </span>
                          <input className="form-input" type={showConfirm ? 'text' : 'password'} placeholder="Répétez le mot de passe"
                            value={confirm} onChange={e => setConfirm(e.target.value)} required />
                        </div>
                        <button type="button" className="eye-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                          {showConfirm ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                          ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <button className="btn-primary" type="submit" disabled={loading}>
                      {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                    </button>
                  </form>
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
