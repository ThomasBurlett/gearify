import { create } from 'zustand'

import type { LoadStatus } from '@/features/home/types'
import {
  DEFAULT_COMFORT_PROFILE,
  DEFAULT_WEAR_CONTEXT,
  type ComfortProfile,
  type ExertionLevel,
  type TripDuration,
} from '@/lib/gear'
import type { LocationResult, SportType, WeatherData } from '@/lib/weather'

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
}))
