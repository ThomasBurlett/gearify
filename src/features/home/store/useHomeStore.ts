import { create } from 'zustand'

import type { LoadStatus } from '@/features/home/types'
import type { GearMappings } from '@/features/inventory/types'
import {
  DEFAULT_COMFORT_PROFILE,
  DEFAULT_WEAR_CONTEXT,
  type ComfortProfile,
  type ExertionLevel,
  type TripDuration,
} from '@/lib/gear'
import type { LocationResult, SportType, WeatherData } from '@/lib/weather'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

type HomeState = {
  sport: SportType
  selectedTime: string
  location: LocationResult | null
  forecast: WeatherData | null
  status: LoadStatus
  errorMessage: string
  geoMessage: string
  comfortProfile: ComfortProfile
  exertion: ExertionLevel
  duration: TripDuration
  checkedPackItems: string[]
  checkedWearItems: string[]
  activePlanId: string | null
  customPackItems: string[]
  removedPackItems: string[]
  removedWearItems: string[]
  addedWearItems: string[]
  gearMappings: GearMappings
  saveStatus: SaveStatus
  lastSavedAt: number | null
  setSport: (sport: SportType) => void
  setSelectedTime: (value: string) => void
  setLocation: (location: LocationResult | null) => void
  setForecast: (forecast: WeatherData | null) => void
  setStatus: (status: LoadStatus) => void
  setErrorMessage: (message: string) => void
  setGeoMessage: (message: string) => void
  setComfortProfile: (profile: ComfortProfile) => void
  setExertion: (exertion: ExertionLevel) => void
  setDuration: (duration: TripDuration) => void
  setCheckedPackItems: (items: string[] | ((prev: string[]) => string[])) => void
  setCheckedWearItems: (items: string[] | ((prev: string[]) => string[])) => void
  setActivePlanId: (id: string | null) => void
  setCustomPackItems: (items: string[] | ((prev: string[]) => string[])) => void
  setRemovedPackItems: (items: string[] | ((prev: string[]) => string[])) => void
  setRemovedWearItems: (items: string[] | ((prev: string[]) => string[])) => void
  setAddedWearItems: (items: string[] | ((prev: string[]) => string[])) => void
  setGearMappings: (mappings: GearMappings | ((prev: GearMappings) => GearMappings)) => void
  setSaveStatus: (status: SaveStatus) => void
  setLastSavedAt: (timestamp: number | null) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  sport: 'running',
  selectedTime: '',
  location: null,
  forecast: null,
  status: 'idle',
  errorMessage: '',
  geoMessage: '',
  comfortProfile: DEFAULT_COMFORT_PROFILE,
  exertion: DEFAULT_WEAR_CONTEXT.exertion,
  duration: DEFAULT_WEAR_CONTEXT.duration,
  checkedPackItems: [],
  checkedWearItems: [],
  activePlanId: null,
  customPackItems: [],
  removedPackItems: [],
  removedWearItems: [],
  addedWearItems: [],
  gearMappings: {},
  saveStatus: 'idle',
  lastSavedAt: null,
  setSport: (sport) => set({ sport }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setLocation: (location) => set({ location }),
  setForecast: (forecast) => set({ forecast }),
  setStatus: (status) => set({ status }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setGeoMessage: (geoMessage) => set({ geoMessage }),
  setComfortProfile: (comfortProfile) => set({ comfortProfile }),
  setExertion: (exertion) => set({ exertion }),
  setDuration: (duration) => set({ duration }),
  setCheckedPackItems: (checkedPackItems) =>
    set((state) => ({
      checkedPackItems:
        typeof checkedPackItems === 'function'
          ? checkedPackItems(state.checkedPackItems)
          : checkedPackItems,
    })),
  setCheckedWearItems: (checkedWearItems) =>
    set((state) => ({
      checkedWearItems:
        typeof checkedWearItems === 'function'
          ? checkedWearItems(state.checkedWearItems)
          : checkedWearItems,
    })),
  setActivePlanId: (activePlanId) => set({ activePlanId }),
  setCustomPackItems: (customPackItems) =>
    set((state) => ({
      customPackItems:
        typeof customPackItems === 'function'
          ? customPackItems(state.customPackItems)
          : customPackItems,
    })),
  setRemovedPackItems: (removedPackItems) =>
    set((state) => ({
      removedPackItems:
        typeof removedPackItems === 'function'
          ? removedPackItems(state.removedPackItems)
          : removedPackItems,
    })),
  setRemovedWearItems: (removedWearItems) =>
    set((state) => ({
      removedWearItems:
        typeof removedWearItems === 'function'
          ? removedWearItems(state.removedWearItems)
          : removedWearItems,
    })),
  setAddedWearItems: (addedWearItems) =>
    set((state) => ({
      addedWearItems:
        typeof addedWearItems === 'function'
          ? addedWearItems(state.addedWearItems)
          : addedWearItems,
    })),
  setGearMappings: (gearMappings) =>
    set((state) => ({
      gearMappings:
        typeof gearMappings === 'function' ? gearMappings(state.gearMappings) : gearMappings,
    })),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
}))
