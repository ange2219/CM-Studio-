'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface Organization {
  id: string
  name: string
  avatar_url: string | null
  plan: 'free' | 'premium' | 'business'
  zernio_profile_id: string | null
  created_at: string
}

export interface UserMembership {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'cm' | 'viewer'
  created_at: string
  organization: Organization
}

interface OrgContextType {
  activeOrganization: Organization | null
  organizations: Organization[]
  membership: UserMembership | null
  isLoading: boolean
  switchOrganization: (orgId: string) => Promise<void>
}

const OrgContext = createContext<OrgContextType | undefined>(undefined)

export function OrgProvider({
  children,
  initialOrganizations,
  initialActiveOrg,
  initialMembership
}: {
  children: React.ReactNode
  initialOrganizations: Organization[]
  initialActiveOrg: Organization | null
  initialMembership: UserMembership | null
}) {
  const [activeOrg, setActiveOrg] = useState<Organization | null>(initialActiveOrg)
  const [membership, setMembership] = useState<UserMembership | null>(initialMembership)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const switchOrganization = async (orgId: string) => {
    setIsLoading(true)
    try {
      // Définir le cookie côté client
      const secureFlag = window.location.protocol === 'https:' ? '; Secure' : ''
      document.cookie = `active_org_id=${orgId}; path=/; max-age=${60 * 60 * 24 * 365}${secureFlag}; SameSite=Lax`
      
      // Mettre à jour l'état local
      const targetOrg = initialOrganizations.find(o => o.id === orgId)
      if (targetOrg) {
        setActiveOrg(targetOrg)
      }

      // Rediriger vers l'accueil pour forcer le rechargement des Server Components avec le nouveau scope
      window.location.href = '/home'
    } catch (err) {
      console.error('Erreur lors du changement d\'organisation:', err)
      setIsLoading(false)
    }
  }

  // Synchroniser l'état si les props initiales changent (Next.js Navigation)
  useEffect(() => {
    if (initialActiveOrg) {
      setActiveOrg(initialActiveOrg)
    }
    if (initialMembership) {
      setMembership(initialMembership)
    }
  }, [initialActiveOrg, initialMembership])

  return (
    <OrgContext.Provider
      value={{
        activeOrganization: activeOrg,
        organizations: initialOrganizations,
        membership,
        isLoading,
        switchOrganization
      }}
    >
      {children}
    </OrgContext.Provider>
  )
}

export function useOrg() {
  const context = useContext(OrgContext)
  if (context === undefined) {
    throw new Error('useOrg doit être utilisé au sein d\'un OrgProvider')
  }
  return context
}
