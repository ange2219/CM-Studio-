'use client'

import React, { useState } from 'react'
import { useStrategy } from '@/hooks/useStrategy'
import { StrategySidePanel } from './StrategySidePanel'
import { StrategyDetailModal } from './StrategyDetailModal'
import { StrategyTriggerButton } from './StrategyTriggerButton'

export function StrategyWorkspaceWrapper({ children }: { children: React.ReactNode }) {
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      {/* Global Strategy Trigger Button accessible anywhere in Workspace */}
      <StrategyTriggerButton
        onClick={() => setIsPanelOpen(true)}
        strategy={currentStrategy}
        selectedPeriod={selectedPeriod}
      />

      {/* Slide-over Side Panel */}
      <StrategySidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onOpenFullModal={() => {
          setIsPanelOpen(false)
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
