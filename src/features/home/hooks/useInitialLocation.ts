import { useEffect, useRef } from 'react'
import type { LocationResult } from '@/lib/weather'
import { fetchIpLocation, fetchReverseGeocoding } from '@/lib/weather'

type UseInitialLocationArgs = {
  searchParams: URLSearchParams
  defaultLocation: LocationResult
  setLocation: (location: LocationResult | null) => void
  setGeoMessage: (message: string) => void
}

export function useInitialLocation({
  searchParams,
  defaultLocation,
  setLocation,
  setGeoMessage,
}: UseInitialLocationArgs) {
  const requestedGeo = useRef(false)

  useEffect(() => {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')
    const name = searchParams.get('name')
    const parsedLat = lat ? Number(lat) : null
    const parsedLon = lon ? Number(lon) : null

    if (
      parsedLat !== null &&
      parsedLon !== null &&
      Number.isFinite(parsedLat) &&
      Number.isFinite(parsedLon)
    ) {
      setLocation({
        name: name ?? 'Selected location',
        latitude: parsedLat,
        longitude: parsedLon,
      })
      return
    }

    if (requestedGeo.current) return
    requestedGeo.current = true

    if (!navigator.geolocation) {
      setLocation(defaultLocation)
      setGeoMessage('Geolocation is not supported in this browser.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const resolved = await fetchReverseGeocoding(
            position.coords.latitude,
            position.coords.longitude
          )
          setLocation(resolved)
          setGeoMessage('')
        } catch {
          setLocation(defaultLocation)
          setGeoMessage('Unable to resolve your location. Using fallback.')
        }
      },
      async (error) => {
        try {
          const ipLocation = await fetchIpLocation()
          setLocation(ipLocation)
          setGeoMessage('Location could not be determined, estimating location.')
          return
        } catch {
          // Ignore IP fallback errors.
        }

        setLocation(defaultLocation)
        const contextHint = window.isSecureContext ? '' : ' (Not a secure context)'
        setGeoMessage(
          `Location error (${error.code}): ${error.message || 'Unknown error'}${contextHint}`
        )
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    )
  }, [searchParams, defaultLocation, setGeoMessage, setLocation])
}
