'use client'

import React, { useState } from 'react'
import { useStrategy } from '@/hooks/useStrategy'
import { StrategySidePanel } from './StrategySidePanel'
import { StrategyDetailModal } from './StrategyDetailModal'

export function StrategyWorkspaceWrapper({ children }: { children: React.ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialModalTab, setInitialModalTab] = useState<'objectives' | 'editorial' | 'mockups' | 'kpis' | 'history'>('objectives')

  const {
    selectedPeriod,
    setSelectedPeriod,
    currentStrategy,
    strategiesHistory,
    loading,
    saving,
    isOwnerOrCM,
    saveStrategy,
    updateStatus,
    deleteStrategy,
    duplicateFromPrevious
  } = useStrategy()

  return (
    <div className="relative w-full min-h-full flex-1 flex flex-col">
      {/* Workspace Child Views */}
      {children}

      {/* Slide-over Side Panel with Border Toggle Handle */}
      <StrategySidePanel
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(prev => !prev)}
        onClose={() => setIsPanelOpen(false)}
        onOpenFullModal={(tab) => {
          setIsPanelOpen(false)
          setInitialModalTab(tab || 'objectives')
          setIsModalOpen(true)
        }}
        strategy={currentStrategy}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        onUpdateStatus={updateStatus}
        isOwnerOrCM={isOwnerOrCM}
        loading={loading}
      />

      {/* Full Detailed Modal */}
      <StrategyDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialTab={initialModalTab}
        strategy={currentStrategy}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        strategiesHistory={strategiesHistory}
        onSave={saveStrategy}
        onDelete={deleteStrategy}
        onDuplicate={duplicateFromPrevious}
        isOwnerOrCM={isOwnerOrCM}
        saving={saving}
      />
    </div>
  )
}
