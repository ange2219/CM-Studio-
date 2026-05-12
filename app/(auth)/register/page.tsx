'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
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
      router.push('/home')
    }
  }

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-t1 mb-1">Créer un compte</h1>
      <p className="text-t3 text-sm mb-8">Gratuit, sans carte bancaire</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Nom complet</label>
          <input
            type="text"
            className="input"
            placeholder="Marie Dupont"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input"
            placeholder="vous@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label">Mot de passe</label>
          <input
            type="password"
            className="input"
            placeholder="Min. 8 caractères"
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="bg-red/5 border border-red/20 text-red text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
          {loading ? 'Création...' : 'Créer mon compte gratuit'}
        </button>
      </form>

      <p className="text-t3 text-xs text-center mt-4">
        En créant un compte, vous acceptez nos{' '}
        <span className="text-t2">Conditions d'utilisation</span>
      </p>

      <p className="text-t3 text-sm text-center mt-4">
        Déjà un compte ?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  )
}
