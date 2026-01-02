import { Star, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { formatLocationName } from '@/lib/weather'
import type { LocationResult, SportType } from '@/lib/weather'
import { cn } from '@/lib/utils'
import type { SavedPlan } from '@/features/home/hooks/useSavedPlans'

type CurrentPlan = {
  location: LocationResult | null
  sport: SportType
  selectedTime: string
  checkedPackItems?: string[]
  checkedWearItems?: string[]
  customPackItems?: string[]
  removedPackItems?: string[]
  removedWearItems?: string[]
  addedWearItems?: string[]
}

type SavedPlansPanelProps = {
  currentPlan?: CurrentPlan
  plans: SavedPlan[]
  activePlanId?: string | null
  showFullPageLink?: boolean
  layout?: 'stacked' | 'split'
  onPlanLoad: (plan: SavedPlan) => void
  onSavePlan: (input: {
    name: string
    location: LocationResult
    sport: SportType
    selectedTime: string
    checkedPackItems: string[]
    checkedWearItems: string[]
    customPackItems: string[]
    removedPackItems: string[]
    removedWearItems: string[]
    addedWearItems: string[]
  }) => void
  onToggleFavorite: (id: string) => void
  onDeletePlan: (id: string) => void
  onClose?: () => void
}

const SPORT_LABELS: Record<SportType, string> = {
  running: 'Running',
  skiing: 'Skiing',
}

function formatTimeLabel(value: string) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString()
}

export function SavedPlansPanel({
  currentPlan,
  plans,
  activePlanId,
  showFullPageLink: showFullPageLinkProp,
  layout = 'stacked',
  onPlanLoad,
  onSavePlan,
  onToggleFavorite,
  onDeletePlan,
  onClose,
}: SavedPlansPanelProps) {
  const routeLocation = useLocation()
  const [planName, setPlanName] = useState('')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastDetails, setToastDetails] = useState<{ title: string; description: string } | null>(
    null
  )

  const canSavePlan = Boolean(currentPlan?.location && currentPlan?.selectedTime)
  const showFullPageLink = showFullPageLinkProp ?? routeLocation.pathname !== '/plans'

  const handleSavePlan = () => {
    if (!currentPlan?.location || !currentPlan.selectedTime) return
    const trimmedName = planName.trim()
    const planLabel = trimmedName.length > 0 ? trimmedName : 'Untitled plan'
    onSavePlan({
      name: trimmedName,
      location: currentPlan.location,
      sport: currentPlan.sport,
      selectedTime: currentPlan.selectedTime,
      checkedPackItems: currentPlan.checkedPackItems ?? [],
      checkedWearItems: currentPlan.checkedWearItems ?? [],
      customPackItems: currentPlan.customPackItems ?? [],
      removedPackItems: currentPlan.removedPackItems ?? [],
      removedWearItems: currentPlan.removedWearItems ?? [],
      addedWearItems: currentPlan.addedWearItems ?? [],
    })
    setToastDetails({
      title: `Saved: ${planLabel}`,
      description: `${formatLocationName(currentPlan.location)} - ${formatTimeLabel(
        currentPlan.selectedTime
      )} - ${SPORT_LABELS[currentPlan.sport]}`,
    })
    setToastOpen(true)
    setPlanName('')
  }

  const handleLoadPlan = (plan: SavedPlan) => {
    onPlanLoad(plan)
    onClose?.()
  }

  return (
    <ToastProvider duration={2800}>
      <div className={layout === 'split' ? 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' : 'space-y-6'}>
        {showFullPageLink && (
          <div
            className={layout === 'split' ? 'lg:col-span-2 flex justify-end' : 'flex justify-end'}
          >
            <Button asChild variant="outline" size="sm">
              <Link to="/plans">Open full page</Link>
            </Button>
          </div>
        )}
        <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Save this plan</p>
          <p className="mt-2 text-sm text-ink-100/70">
            Keep your favorite locations and times handy for fast repeat planning.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input
              placeholder="Plan name (optional)"
              value={planName}
              onChange={(event) => setPlanName(event.target.value)}
            />
            <Button type="button" onClick={handleSavePlan} disabled={!canSavePlan}>
              Save plan
            </Button>
          </div>
          {!canSavePlan && (
            <p className="mt-2 text-xs text-ink-100/60">
              Select a location and time before saving.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-ink-200/10 bg-ink-950/30 p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Saved plans</p>
          {plans.length === 0 ? (
            <p className="mt-2 text-sm text-ink-100/70">No saved plans yet.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-200/10 bg-ink-950/40 px-4 py-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm text-ink-50">{plan.name}</p>
                      {activePlanId === plan.id && (
                        <span className="rounded-full border border-tide-300/50 bg-tide-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-tide-100">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-ink-100/70">
                      {formatLocationName(plan.location)} - {formatTimeLabel(plan.selectedTime)} -{' '}
                      {SPORT_LABELS[plan.sport]}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onToggleFavorite(plan.id)}
                      className={cn(
                        'h-9 w-9 rounded-full',
                        plan.favorite ? 'text-spice-200' : 'text-ink-100/60'
                      )}
                      aria-label={plan.favorite ? 'Unfavorite plan' : 'Favorite plan'}
                    >
                      <Star className={plan.favorite ? 'fill-current' : ''} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadPlan(plan)}
                    >
                      Load
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => onDeletePlan(plan.id)}
                      className="h-9 w-9 rounded-full text-ink-100/60"
                      aria-label="Delete plan"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Toast open={toastOpen} onOpenChange={setToastOpen}>
        <div className="grid gap-1">
          <ToastTitle>{toastDetails?.title ?? 'Plan saved'}</ToastTitle>
          <ToastDescription>{toastDetails?.description ?? ''}</ToastDescription>
        </div>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  )
}
