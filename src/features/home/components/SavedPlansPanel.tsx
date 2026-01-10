import { Star, Trash2 } from 'lucide-react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatLocationName } from '@/lib/weather'
import type { SportType } from '@/lib/weather'
import { cn } from '@/lib/utils'
import type { SavedPlan } from '@/features/home/hooks/useSavedPlans'

type SavedPlansPanelProps = {
  plans: SavedPlan[]
  activePlanId?: string | null
  showFullPageLink?: boolean
  layout?: 'stacked' | 'split'
  onPlanLoad: (plan: SavedPlan) => void
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
  plans,
  activePlanId,
  showFullPageLink: showFullPageLinkProp,
  layout = 'stacked',
  onPlanLoad,
  onToggleFavorite,
  onDeletePlan,
  onClose,
}: SavedPlansPanelProps) {
  const routeLocation = useRouterState({ select: (state) => state.location })
  const showFullPageLink = showFullPageLinkProp ?? routeLocation.pathname !== '/plans'
  const [pendingDelete, setPendingDelete] = useState<SavedPlan | null>(null)
  const orderedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      if (a.favorite === b.favorite) return 0
      return a.favorite ? -1 : 1
    })
  }, [plans])

  const handleLoadPlan = (plan: SavedPlan) => {
    onPlanLoad(plan)
    onClose?.()
  }

  return (
    <div className={layout === 'split' ? 'grid gap-6 lg:grid-cols-[1fr_1.2fr]' : 'space-y-6'}>
      {showFullPageLink && (
        <div className={layout === 'split' ? 'lg:col-span-2 flex justify-end' : 'flex justify-end'}>
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/plans" />}>
            Open full page
          </Button>
        </div>
      )}
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-5">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Saved plans</p>
        {orderedPlans.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No saved plans yet.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {orderedPlans.map((plan) => (
              <div
                key={plan.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-700/50 bg-slate-800/80 px-4 py-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm text-slate-100">{plan.name}</p>
                    {activePlanId === plan.id && (
                      <span className="rounded-lg border border-indigo-400/50 bg-indigo-500/20 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-indigo-200">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
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
                      'h-9 w-9 rounded-lg',
                      plan.favorite ? 'text-amber-300' : 'text-slate-400'
                    )}
                    aria-label={plan.favorite ? 'Unfavorite plan' : 'Favorite plan'}
                  >
                    <Star className={plan.favorite ? 'fill-current' : ''} />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => handleLoadPlan(plan)}
                  >
                    Load
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPendingDelete(plan)}
                    className="h-9 w-9 rounded-lg text-slate-400"
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
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete saved plan?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.name || 'this plan'} from your saved plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!pendingDelete) return
                onDeletePlan(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
