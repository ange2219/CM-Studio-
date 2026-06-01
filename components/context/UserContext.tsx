'use client'

import { createContext, useContext, useState } from 'react'

export interface UserProfile {
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
  user: UserProfile | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ initialUser, children }: { initialUser: UserProfile; children: React.ReactNode }) {
  const [user] = useState<UserProfile | null>(initialUser)

  return (
    <UserContext.Provider value={{ user }}>
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
