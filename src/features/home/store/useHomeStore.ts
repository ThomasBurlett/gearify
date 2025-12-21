import { create } from 'zustand'

import type { LoadStatus } from '@/features/home/types'
import type { LocationResult, SportType, WeatherData } from '@/lib/weather'

type HomeState = {
  sport: SportType
  selectedTime: string
  location: LocationResult | null
  forecast: WeatherData | null
  status: LoadStatus
  errorMessage: string
  geoMessage: string
  setSport: (sport: SportType) => void
  setSelectedTime: (value: string) => void
  setLocation: (location: LocationResult | null) => void
  setForecast: (forecast: WeatherData | null) => void
  setStatus: (status: LoadStatus) => void
  setErrorMessage: (message: string) => void
  setGeoMessage: (message: string) => void
}

export const useHomeStore = create<HomeState>((set) => ({
  sport: 'running',
  selectedTime: '',
  location: null,
  forecast: null,
  status: 'idle',
  errorMessage: '',
  geoMessage: '',
  setSport: (sport) => set({ sport }),
  setSelectedTime: (selectedTime) => set({ selectedTime }),
  setLocation: (location) => set({ location }),
  setForecast: (forecast) => set({ forecast }),
  setStatus: (status) => set({ status }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  setGeoMessage: (geoMessage) => set({ geoMessage }),
}))
