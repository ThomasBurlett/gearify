import { useEffect, useRef } from 'react'
import { getCurrentPositionWithFallback, getGeolocationDetails } from '@/lib/geolocation'
import type { LocationResult } from '@/lib/weather'
import type { HomeSearchParams } from '@/features/home/types'
import { fetchIpLocation, fetchReverseGeocodingWithFallback } from '@/lib/weather'

type UseInitialLocationArgs = {
  search: HomeSearchParams
  defaultLocation: LocationResult
  setLocation: (location: LocationResult | null) => void
  setGeoMessage: (message: string) => void
}

export function useInitialLocation({
  search,
  defaultLocation,
  setLocation,
  setGeoMessage,
}: UseInitialLocationArgs) {
  const requestedGeo = useRef(false)

  useEffect(() => {
    const lat = search.lat
    const lon = search.lon
    const name = search.name
    const elev = search.elev
    const parsedLat = lat ? Number(lat) : null
    const parsedLon = lon ? Number(lon) : null
    const parsedElevation = elev ? Number(elev) : null

    if (
      parsedLat !== null &&
      parsedLon !== null &&
      Number.isFinite(parsedLat) &&
      Number.isFinite(parsedLon)
    ) {
      const nextLocation: LocationResult = {
        name: name ?? 'Selected location',
        latitude: parsedLat,
        longitude: parsedLon,
      }
      if (parsedElevation !== null && Number.isFinite(parsedElevation)) {
        nextLocation.elevation = parsedElevation
      }
      setLocation(nextLocation)
      return
    }

    if (requestedGeo.current) return
    requestedGeo.current = true

    const resolveLocation = async () => {
      try {
        const position = await getCurrentPositionWithFallback()
        try {
          const resolved = await fetchReverseGeocodingWithFallback(
            position.coords.latitude,
            position.coords.longitude
          )
          setLocation(resolved)
          setGeoMessage('')
          return
        } catch {
          setLocation({
            name: 'Current location',
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setGeoMessage('Using device coordinates. Nearby place name unavailable.')
          return
        }
      } catch (error) {
        const { code, message } = getGeolocationDetails(error)
        try {
          const ipLocation = await fetchIpLocation()
          setLocation(ipLocation)
          const codeLabel = code === null ? '' : ` (${code})`
          setGeoMessage(`Location error${codeLabel}: ${message}. Estimating location.`)
          return
        } catch {
          // Ignore IP fallback errors.
        }

        setLocation(defaultLocation)
        const codeLabel = code === null ? '' : ` (${code})`
        const contextHint =
          typeof window !== 'undefined' && window.isSecureContext ? '' : ' (Not a secure context)'
        setGeoMessage(`Location error${codeLabel}: ${message}${contextHint}`)
      }
    }

    void resolveLocation()
  }, [search, defaultLocation, setGeoMessage, setLocation])
}
