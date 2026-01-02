import {
  Footprints,
  Hand,
  HatGlasses,
  PersonStanding,
  RectangleGoggles,
  Shirt,
  VenetianMask,
} from 'lucide-react'
import { useMemo, useState, type ComponentType } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ComfortProfileControls } from '@/features/home/components/ComfortProfileControls'
import { cn } from '@/lib/utils'
import type {
  ComfortProfile,
  ExertionLevel,
  TripDuration,
  WearPlan,
} from '@/lib/gear'
import type { SportType } from '@/lib/weather'
import type { LoadStatus } from '@/features/home/types'

const SPORT_LABELS: Record<SportType, string> = {
  running: 'Running',
  skiing: 'Skiing',
}

const exertionOptions: Array<{ value: ExertionLevel; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'steady', label: 'Steady' },
  { value: 'hard', label: 'Hard' },
]

const durationOptions: Array<{ value: TripDuration; label: string }> = [
  { value: 'short', label: '< 1h' },
  { value: 'medium', label: '1-3h' },
  { value: 'long', label: '3h+' },
]

type WearGuideCardProps = {
  status: LoadStatus
  sport: SportType
  wearPlan: WearPlan | null
  colderWearPlan: WearPlan | null
  wetterWearPlan: WearPlan | null
  comfortProfile: ComfortProfile
  onComfortProfileChange: (profile: ComfortProfile) => void
  exertion: ExertionLevel
  onExertionChange: (value: ExertionLevel) => void
  duration: TripDuration
  onDurationChange: (value: TripDuration) => void
}

type Scenario = 'now' | 'colder' | 'wetter'

function optionClass(isSelected: boolean) {
  return cn(
    'min-h-[40px] rounded-full border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-50',
    isSelected
      ? 'border-tide-300/60 bg-ink-950/60 text-ink-50'
      : 'text-ink-100/70 hover:border-tide-300/50 hover:text-ink-50'
  )
}

const coverageSections: Array<{
  key: keyof WearPlan['coverage']
  label: string
  icon: ComponentType<{ className?: string }>
  accent: string
}> = [
  { key: 'feet', label: 'Feet', icon: Footprints, accent: 'text-tide-200' },
  { key: 'legs', label: 'Legs', icon: PersonStanding, accent: 'text-ink-100' },
  { key: 'torso', label: 'Torso', icon: Shirt, accent: 'text-tide-200' },
  { key: 'hands', label: 'Hands', icon: Hand, accent: 'text-spice-200' },
  { key: 'neckFace', label: 'Neck + face', icon: VenetianMask, accent: 'text-spice-200' },
  { key: 'head', label: 'Head', icon: HatGlasses, accent: 'text-tide-200' },
  { key: 'eyes', label: 'Eyes', icon: RectangleGoggles, accent: 'text-ink-100' },
]

export function WearGuideCard({
  status,
  sport,
  wearPlan,
  colderWearPlan,
  wetterWearPlan,
  comfortProfile,
  onComfortProfileChange,
  exertion,
  onExertionChange,
  duration,
  onDurationChange,
}: WearGuideCardProps) {
  const [scenario, setScenario] = useState<Scenario>('now')

  const activePlan = useMemo(() => {
    if (scenario === 'colder') return colderWearPlan
    if (scenario === 'wetter') return wetterWearPlan
    return wearPlan
  }, [scenario, wearPlan, colderWearPlan, wetterWearPlan])

  return (
    <Card>
      <CardHeader>
        <Badge variant="glow">Wear guide</Badge>
        <CardTitle className="text-2xl">Wear-ready guidance for {SPORT_LABELS[sport]}</CardTitle>
        <CardDescription>
          Adaptive layer planning that responds to conditions, effort, and how you run hot or cold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : !activePlan ? (
          <p className="text-sm text-ink-100/70">Select a location and time to see gear.</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">
                    {scenario === 'now'
                      ? 'Layer breakdown'
                      : scenario === 'colder'
                        ? 'Layer breakdown (colder)'
                        : 'Layer breakdown (wet)'}
                  </p>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {coverageSections.map((section) => {
                    const items = activePlan.coverage[section.key]
                    const optionalItems = activePlan.optionalCoverage[section.key]
                    const Icon = section.icon
                    return (
                      <div
                        key={section.key}
                        className="rounded-2xl border border-ink-200/10 bg-ink-950/50 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200/10 bg-ink-900/60">
                            <Icon className={cn('h-4 w-4', section.accent)} />
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                            {section.label}
                          </p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {items.length ? (
                            items.map((item) => (
                              <span
                                key={item}
                                className="rounded-full border border-ink-200/15 bg-ink-900/60 px-3 py-1 text-xs text-ink-50"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-ink-100/50">None</span>
                          )}
                          {optionalItems?.map((item) => (
                            <span
                              key={`optional-${item}`}
                              className="rounded-full border border-dashed border-ink-200/20 px-3 py-1 text-xs text-ink-100/70"
                            >
                              Optional: {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activePlan.reasons.map((reason) => (
                    <span
                      key={reason}
                      className="rounded-full border border-ink-200/20 bg-ink-900/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink-100/80"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Tune this plan</p>
                <p className="mt-2 text-sm text-ink-100/70">
                  Adjust comfort and effort to match how you actually feel outside.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Scenario</p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'now'), 'w-full sm:w-auto')}
                        onClick={() => setScenario('now')}
                      >
                        Now
                      </button>
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'colder'), 'w-full sm:w-auto')}
                        onClick={() => setScenario('colder')}
                        disabled={!colderWearPlan}
                      >
                        10F colder
                      </button>
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'wetter'), 'w-full sm:w-auto')}
                        onClick={() => setScenario('wetter')}
                        disabled={!wetterWearPlan}
                      >
                        Gets wet
                      </button>
                    </div>
                  </div>
                  <ComfortProfileControls
                    profile={comfortProfile}
                    onChange={onComfortProfileChange}
                  />
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Effort level
                    </p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {exertionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onExertionChange(option.value)}
                          className={cn(optionClass(exertion === option.value), 'w-full sm:w-auto')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Trip length
                    </p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onDurationChange(option.value)}
                          className={cn(optionClass(duration === option.value), 'w-full sm:w-auto')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </CardContent>
    </Card>
  )
}
