import { useEffect, useMemo, useState } from 'react'

import type { GearMappings } from '@/features/inventory/types'
import type { LocationResult, SportType } from '@/lib/weather'

export type SavedPlan = {
  id: string
  name: string
  createdAt: number
  favorite: boolean
  sport: SportType
  location: LocationResult
  selectedTime: string
  checkedPackItems: string[]
  checkedWearItems: string[]
  customPackItems: string[]
  removedPackItems: string[]
  removedWearItems: string[]
  addedWearItems: string[]
  gearMappings: GearMappings
}

const STORAGE_KEY = 'gearcast.savedPlans'

function normalizePlans(value: unknown): SavedPlan[] {
  if (!Array.isArray(value)) return []
  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const plan = entry as Partial<SavedPlan>
      if (!plan.id || !plan.name || !plan.location || !plan.selectedTime || !plan.sport) {
        return null
      }
      return {
        id: String(plan.id),
        name: String(plan.name),
        createdAt: Number(plan.createdAt ?? Date.now()),
        favorite: Boolean(plan.favorite ?? false),
        sport: plan.sport === 'skiing' ? 'skiing' : 'running',
        location: plan.location as LocationResult,
        selectedTime: String(plan.selectedTime),
        checkedPackItems: Array.isArray(plan.checkedPackItems)
          ? plan.checkedPackItems.map(String)
          : [],
        checkedWearItems: Array.isArray(plan.checkedWearItems)
          ? plan.checkedWearItems.map(String)
          : [],
        customPackItems: Array.isArray(plan.customPackItems)
          ? plan.customPackItems.map(String)
          : [],
        removedPackItems: Array.isArray(plan.removedPackItems)
          ? plan.removedPackItems.map(String)
          : [],
        removedWearItems: Array.isArray(plan.removedWearItems)
          ? plan.removedWearItems.map(String)
          : [],
        addedWearItems: Array.isArray(plan.addedWearItems) ? plan.addedWearItems.map(String) : [],
        gearMappings:
          plan.gearMappings && typeof plan.gearMappings === 'object'
            ? (plan.gearMappings as GearMappings)
            : {},
      } satisfies SavedPlan
    })
    .filter((plan): plan is SavedPlan => plan !== null)
}

function sortPlans(plans: SavedPlan[]) {
  return [...plans].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
    return b.createdAt - a.createdAt
  })
}

function buildDefaultName(location: LocationResult, selectedTime: string) {
  const time = selectedTime ? new Date(selectedTime).toLocaleDateString() : 'Plan'
  return `${location.name} - ${time}`
}

export function useSavedPlans() {
  const [plans, setPlans] = useState<SavedPlan[]>([])
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored)
      setPlans(sortPlans(normalizePlans(parsed)))
    } catch {
      setPlans([])
    } finally {
      setHasHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hasHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))
    } catch {
      // Ignore storage errors.
    }
  }, [hasHydrated, plans])

  const actions = useMemo(() => {
    const savePlan = (input: {
      name?: string
      location: LocationResult
      sport: SportType
      selectedTime: string
      checkedPackItems: string[]
      checkedWearItems: string[]
      customPackItems: string[]
      removedPackItems: string[]
      removedWearItems: string[]
      addedWearItems: string[]
      gearMappings: GearMappings
    }) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`
      const trimmed = input.name?.trim()
      const name = trimmed || buildDefaultName(input.location, input.selectedTime)
      const next: SavedPlan = {
        id,
        name,
        createdAt: Date.now(),
        favorite: false,
        sport: input.sport,
        location: input.location,
        selectedTime: input.selectedTime,
        checkedPackItems: input.checkedPackItems,
        checkedWearItems: input.checkedWearItems,
        customPackItems: input.customPackItems,
        removedPackItems: input.removedPackItems,
        removedWearItems: input.removedWearItems,
        addedWearItems: input.addedWearItems,
        gearMappings: input.gearMappings,
      }
      setPlans((prev) => sortPlans([next, ...prev]))
      return next
    }

    const deletePlan = (id: string) => {
      setPlans((prev) => prev.filter((plan) => plan.id !== id))
    }

    const toggleFavorite = (id: string) => {
      setPlans((prev) =>
        sortPlans(
          prev.map((plan) => (plan.id === id ? { ...plan, favorite: !plan.favorite } : plan))
        )
      )
    }

    const updatePlan = (id: string, updates: Partial<Omit<SavedPlan, 'id' | 'createdAt'>>) => {
      setPlans((prev) =>
        sortPlans(
          prev.map((plan) => {
            if (plan.id !== id) return plan
            const next: SavedPlan = {
              ...plan,
              ...updates,
              name: updates.name?.trim() || plan.name,
            }
            const same =
              next.name === plan.name &&
              next.favorite === plan.favorite &&
              next.sport === plan.sport &&
              next.selectedTime === plan.selectedTime &&
              next.location.latitude === plan.location.latitude &&
              next.location.longitude === plan.location.longitude &&
              next.location.name === plan.location.name &&
              next.location.admin1 === plan.location.admin1 &&
              next.location.country === plan.location.country &&
              next.location.elevation === plan.location.elevation &&
              JSON.stringify(next.checkedPackItems) === JSON.stringify(plan.checkedPackItems) &&
              JSON.stringify(next.checkedWearItems) === JSON.stringify(plan.checkedWearItems) &&
              JSON.stringify(next.customPackItems) === JSON.stringify(plan.customPackItems) &&
              JSON.stringify(next.removedPackItems) === JSON.stringify(plan.removedPackItems) &&
              JSON.stringify(next.removedWearItems) === JSON.stringify(plan.removedWearItems) &&
              JSON.stringify(next.addedWearItems) === JSON.stringify(plan.addedWearItems) &&
              JSON.stringify(next.gearMappings) === JSON.stringify(plan.gearMappings)
            return same ? plan : next
          })
        )
      )
    }

    const renamePlan = (id: string, name: string) => {
      const trimmed = name.trim()
      if (!trimmed) return
      setPlans((prev) =>
        sortPlans(prev.map((plan) => (plan.id === id ? { ...plan, name: trimmed } : plan)))
      )
    }

    return { savePlan, deletePlan, toggleFavorite, renamePlan, updatePlan }
  }, [])

  return { plans, ...actions }
}
