import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

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
    location,
    sport,
    selectedTime,
    checkedPackItems,
    checkedWearItems,
    customPackItems,
    removedPackItems,
    removedWearItems,
    addedWearItems,
    setLocation,
    setSport,
    setSelectedTime,
    setCheckedPackItems,
    setCheckedWearItems,
    setCustomPackItems,
    setRemovedPackItems,
    setRemovedWearItems,
    setAddedWearItems,
    activePlanId,
    setActivePlanId,
  } = useHomeStore()
  const { plans, savePlan, deletePlan, toggleFavorite } = useSavedPlans()

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
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-ink-200/10 bg-ink-950/30 px-6 py-5">
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-ink-50">
                  Saved plans
                </p>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-100/70">
                  Keep your favorites
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/">
                    <ArrowLeft />
                    Back to forecast
                  </Link>
                </Button>
                <SidebarTrigger className="md:hidden" />
              </div>
            </header>

            <main className="flex w-full flex-col gap-10">
              <SavedPlansPanel
                currentPlan={{
                  location,
                  sport,
                  selectedTime,
                  checkedPackItems,
                  checkedWearItems,
                  customPackItems,
                  removedPackItems,
                  removedWearItems,
                  addedWearItems,
                }}
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
                  setActivePlanId(plan.id)
                  const params = new URLSearchParams()
                  params.set('lat', plan.location.latitude.toFixed(5))
                  params.set('lon', plan.location.longitude.toFixed(5))
                  params.set('name', plan.location.name)
                  if (plan.location.elevation !== undefined) {
                    params.set('elev', plan.location.elevation.toFixed(0))
                  }
                  params.set('time', plan.selectedTime)
                  navigate(`/${plan.sport}?${params.toString()}`)
                }}
                onSavePlan={(input) => {
                  const saved = savePlan(input)
                  setActivePlanId(saved.id)
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
