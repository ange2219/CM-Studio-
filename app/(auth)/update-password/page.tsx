'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

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
      setTimeout(() => router.push('/home'), 2000)
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-green" />
        </div>
        <h1 className="font-display text-2xl font-bold text-t1 mb-2">Mot de passe mis à jour</h1>
        <p className="text-t3 text-sm">Redirection vers le tableau de bord…</p>
      </div>
    )
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-t1 mb-1">Nouveau mot de passe</h1>
      <p className="text-t3 text-sm mb-8">Choisissez un mot de passe sécurisé</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nouveau mot de passe</label>
          <input
            type="password"
            className="input"
            placeholder="Min. 8 caractères"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Confirmer le mot de passe</label>
          <input
            type="password"
            className="input"
            placeholder="Répétez le mot de passe"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="bg-red/5 border border-red/20 text-red text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
        </button>
      </form>
    </>
  )
}
