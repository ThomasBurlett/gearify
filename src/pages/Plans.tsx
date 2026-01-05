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
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-ink-200/10 bg-ink-950/30 px-6 py-5">
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-ink-50">
                  Saved plans
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-100/70">
                  Keep your favorites
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-lg" render={<Link to="/" />}>
                  <ArrowLeft />
                  Back to forecast
                </Button>
                <SidebarTrigger
                  className="md:hidden rounded-full border border-tide-300/40 bg-tide-500/15 text-tide-50 shadow-glow hover:bg-tide-500/25 hover:text-white"
                  variant="outline"
                  label="Plans & Gear"
                />
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
