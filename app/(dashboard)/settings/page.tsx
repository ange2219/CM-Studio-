'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useToast } from '@/components/ui/Toast'
import { createClient } from '@/lib/supabase/client'
import { Moon, Sun, Globe, CreditCard, Trash2, Lock, ExternalLink, Shield } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'billing', label: 'Abonnements', icon: CreditCard },
  { id: 'notifications', label: 'Language et notifications', icon: Globe },
  { id: 'general', label: 'Réglages', icon: Lock },
  { id: 'privacy', label: 'Confidentialité', icon: Shield },
]

export default function SettingsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--t3)' }}>Chargement des paramètres...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const { toast } = useToast()
  const supabase = createClient()
  const searchParams = useSearchParams()
  
  const tab = searchParams.get('tab') || 'billing'
  const [active, setActive] = useState(tab)

  useEffect(() => {
    if (tab) setActive(tab)
  }, [tab])

  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lang, setLang] = useState<'fr' | 'en'>('fr')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'business'>('free')
  const [userEmail, setUserEmail] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdStep, setPwdStep] = useState<'idle' | 'verified'>('idle')

  const [confirmDelete, setConfirmDelete] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (u?.plan) setUserPlan(u.plan)
      if (u?.email) setUserEmail(u.email)
    })
    const saved = localStorage.getItem('theme') || document.documentElement.getAttribute('data-theme') || 'dark'
    setTheme(saved as 'dark' | 'light')
  }, [])

  async function verifyCurrentPassword() {
    if (!currentPassword) { toast('Entrez votre mot de passe actuel', 'error'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.signInWithPassword({ email: userEmail, password: currentPassword })
    setSavingPwd(false)
    if (error) { toast('Mot de passe actuel incorrect', 'error'); return }
    setPwdStep('verified')
    toast('Identité vérifiée', 'success')
  }

  async function changePassword() {
    if (newPassword.length < 8) { toast('8 caractères minimum', 'error'); return }
    if (newPassword !== confirmPassword) { toast('Les mots de passe ne correspondent pas', 'error'); return }
    setSavingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSavingPwd(false)
    if (error) { toast(error.message, 'error'); return }
    toast('Mot de passe modifié avec succès', 'success')
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setPwdStep('idle')
  }

  async function handleUpgrade(plan: 'premium' | 'business') {
    const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  async function handlePortal() {
    const res = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else toast(data.error, 'error')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100%', margin: '-20px' }}>
      {/* Sidebar locale */}
      <aside style={{ width: '240px', flexShrink: 0, borderRight: '1px solid var(--border)', padding: '1.5rem 0', position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: '100vh' }}>
        <div style={{ padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Paramètres</h2>
        </div>
        <nav>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button key={item.id} onClick={() => setActive(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.7rem 1.5rem', background: 'none', border: 'none', borderLeft: isActive ? `2px solid var(--purple)` : '2px solid transparent', color: isActive ? 'var(--text)' : 'var(--text3)', cursor: 'pointer', fontSize: '.85rem', fontWeight: isActive ? 600 : 500, transition: '0.2s', textAlign: 'left' }}>
                <Icon size={16} style={{ color: isActive ? 'var(--purple)' : 'inherit' }} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '2.5rem 3rem', maxWidth: '800px' }}>
        
        {/* ABONNEMENTS */}
        {active === 'billing' && (
          <div>
            <SectionHeader title="Abonnements" desc="Gérez votre plan et vos informations de paiement." />
            <div style={{ padding: '1.25rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                <div style={{ fontSize: '.9rem', fontWeight: 600 }}>Plan actuel</div>
                <span style={{ padding: '.25rem .75rem', borderRadius: '999px', fontSize: '.75rem', fontWeight: 700, background: 'var(--purple-light)', color: 'var(--purple)' }}>
                  {userPlan.toUpperCase()}
                </span>
              </div>
              <p style={{ fontSize: '.8rem', color: 'var(--text3)', margin: 0 }}>
                {userPlan === 'free' ? 'Plan Gratuit : Fonctionnalités de base incluses.' : 'Plan Premium : Accès complet à toutes les fonctionnalités.'}
              </p>
            </div>
            {userPlan === 'free' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <PlanCard name="Premium" price="29€/mois" features={['IA illimitée', '5 plateformes', 'Support 24/7']} color="var(--purple)" onUpgrade={() => handleUpgrade('premium')} />
                <PlanCard name="Business" price="79€/mois" features={['Equipe (3 pers.)', 'Analytiques Pro', 'API Access']} color="#FBBF24" onUpgrade={() => handleUpgrade('business')} />
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {active === 'notifications' && (
          <div>
            <SectionHeader title="Language et notifications" desc="Préférences de communication." />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <SettingRow label="Langue de l'interface" desc="Choisissez votre langue préférée.">
                <select className="input" value={lang} onChange={e => setLang(e.target.value as any)} style={{ maxWidth: '200px' }}>
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                </select>
              </SettingRow>
              <SettingRow label="Alertes Email" desc="Recevez des notifications par email pour vos posts.">
                <Toggle value={emailNotifs} onChange={setEmailNotifs} />
              </SettingRow>
            </div>
          </div>
        )}

        {/* RÉGLAGES (Apparence + Password + Danger) */}
        {active === 'general' && (
          <div>
            <SectionHeader title="Réglages" desc="Apparence et sécurité de votre compte." />
            
            {/* Apparence */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Apparence</h3>
              <div style={{ display: 'flex', gap: '1rem' }}>
                {(['dark', 'light'] as const).map(t => (
                  <button key={t} onClick={() => { setTheme(t); localStorage.setItem('theme', t); document.documentElement.setAttribute('data-theme', t) }} style={{ 
                    flex: 1, padding: '1rem', borderRadius: '12px', border: `2px solid ${theme === t ? 'var(--purple)' : 'var(--border)'}`, 
                    background: theme === t ? 'var(--purple-light)' : 'transparent', cursor: 'pointer', transition: '0.2s'
                  }}>
                    <div style={{ fontWeight: 600, color: theme === t ? 'var(--purple)' : 'var(--text2)' }}>{t === 'dark' ? 'Mode Sombre' : 'Mode Clair'}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mot de passe */}
            <div style={{ marginBottom: '3rem', padding: '1.5rem', background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, marginBottom: '1.25rem' }}>Sécurité</h3>
              {pwdStep === 'idle' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ fontSize: '.8rem', color: 'var(--text3)' }}>Pour modifier votre mot de passe, veuillez d'abord saisir votre mot de passe actuel.</label>
                  <div style={{ display: 'flex', gap: '.75rem' }}>
                    <input className="input" type="password" placeholder="Ancien mot de passe" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    <button onClick={verifyCurrentPassword} disabled={savingPwd} className="btn-primary" style={{ padding: '0 1.5rem' }}>
                      {savingPwd ? '...' : 'Vérifier'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', color: '#22C55E', fontSize: '.8rem', fontWeight: 600, marginBottom: '.5rem' }}>✓ Identité vérifiée</div>
                  <input className="input" type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  <input className="input" type="password" placeholder="Confirmer le nouveau mot de passe" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={changePassword} disabled={savingPwd || !newPassword || newPassword !== confirmPassword} className="btn-primary">Enregistrer</button>
                    <button onClick={() => setPwdStep('idle')} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: '.85rem' }}>Annuler</button>
                  </div>
                </div>
              )}
            </div>

            {/* Zone dangereuse */}
            <div style={{ border: '1px solid rgba(239,68,68,0.2)', padding: '1.5rem', borderRadius: '16px', background: 'rgba(239,68,68,0.02)' }}>
              <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.5rem' }}>Zone dangereuse</h3>
              <p style={{ fontSize: '.8rem', color: 'var(--text3)', marginBottom: '1.25rem' }}>La suppression du compte est irréversible. Tapez 'supprimer' pour confirmer.</p>
              <div style={{ display: 'flex', gap: '.75rem' }}>
                <input className="input" placeholder="supprimer" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} style={{ borderColor: confirmDelete === 'supprimer' ? '#ef4444' : 'var(--border)' }} />
                <button onClick={async () => {
                  setDeleting(true)
                  const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
                  if (res.ok) { await supabase.auth.signOut(); window.location.href = '/login' }
                  else { const d = await res.json(); toast(d.error || 'Erreur', 'error'); setDeleting(false) }
                }} disabled={confirmDelete !== 'supprimer' || deleting} className="btn-danger" style={{ background: confirmDelete === 'supprimer' ? '#ef4444' : 'rgba(239,68,68,0.2)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 1.5rem' }}>
                  {deleting ? '...' : 'Supprimer'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRIVACY */}
        {active === 'privacy' && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Shield size={40} style={{ color: 'var(--purple)', marginBottom: '1.5rem', opacity: 0.5 }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Confidentialité</h2>
            <p style={{ color: 'var(--text3)', fontSize: '.9rem' }}>Les paramètres de confidentialité seront disponibles prochainement.</p>
          </div>
        )}

      </main>
    </div>
  )
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{title}</h1>
      <p style={{ color: 'var(--text3)', fontSize: '0.95rem' }}>{desc}</p>
    </div>
  )
}

function SettingRow({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: '.95rem', marginBottom: '.25rem' }}>{label}</div>
        <div style={{ fontSize: '.8rem', color: 'var(--text3)' }}>{desc}</div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} style={{ width: '44px', height: '24px', borderRadius: '12px', border: 'none', background: value ? 'var(--purple)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: '0.2s' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: value ? '23px' : '3px', transition: '0.2s' }} />
    </button>
  )
}

function PlanCard({ name, price, features, color, onUpgrade }: { name: string; price: string; features: string[]; color: string; onUpgrade: () => void }) {
  return (
    <div style={{ padding: '1.5rem', borderRadius: '16px', border: `1px solid ${color}30`, background: 'var(--card-bg)' }}>
      <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '.25rem' }}>{name}</div>
      <div style={{ fontSize: '1.25rem', fontWeight: 800, color, marginBottom: '1rem' }}>{price}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        {features.map(f => <li key={f} style={{ fontSize: '.8rem', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>• {f}</li>)}
      </ul>
      <button onClick={onUpgrade} className="btn-primary" style={{ width: '100%', background: color }}>S'abonner</button>
    </div>
  )
}
