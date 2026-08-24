'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrg } from '@/components/context/OrgContext'
import { useToast } from '@/components/ui/Toast'
import type { Strategy, StrategyStatus, StrategyKPI, EditorialLine } from '@/types'

export function getCurrentPeriod(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function formatPeriodLabel(periodStr: string): string {
  if (!periodStr) return ''
  const [yearStr, monthStr] = periodStr.split('-')
  const year = parseInt(yearStr, 10)
  const month = parseInt(monthStr, 10) - 1
  if (isNaN(year) || isNaN(month)) return periodStr
  
  const date = new Date(year, month, 1)
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function getAdjacentPeriod(periodStr: string, offsetMonths: number): string {
  const [yearStr, monthStr] = periodStr.split('-')
  const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1 + offsetMonths, 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

const DEFAULT_EDITORIAL_LINE: EditorialLine = {
  tone: 'Professionnel & Inspirant',
  pillars: ['Conseils & Expertise', 'Coulisses & Culture', 'Produit & Nouveautés'],
  platform_priorities: [
    { platform: 'linkedin', content_type: 'Analyses de tendances & Retours d’expérience', frequency: '3x / semaine' },
    { platform: 'instagram', content_type: 'Carrousels éducatifs & Réels coulisses', frequency: '4x / semaine' },
    { platform: 'twitter', content_type: 'Veille & Pensées courtes percutantes', frequency: '5x / semaine' },
  ],
}

const DEFAULT_KPIS: StrategyKPI[] = [
  { id: '1', name: 'Impressions globales', target: 25000, current: 0, unit: 'vues' },
  { id: '2', name: 'Nouveaux abonnés', target: 300, current: 0, unit: 'abonnés' },
  { id: '3', name: 'Taux d’engagement moyen', target: 4.5, current: 0, unit: '%' },
]

export function useStrategy(initialPeriod?: string) {
  const { activeOrganization, membership } = useOrg()
  const { toast } = useToast()
  const supabase = createClient()

  const [selectedPeriod, setSelectedPeriod] = useState<string>(initialPeriod || getCurrentPeriod())
  const [strategiesHistory, setStrategiesHistory] = useState<Strategy[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [saving, setSaving] = useState<boolean>(false)

  const isOwnerOrCM = useMemo(() => {
    return membership?.role === 'owner' || membership?.role === 'cm'
  }, [membership])

  // Fetch all strategies for the active organization
  const fetchStrategies = useCallback(async () => {
    if (!activeOrganization?.id) {
      setStrategiesHistory([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .eq('organization_id', activeOrganization.id)
        .order('period', { ascending: false })

      if (error) {
        // En cas d'erreur de table non encore créée ou vide
        console.warn('Stratégies : chargement de données:', error.message)
        setStrategiesHistory([])
      } else {
        setStrategiesHistory((data as Strategy[]) || [])
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des stratégies:', err)
    } finally {
      setLoading(false)
    }
  }, [activeOrganization?.id, supabase])

  useEffect(() => {
    fetchStrategies()

    if (!activeOrganization?.id) return

    // Realtime channel for strategy changes
    const channel = supabase
      .channel(`strategies_org_${activeOrganization.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'strategies',
          filter: `organization_id=eq.${activeOrganization.id}`,
        },
        () => {
          fetchStrategies()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeOrganization?.id, fetchStrategies, supabase])

  // Current strategy for the selected period
  const currentStrategy = useMemo(() => {
    return strategiesHistory.find(s => s.period === selectedPeriod) || null
  }, [strategiesHistory, selectedPeriod])

  // Save or update strategy
  const saveStrategy = useCallback(
    async (payload: {
      period?: string
      monthly_objective: string
      target_audience?: string | null
      editorial_line?: EditorialLine
      kpis?: StrategyKPI[]
      status?: StrategyStatus
    }) => {
      if (!activeOrganization?.id) {
        toast('Aucune organisation active sélectionnée.', 'error')
        return null
      }

      setSaving(true)
      const periodToSave = payload.period || selectedPeriod

      try {
        const { data: { user } } = await supabase.auth.getUser()

        const row = {
          organization_id: activeOrganization.id,
          period: periodToSave,
          monthly_objective: payload.monthly_objective,
          target_audience: payload.target_audience ?? null,
          editorial_line: payload.editorial_line || DEFAULT_EDITORIAL_LINE,
          kpis: payload.kpis || DEFAULT_KPIS,
          status: payload.status || 'up_to_date',
          created_by: user?.id || null,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('strategies')
          .upsert(row, { onConflict: 'organization_id,period' })
          .select()
          .single()

        if (error) throw error

        toast('Stratégie enregistrée avec succès !', 'success')
        await fetchStrategies()
        return data as Strategy
      } catch (err: any) {
        console.error('Erreur lors de la sauvegarde de la stratégie:', err)
        toast(err?.message || 'Erreur lors de l’enregistrement de la stratégie.', 'error')
        return null
      } finally {
        setSaving(false)
      }
    },
    [activeOrganization?.id, selectedPeriod, supabase, toast, fetchStrategies]
  )

  // Update Status directly
  const updateStatus = useCallback(
    async (newStatus: StrategyStatus) => {
      if (!currentStrategy) {
        // Create initial strategy with this status
        return saveStrategy({
          monthly_objective: 'Définir les objectifs prioritaires du mois.',
          status: newStatus,
        })
      }

      setSaving(true)
      try {
        const { error } = await supabase
          .from('strategies')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', currentStrategy.id)

        if (error) throw error

        toast(`Statut mis à jour : ${newStatus === 'up_to_date' ? 'À jour' : newStatus === 'to_review' ? 'À réviser' : 'Archivé'}`, 'success')
        await fetchStrategies()
      } catch (err: any) {
        console.error('Erreur mise à jour statut:', err)
        toast('Impossible de modifier le statut.', 'error')
      } finally {
        setSaving(false)
      }
    },
    [currentStrategy, saveStrategy, supabase, toast, fetchStrategies]
  )

  // Update a specific KPI value
  const updateKPIValue = useCallback(
    async (kpiId: string, newCurrentValue: number) => {
      if (!currentStrategy) return

      const updatedKPIs = currentStrategy.kpis.map(kpi =>
        kpi.id === kpiId ? { ...kpi, current: newCurrentValue } : kpi
      )

      try {
        const { error } = await supabase
          .from('strategies')
          .update({ kpis: updatedKPIs, updated_at: new Date().toISOString() })
          .eq('id', currentStrategy.id)

        if (error) throw error
        await fetchStrategies()
      } catch (err: any) {
        console.error('Erreur mise à jour KPI:', err)
      }
    },
    [currentStrategy, supabase, fetchStrategies]
  )

  // Delete a strategy period
  const deleteStrategy = useCallback(
    async (id: string) => {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('strategies')
          .delete()
          .eq('id', id)

        if (error) throw error

        toast('Stratégie supprimée.', 'info')
        await fetchStrategies()
      } catch (err: any) {
        console.error('Erreur suppression stratégie:', err)
        toast('Impossible de supprimer la stratégie.', 'error')
      } finally {
        setSaving(false)
      }
    },
    [supabase, toast, fetchStrategies]
  )

  // Duplicate from previous month
  const duplicateFromPrevious = useCallback(
    async (targetPeriod: string, sourcePeriod?: string) => {
      const srcPeriod = sourcePeriod || getAdjacentPeriod(targetPeriod, -1)
      const source = strategiesHistory.find(s => s.period === srcPeriod)

      const payload = {
        period: targetPeriod,
        monthly_objective: source ? source.monthly_objective : 'Développer l’autorité et l’engagement de la marque.',
        target_audience: source ? source.target_audience : 'Professionnels et créateurs de contenu.',
        editorial_line: source ? source.editorial_line : DEFAULT_EDITORIAL_LINE,
        kpis: source
          ? source.kpis.map(k => ({ ...k, current: 0 }))
          : DEFAULT_KPIS,
        status: 'to_review' as StrategyStatus,
      }

      return saveStrategy(payload)
    },
    [strategiesHistory, saveStrategy]
  )

  return {
    selectedPeriod,
    setSelectedPeriod,
    currentStrategy,
    strategiesHistory,
    loading,
    saving,
    isOwnerOrCM,
    saveStrategy,
    updateStatus,
    updateKPIValue,
    deleteStrategy,
    duplicateFromPrevious,
    refresh: fetchStrategies,
  }
}
