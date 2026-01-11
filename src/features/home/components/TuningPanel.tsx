import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible } from '@base-ui/react/collapsible'

import { GearTuningControls } from '@/features/home/components/GearTuningControls'
import type { ComfortProfile, ExertionLevel, TripDuration } from '@/lib/gear'

type TuningPanelProps = {
  comfortProfile: ComfortProfile
  onComfortProfileChange: (profile: ComfortProfile) => void
  exertion: ExertionLevel
  onExertionChange: (exertion: ExertionLevel) => void
  duration: TripDuration
  onDurationChange: (duration: TripDuration) => void
  scenario: 'now' | 'colder' | 'wetter'
  onScenarioChange: (scenario: 'now' | 'colder' | 'wetter') => void
  colderAvailable: boolean
  wetterAvailable: boolean
  onResetAddedItems: () => void
}

export function TuningPanel({
  comfortProfile,
  onComfortProfileChange,
  exertion,
  onExertionChange,
  duration,
  onDurationChange,
  scenario,
  onScenarioChange,
  colderAvailable,
  wetterAvailable,
  onResetAddedItems,
}: TuningPanelProps) {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window === 'undefined') return true
    const saved = localStorage.getItem('gearcast.tuningPanelExpanded')
    return saved !== null ? saved === 'true' : true
  })

  useEffect(() => {
    localStorage.setItem('gearcast.tuningPanelExpanded', String(isOpen))
  }, [isOpen])

  // Build summary string for collapsed state
  const summaryParts = []
  if (comfortProfile.temperaturePreference !== 'neutral') {
    summaryParts.push(
      comfortProfile.temperaturePreference === 'runs_cold' ? 'Runs cold' : 'Runs hot'
    )
  }
  if (exertion !== 'steady') {
    summaryParts.push(exertion === 'easy' ? 'Easy effort' : 'Hard effort')
  }
  if (duration !== 'medium') {
    summaryParts.push(duration === 'short' ? '<1 hour' : '3+ hours')
  }
  const summary = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Custom tuning'

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 transition-all duration-300">
        {/* Header */}
        <Collapsible.Trigger
          className="group relative w-full flex items-center justify-between gap-4 border-b border-slate-700/50 px-6 py-4 text-left transition-colors hover:bg-slate-800/30"
          type="button"
        >
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <span className="flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-indigo-500/40" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-100">Fine-tune your plan</h3>
              {!isOpen && (
                <p className="truncate text-xs text-slate-500 group-hover:text-slate-400">
                  {summary}
                </p>
              )}
            </div>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </Collapsible.Trigger>

        {/* Content */}
        <Collapsible.Panel>
          <div className="px-6 py-5">
            <GearTuningControls
              scenario={scenario}
              onScenarioChange={onScenarioChange}
              comfortProfile={comfortProfile}
              onComfortProfileChange={onComfortProfileChange}
              exertion={exertion}
              onExertionChange={onExertionChange}
              duration={duration}
              onDurationChange={onDurationChange}
              colderAvailable={colderAvailable}
              wetterAvailable={wetterAvailable}
              onResetAddedItems={onResetAddedItems}
            />
          </div>
        </Collapsible.Panel>
      </div>
    </Collapsible.Root>
  )
}
