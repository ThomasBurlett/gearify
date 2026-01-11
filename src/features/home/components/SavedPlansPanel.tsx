import { Star, Trash2, MapPin, Clock } from 'lucide-react'
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
  onPlanLoad: (plan: SavedPlan) => void
  onToggleFavorite: (id: string) => void
  onDeletePlan: (id: string) => void
  onClose?: () => void
}

const SPORT_LABELS: Record<SportType, string> = {
  running: '🏃 Running',
  skiing: '⛷️ Skiing',
}

const SPORT_EMOJI: Record<SportType, string> = {
  running: '🏃',
  skiing: '⛷️',
}

function formatTimeLabel(value: string) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value

  const now = new Date()
  const diffMs = parsed.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0)
    return `Today at ${parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1)
    return `Tomorrow at ${parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`

  return parsed.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SavedPlansPanel({
  plans,
  activePlanId,
  showFullPageLink: showFullPageLinkProp,
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

  const favoritePlans = useMemo(() => {
    return orderedPlans.filter((plan) => plan.favorite)
  }, [orderedPlans])

  const otherPlans = useMemo(() => {
    return orderedPlans.filter((plan) => !plan.favorite)
  }, [orderedPlans])

  const handleLoadPlan = (plan: SavedPlan) => {
    onPlanLoad(plan)
    onClose?.()
  }

  if (plans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 px-6 py-16 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-amber-500/20 to-indigo-500/20 p-6 backdrop-blur-sm">
            <span className="text-5xl">🏃</span>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-slate-100 mb-2">No saved plans yet</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-8">
          Start by creating a plan from the forecast. Save gear combinations for your favorite
          activities and locations.
        </p>
        <Button
          nativeButton={false}
          render={<Link to="/" />}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Create your first plan
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {showFullPageLink && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" nativeButton={false} render={<Link to="/plans" />}>
            Open full page
          </Button>
        </div>
      )}

      {/* Favorites Section */}
      {favoritePlans.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-1">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <h2 className="text-lg font-semibold text-slate-100">Favorites</h2>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-full">
              {favoritePlans.length}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {favoritePlans.map((plan, idx) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isActive={activePlanId === plan.id}
                onLoad={() => handleLoadPlan(plan)}
                onToggleFavorite={() => onToggleFavorite(plan.id)}
                onDelete={() => setPendingDelete(plan)}
                isFavorite
                style={{
                  animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Plans Section */}
      {(otherPlans.length > 0 || favoritePlans.length > 0) && (
        <div className="space-y-4">
          {otherPlans.length > 0 && (
            <>
              <div className="flex items-center gap-3 px-1">
                <h2 className="text-lg font-semibold text-slate-100">All Plans</h2>
                <span className="text-xs font-medium text-slate-500 bg-slate-700/50 px-2.5 py-1 rounded-full">
                  {otherPlans.length}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {otherPlans.map((plan, idx) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isActive={activePlanId === plan.id}
                    onLoad={() => handleLoadPlan(plan)}
                    onToggleFavorite={() => onToggleFavorite(plan.id)}
                    onDelete={() => setPendingDelete(plan)}
                    style={{
                      animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both`,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {favoritePlans.length > 0 && otherPlans.length === 0 && (
            <div className="text-center py-12 px-6 rounded-2xl bg-gradient-to-br from-slate-800/30 to-slate-900/30 border border-slate-700/30">
              <Star className="w-8 h-8 text-amber-400 mx-auto mb-3 opacity-50 fill-amber-400" />
              <p className="text-sm text-slate-400">All your plans are favorited</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete saved plan?</DialogTitle>
            <DialogDescription>
              This removes {pendingDelete?.name || 'this plan'} from your saved plans. This action
              cannot be undone.
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

interface PlanCardProps {
  plan: SavedPlan
  isActive: boolean
  isFavorite?: boolean
  onLoad: () => void
  onToggleFavorite: () => void
  onDelete: () => void
  style?: React.CSSProperties
}

function PlanCard({
  plan,
  isActive,
  isFavorite,
  onLoad,
  onToggleFavorite,
  onDelete,
  style,
}: PlanCardProps) {
  return (
    <div
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10',
        isActive
          ? 'border-indigo-400/50 bg-gradient-to-br from-indigo-500/15 via-slate-800/40 to-slate-900/50 shadow-lg shadow-indigo-500/20'
          : isFavorite
            ? 'border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-slate-800/40 to-slate-900/50 hover:border-amber-400/50'
            : 'border-slate-700/40 bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/40 hover:border-slate-600/60'
      )}
    >
      {/* Accent glow on hover */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none',
          isActive ? 'bg-radial-indigo' : isFavorite ? 'bg-radial-amber' : 'bg-radial-slate'
        )}
        style={{
          background: isActive
            ? 'radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 50%)'
            : isFavorite
              ? 'radial-gradient(circle at top right, rgba(251,191,36,0.08), transparent 50%)'
              : 'radial-gradient(circle at top right, rgba(51,65,85,0.05), transparent 50%)',
        }}
      />

      <div className="relative z-10 flex flex-col h-full p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-shrink-0 text-xl leading-none">{SPORT_EMOJI[plan.sport]}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-100 truncate text-sm leading-snug">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">{SPORT_LABELS[plan.sport]}</p>
              </div>
            </div>
          </div>

          {isActive && (
            <span className="flex-shrink-0 ml-2 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 rounded-lg whitespace-nowrap">
              Active
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 space-y-2.5 mb-4">
          <div className="flex items-center gap-2.5 text-sm">
            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-300 truncate">{formatLocationName(plan.location)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="text-slate-300">{formatTimeLabel(plan.selectedTime)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-700/40">
          <button
            onClick={onToggleFavorite}
            className={cn(
              'p-2.5 rounded-lg transition-all duration-200',
              plan.favorite
                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-700/30 text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
            )}
            aria-label={plan.favorite ? 'Unfavorite plan' : 'Favorite plan'}
            title={plan.favorite ? 'Remove from collection' : 'Add to collection'}
          >
            <Star className={cn('w-4 h-4', plan.favorite && 'fill-current')} />
          </button>

          <button
            onClick={onDelete}
            className="p-2.5 rounded-lg bg-slate-700/30 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-all duration-200"
            aria-label="Delete plan"
            title="Delete this plan"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onLoad}
            className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 active:scale-95"
          >
            Load
          </button>
        </div>
      </div>
    </div>
  )
}
