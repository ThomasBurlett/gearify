type GeolocationDetails = {
  code: number | null
  message: string
}

const GEOLOCATION_PRIMARY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15000,
  maximumAge: 60000,
}

const GEOLOCATION_FALLBACK_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 15000,
  maximumAge: 60000,
}

export function getGeolocationDetails(error: unknown): GeolocationDetails {
  const rawCode =
    typeof error === 'object' && error !== null && 'code' in error
      ? Number((error as { code?: number }).code)
      : null
  const code = Number.isFinite(rawCode) ? rawCode : null
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: string }).message || 'Unknown error')
      : error instanceof Error
        ? error.message || 'Unknown error'
        : typeof error === 'string'
          ? error
          : 'Unknown error'
  return { code, message }
}

export function getCurrentPositionWithFallback(): Promise<GeolocationPosition> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new Error('Geolocation is not supported in this browser.'))
  }
  if (typeof window !== 'undefined' && !window.isSecureContext) {
    return Promise.reject(new Error('Geolocation requires a secure context (HTTPS).'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_FALLBACK_OPTIONS)
          return
        }
        reject(error)
      },
      GEOLOCATION_PRIMARY_OPTIONS
    )
  })
}
