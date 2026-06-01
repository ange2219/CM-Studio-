'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface User {
  id: string
  full_name: string | null
  email?: string
  username?: string | null
  avatar_url: string | null
  plan?: string | null
  brand_name?: string | null
  brand_sector?: string | null
  brand_colors?: string[] | null
  brand_tone?: string | null
}

interface UserContextType {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ initialUser, children }: { initialUser: User; children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const refreshUser = async () => {
    if (!user?.id) return
    setLoading(true)
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    if (data) {
      setUser(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!user?.id) return
    const channel = supabase
      .channel(`public:users:id=eq.${user.id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
        (payload) => {
          setUser(payload.new as User)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, supabase])

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
