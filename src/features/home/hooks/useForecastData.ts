import { useEffect } from 'react'

import type { LoadStatus } from '@/features/home/types'
import type { LocationResult } from '@/lib/weather'
import { fetchForecast } from '@/lib/weather'

type UseForecastDataArgs = {
  location: LocationResult | null
  setStatus: (status: LoadStatus) => void
  setForecast: (forecast: WeatherData | null) => void
  setErrorMessage: (message: string) => void
}

export function useForecastData({
  location,
  setStatus,
  setForecast,
  setErrorMessage,
}: UseForecastDataArgs) {
  useEffect(() => {
    if (!location) return
    const loadForecast = async () => {
      try {
        setStatus('loading')
        setForecast(null)
        const data = await fetchForecast(location.latitude, location.longitude)
        setForecast(data)
        setErrorMessage('')
        setStatus('idle')
      } catch (error) {
        setStatus('error')
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load forecast')
      }
    }
    loadForecast()
  }, [location, setErrorMessage, setForecast, setStatus])
}
