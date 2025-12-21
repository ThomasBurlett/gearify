export type SportType = 'running' | 'skiing'

export type LocationResult = {
  name: string
  latitude: number
  longitude: number
  elevation?: number
  admin1?: string
  country?: string
  timezone?: string
}

export type WeatherSeries = {
  time: string[]
  temperature_2m: number[]
  apparent_temperature: number[]
  relative_humidity_2m: number[]
  dew_point_2m: number[]
  precipitation_probability: number[]
  precipitation: number[]
  pressure_msl: number[]
  cloud_cover: number[]
  visibility: number[]
  wind_speed_10m: number[]
  wind_gusts_10m: number[]
  weather_code: number[]
}

export type WeatherData = {
  timezone: string
  elevation: number
  hourly: WeatherSeries
  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    weather_code: number
  }
}

type GeocodeResponse = {
  results?: Array<{
    name: string
    latitude: number
    longitude: number
    elevation?: number
    admin1?: string
    country?: string
    timezone?: string
  }>
}

type NominatimResponse = {
  display_name?: string
  lat?: string
  lon?: string
  address?: {
    city?: string
    town?: string
    village?: string
    hamlet?: string
    municipality?: string
    county?: string
    state?: string
    region?: string
    country?: string
  }
}

type NominatimSearchResult = {
  display_name?: string
  lat?: string
  lon?: string
  address?: NominatimResponse['address']
}

const WEATHER_CODE_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Heavy freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Rain showers',
  81: 'Heavy rain showers',
  82: 'Violent rain showers',
  85: 'Snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with hail',
  99: 'Thunderstorm with hail',
}

export function getWeatherLabel(code: number) {
  return WEATHER_CODE_LABELS[code] ?? 'Unknown'
}

export function formatLocationName(location: LocationResult) {
  const region = location.admin1 ?? location.country ?? ''
  return region ? `${location.name}, ${region}` : location.name
}

const AREA_CODE_PATTERN = /^\d{3,6}$/

function isAreaCodeQuery(query: string) {
  return AREA_CODE_PATTERN.test(query.trim())
}

async function fetchOpenMeteoGeocoding(query: string) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search')
  url.searchParams.set('name', query)
  url.searchParams.set('count', '6')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to search locations')
  }
  const data = (await response.json()) as GeocodeResponse
  return (data.results ?? []).map((result) => ({
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    elevation: result.elevation,
    admin1: result.admin1,
    country: result.country,
    timezone: result.timezone,
  }))
}

async function fetchAreaCodeGeocoding(query: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('postalcode', query)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Unable to search locations')
  }
  const data = (await response.json()) as NominatimSearchResult[]
  return data
    .map((result) => {
      const name = pickNominatimName(result.address) ?? result.display_name
      const admin1 = result.address?.state ?? result.address?.region
      const country = result.address?.country
      const latitude = result.lat ? Number(result.lat) : NaN
      const longitude = result.lon ? Number(result.lon) : NaN
      if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return null
      }
      return {
        name,
        latitude,
        longitude,
        admin1,
        country,
      }
    })
    .filter((result): result is LocationResult => Boolean(result))
}

async function fetchNominatimGeocoding(query: string) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('q', query)
  url.searchParams.set('addressdetails', '1')
  url.searchParams.set('limit', '6')

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error('Unable to search locations')
  }
  const data = (await response.json()) as NominatimSearchResult[]
  return data
    .map((result) => {
      const name = pickNominatimName(result.address) ?? result.display_name
      const admin1 = result.address?.state ?? result.address?.region
      const country = result.address?.country
      const latitude = result.lat ? Number(result.lat) : NaN
      const longitude = result.lon ? Number(result.lon) : NaN
      if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
        return null
      }
      return {
        name,
        latitude,
        longitude,
        admin1,
        country,
      }
    })
    .filter((result): result is LocationResult => Boolean(result))
}

export async function fetchGeocoding(query: string) {
  if (isAreaCodeQuery(query)) {
    try {
      return await fetchAreaCodeGeocoding(query)
    } catch {
      return []
    }
  }

  const [openMeteoResult, nominatimResult] = await Promise.allSettled([
    fetchOpenMeteoGeocoding(query),
    fetchNominatimGeocoding(query),
  ])

  const openMeteoResults = openMeteoResult.status === 'fulfilled' ? openMeteoResult.value : []
  const nominatimResults = nominatimResult.status === 'fulfilled' ? nominatimResult.value : []

  const seen = new Set<string>()
  const merged: LocationResult[] = []
  const pushUnique = (result: LocationResult) => {
    const key = `${result.latitude.toFixed(5)},${result.longitude.toFixed(5)}:${result.name}`
    if (seen.has(key)) return
    seen.add(key)
    merged.push(result)
  }

  openMeteoResults.forEach(pushUnique)
  nominatimResults.forEach(pushUnique)

  return merged
}

export async function fetchReverseGeocoding(latitude: number, longitude: number) {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse')
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set('count', '1')
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to resolve current location')
  }
  const data = (await response.json()) as GeocodeResponse
  const result = data.results?.[0]
  if (!result) {
    throw new Error('No nearby location found')
  }
  return {
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    elevation: result.elevation,
    admin1: result.admin1,
    country: result.country,
    timezone: result.timezone,
  }
}

function pickNominatimName(address?: NominatimResponse['address']) {
  if (!address) return null
  return (
    address.city ??
    address.town ??
    address.village ??
    address.hamlet ??
    address.municipality ??
    address.county ??
    null
  )
}

export async function fetchReverseGeocodingWithFallback(
  latitude: number,
  longitude: number
): Promise<LocationResult> {
  try {
    return await fetchReverseGeocoding(latitude, longitude)
  } catch {
    const url = new URL('https://nominatim.openstreetmap.org/reverse')
    url.searchParams.set('format', 'jsonv2')
    url.searchParams.set('lat', latitude.toString())
    url.searchParams.set('lon', longitude.toString())
    url.searchParams.set('zoom', '10')
    url.searchParams.set('addressdetails', '1')

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error('Unable to resolve current location')
    }
    const data = (await response.json()) as NominatimResponse
    const name = pickNominatimName(data.address) ?? data.display_name
    const admin1 = data.address?.state ?? data.address?.region
    const country = data.address?.country
    const parsedLat = data.lat ? Number(data.lat) : latitude
    const parsedLon = data.lon ? Number(data.lon) : longitude
    if (!name || Number.isNaN(parsedLat) || Number.isNaN(parsedLon)) {
      throw new Error('No nearby location found')
    }
    return {
      name,
      latitude: parsedLat,
      longitude: parsedLon,
      admin1,
      country,
    }
  }
}

export async function fetchIpLocation() {
  const response = await fetch('https://ipapi.co/json/')
  if (!response.ok) {
    throw new Error('Unable to resolve IP location')
  }
  const data = (await response.json()) as {
    city?: string
    region?: string
    country_name?: string
    latitude?: number
    longitude?: number
  }
  if (
    data.latitude === undefined ||
    data.longitude === undefined ||
    Number.isNaN(Number(data.latitude)) ||
    Number.isNaN(Number(data.longitude))
  ) {
    throw new Error('Invalid IP location response')
  }
  return {
    name: data.city ?? 'IP location',
    admin1: data.region,
    country: data.country_name,
    latitude: Number(data.latitude),
    longitude: Number(data.longitude),
  }
}

export async function fetchForecast(latitude: number, longitude: number) {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set(
    'hourly',
    [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'dew_point_2m',
      'precipitation_probability',
      'precipitation',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_gusts_10m',
      'weather_code',
    ].join(',')
  )
  url.searchParams.set('current', 'temperature_2m,apparent_temperature,weather_code')
  url.searchParams.set('temperature_unit', 'fahrenheit')
  url.searchParams.set('wind_speed_unit', 'mph')
  url.searchParams.set('precipitation_unit', 'inch')
  url.searchParams.set('timezone', 'auto')

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Unable to load forecast data')
  }

  return (await response.json()) as WeatherData
}

export function findHourIndex(hourly: WeatherSeries, targetTime: string) {
  return hourly.time.findIndex((time) => time === targetTime)
}

export function findClosestHourIndex(hourly: WeatherSeries, targetTime: string) {
  const exact = findHourIndex(hourly, targetTime)
  if (exact !== -1) return exact
  const target = new Date(targetTime).getTime()
  let closest = -1
  let smallest = Number.POSITIVE_INFINITY
  hourly.time.forEach((time, index) => {
    const diff = Math.abs(new Date(time).getTime() - target)
    if (diff < smallest) {
      smallest = diff
      closest = index
    }
  })
  return closest
}

export function computeHeatIndex(tempF: number, humidity: number) {
  if (tempF < 80 || humidity < 40) {
    return null
  }
  const t = tempF
  const r = humidity
  const index =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r
  return Math.round(index)
}

export function computeWindChill(tempF: number, windMph: number) {
  if (tempF > 50 || windMph <= 3) {
    return null
  }
  const chill =
    35.74 +
    0.6215 * tempF -
    35.75 * Math.pow(windMph, 0.16) +
    0.4275 * tempF * Math.pow(windMph, 0.16)
  return Math.round(chill)
}
