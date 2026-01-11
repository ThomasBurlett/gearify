import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { HomeSidebar } from '@/features/home/components/HomeSidebar'
import { SavedPlansPanel } from '@/features/home/components/SavedPlansPanel'
import { useSavedPlans } from '@/features/home/hooks/useSavedPlans'
import { useHomeStore } from '@/features/home/store/useHomeStore'
import type { SavedPlan } from '@/features/home/hooks/useSavedPlans'

export default function PlansPage() {
  const navigate = useNavigate()
  const {
    setLocation,
    setSport,
    setSelectedTime,
    setCheckedPackItems,
    setCheckedWearItems,
    setCustomPackItems,
    setRemovedPackItems,
    setRemovedWearItems,
    setAddedWearItems,
    setGearMappings,
    activePlanId,
    setActivePlanId,
  } = useHomeStore()
  const { plans, deletePlan, toggleFavorite } = useSavedPlans()

  const handleShare = async () => {
    if (typeof window === 'undefined') return false
    try {
      await navigator.clipboard.writeText(window.location.href)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="grain" />
      <SidebarProvider defaultOpen>
        <HomeSidebar onShare={handleShare} />
        <SidebarInset className="bg-transparent">
          <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 pb-24 pt-8">
            <header className="relative overflow-hidden rounded-3xl border border-slate-700/40 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-900/80 px-8 py-7 shadow-2xl shadow-black/30 backdrop-blur-md">
              {/* Decorative accent */}
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle at top right, rgba(99,102,241,0.1), transparent 70%)',
                }}
              />

              <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h1 className="font-display text-3xl font-bold tracking-tight text-white">
                      Saved Plans
                    </h1>
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300/60">
                      Library
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    Browse and manage your gear combinations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/50"
                    render={<Link to="/" />}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to forecast
                  </Button>
                  <SidebarTrigger
                    className="md:hidden rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 shadow-lg shadow-indigo-500/20 hover:bg-indigo-500/25 hover:text-white"
                    variant="outline"
                    label="Plans & Gear"
                  />
                </div>
              </div>
            </header>

            <main className="flex w-full flex-col gap-10">
              <SavedPlansPanel
                plans={plans}
                activePlanId={activePlanId}
                onPlanLoad={(plan: SavedPlan) => {
                  setSport(plan.sport)
                  setLocation(plan.location)
                  setSelectedTime(plan.selectedTime)
                  setCheckedPackItems(plan.checkedPackItems ?? [])
                  setCheckedWearItems(plan.checkedWearItems ?? [])
                  setCustomPackItems(plan.customPackItems ?? [])
                  setRemovedPackItems(plan.removedPackItems ?? [])
                  setRemovedWearItems(plan.removedWearItems ?? [])
                  setAddedWearItems(plan.addedWearItems ?? [])
                  setGearMappings(plan.gearMappings ?? {})
                  setActivePlanId(plan.id)
                  navigate({
                    to: '/$sport',
                    params: { sport: plan.sport },
                    search: {
                      lat: plan.location.latitude.toFixed(5),
                      lon: plan.location.longitude.toFixed(5),
                      name: plan.location.name,
                      elev:
                        plan.location.elevation !== undefined
                          ? plan.location.elevation.toFixed(0)
                          : undefined,
                      time: plan.selectedTime,
                    },
                  })
                }}
                onToggleFavorite={toggleFavorite}
                onDeletePlan={deletePlan}
              />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
