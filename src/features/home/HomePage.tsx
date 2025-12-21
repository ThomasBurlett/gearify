import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import { getGearSuggestions } from '@/lib/gear'
import { toLocalHourInput, setHourForDate } from '@/lib/time'
import { getCurrentPositionWithFallback, getGeolocationDetails } from '@/lib/geolocation'
import {
  computeHeatIndex,
  computeWindChill,
  fetchIpLocation,
  fetchReverseGeocodingWithFallback,
  findClosestHourIndex,
  formatLocationName,
  getWeatherLabel,
  type LocationResult,
  type SportType,
} from '@/lib/weather'
import { ForecastSetupCard } from '@/features/home/components/ForecastSetupCard'
import { ForecastSummaryCard } from '@/features/home/components/ForecastSummaryCard'
import { HomeHeader } from '@/features/home/components/HomeHeader'
import { PackListCard } from '@/features/home/components/PackListCard'
import { WearGuideCard } from '@/features/home/components/WearGuideCard'
import type { SelectedHour } from '@/features/home/types'
import { useForecastData } from '@/features/home/hooks/useForecastData'
import { useInitialLocation } from '@/features/home/hooks/useInitialLocation'
import { useLocationSearch } from '@/features/home/hooks/useLocationSearch'
import { useHomeStore } from '@/features/home/store/useHomeStore'

const DEFAULT_LOCATION: LocationResult = {
  name: 'Sandy',
  admin1: 'Utah',
  country: 'United States',
  latitude: 40.56498,
  longitude: -111.83897,
}

const PRESET_HOURS = [
  { label: 'Morning', hour: 8 },
  { label: 'Afternoon', hour: 14 },
  { label: 'Evening', hour: 19 },
]

function parseSport(value?: string): SportType {
  return value === 'skiing' ? 'skiing' : 'running'
}

export default function HomePage() {
  const { sport: sportParam } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const {
    sport,
    setSport,
    selectedTime,
    setSelectedTime,
    location,
    setLocation,
    forecast,
    setForecast,
    status,
    setStatus,
    errorMessage,
    setErrorMessage,
    geoMessage,
    setGeoMessage,
  } = useHomeStore()
  const [isLocating, setIsLocating] = useState(false)
  const lastUrlTime = useRef<string | null | undefined>(undefined)

  useInitialLocation({
    searchParams,
    defaultLocation: DEFAULT_LOCATION,
    setLocation,
    setGeoMessage,
  })
  useForecastData({
    location,
    setStatus,
    setForecast,
    setErrorMessage,
  })
  const {
    searchQuery,
    searchResults,
    selectedResultIndex,
    isSearchOpen,
    searchStatus,
    searchError,
    hasSearched,
    setIsSearchOpen,
    setSelectedResultIndex,
    resetSearchState,
    handleQueryChange,
    handleSearchFocus,
    setSearchQuery,
    searchDirty,
    recentLocations,
    pushRecentLocation,
  } = useLocationSearch({ location, formatLocationName })

  useEffect(() => {
    const fromUrl = searchParams.get('time')
    if (fromUrl === lastUrlTime.current) {
      return
    }
    lastUrlTime.current = fromUrl
    if (fromUrl) {
      setSelectedTime(fromUrl)
      return
    }
    if (!selectedTime) {
      setSelectedTime(toLocalHourInput(new Date()))
    }
  }, [searchParams, selectedTime, setSelectedTime])

  useEffect(() => {
    const nextSport = parseSport(sportParam)
    setSport(nextSport)
  }, [sportParam, setSport])

  useEffect(() => {
    if (!location) return
    const params = new URLSearchParams()
    params.set('lat', location.latitude.toFixed(5))
    params.set('lon', location.longitude.toFixed(5))
    params.set('name', formatLocationName(location))
    if (location.elevation !== undefined) {
      params.set('elev', location.elevation.toFixed(0))
    }
    params.set('time', selectedTime)
    navigate({ pathname: `/${sport}`, search: params.toString() }, { replace: true })
  }, [location, selectedTime, sport, navigate])

  const selectedHour: SelectedHour | null = useMemo(() => {
    if (!forecast) return null
    const index = findClosestHourIndex(forecast.hourly, selectedTime)
    if (index === -1) return null
    return {
      temperature: forecast.hourly.temperature_2m[index],
      feelsLike: forecast.hourly.apparent_temperature[index],
      humidity: forecast.hourly.relative_humidity_2m[index],
      dewPoint: forecast.hourly.dew_point_2m[index],
      windSpeed: forecast.hourly.wind_speed_10m[index],
      windGusts: forecast.hourly.wind_gusts_10m[index],
      precipitationChance: forecast.hourly.precipitation_probability[index],
      precipitation: forecast.hourly.precipitation[index],
      pressure: forecast.hourly.pressure_msl[index],
      cloudCover: forecast.hourly.cloud_cover[index],
      visibility: forecast.hourly.visibility[index],
      conditionCode: forecast.hourly.weather_code[index],
    }
  }, [forecast, selectedTime])

  const conditionLabel = selectedHour ? getWeatherLabel(selectedHour.conditionCode) : 'Loading'
  const heatIndex = selectedHour
    ? computeHeatIndex(selectedHour.temperature, selectedHour.humidity)
    : null
  const windChill = selectedHour
    ? computeWindChill(selectedHour.temperature, selectedHour.windSpeed)
    : null
  const visibilityMiles = selectedHour ? selectedHour.visibility / 1609.34 : null
  const gear = selectedHour
    ? getGearSuggestions(sport, {
        temperature: selectedHour.temperature,
        feelsLike: selectedHour.feelsLike,
        windSpeed: selectedHour.windSpeed,
        windGusts: selectedHour.windGusts,
        precipitationProbability: selectedHour.precipitationChance,
        precipitation: selectedHour.precipitation,
        conditionLabel,
      })
    : null

  const handleLocationSelect = (result: LocationResult) => {
    searchDirty.current = false
    setLocation(result)
    setSearchQuery(formatLocationName(result))
    setIsSearchOpen(false)
    resetSearchState()
    pushRecentLocation(result)
  }

  const handleUseCurrentLocation = async () => {
    setStatus('loading')
    setForecast(null)
    setIsLocating(true)
    setGeoMessage('Requesting current location...')
    try {
      const position = await getCurrentPositionWithFallback()
      try {
        const resolved = await fetchReverseGeocodingWithFallback(
          position.coords.latitude,
          position.coords.longitude
        )
        searchDirty.current = false
        setLocation(resolved)
        setSelectedTime(toLocalHourInput(new Date()))
        resetSearchState()
        setStatus('idle')
        setIsLocating(false)
        setGeoMessage('')
        pushRecentLocation(resolved)
        return
      } catch {
        const fallbackLocation: LocationResult = {
          name: 'Current location',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        searchDirty.current = false
        setLocation(fallbackLocation)
        setSelectedTime(toLocalHourInput(new Date()))
        resetSearchState()
        setStatus('idle')
        setIsLocating(false)
        setGeoMessage('Using device coordinates. Nearby place name unavailable.')
        pushRecentLocation(fallbackLocation)
        return
      }
    } catch (error) {
      const { code, message } = getGeolocationDetails(error)
      try {
        const ipLocation = await fetchIpLocation()
        searchDirty.current = false
        setLocation(ipLocation)
        setSelectedTime(toLocalHourInput(new Date()))
        resetSearchState()
        setStatus('idle')
        setIsLocating(false)
        const codeLabel = code === null ? '' : ` (${code})`
        setGeoMessage(`Location error${codeLabel}: ${message}. Estimating location.`)
        pushRecentLocation(ipLocation)
        return
      } catch {
        // Ignore IP fallback errors.
      }

      searchDirty.current = false
      setLocation(DEFAULT_LOCATION)
      setSelectedTime(toLocalHourInput(new Date()))
      setStatus('idle')
      setIsLocating(false)
      const codeLabel = code === null ? '' : ` (${code})`
      const contextHint =
        typeof window !== 'undefined' && window.isSecureContext ? '' : ' (Not a secure context)'
      setGeoMessage(`Location error${codeLabel}: ${message}${contextHint}`)
    }
  }

  const handleShare = async () => {
    if (typeof window === 'undefined') return
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      // Ignore clipboard failures.
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="grain" />
      <HomeHeader onShare={handleShare} />

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-24">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <ForecastSetupCard
            searchQuery={searchQuery}
            onSearchQueryChange={handleQueryChange}
            onSearchFocus={handleSearchFocus}
            onSearchKeyDown={(event) => {
              if (event.key === 'Escape') {
                setIsSearchOpen(false)
                return
              }
              if (!searchResults.length) return
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setSelectedResultIndex((prev) => Math.min(prev + 1, searchResults.length - 1))
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                setSelectedResultIndex((prev) => Math.max(prev - 1, 0))
              }
              if (event.key === 'Enter') {
                event.preventDefault()
                handleLocationSelect(searchResults[selectedResultIndex])
              }
            }}
            searchResults={searchResults}
            searchStatus={searchStatus}
            searchError={searchError}
            hasSearched={hasSearched}
            isSearchOpen={isSearchOpen}
            onSearchOpenChange={setIsSearchOpen}
            onLocationSelect={handleLocationSelect}
            selectedResultIndex={selectedResultIndex}
            formatLocationName={formatLocationName}
            recentLocations={recentLocations}
            isLocating={isLocating}
            onUseCurrentLocation={handleUseCurrentLocation}
            geoMessage={geoMessage}
            sport={sport}
            onSportChange={setSport}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
            onPreset={(hour) =>
              setSelectedTime(toLocalHourInput(setHourForDate(new Date(selectedTime), hour)))
            }
            presetHours={PRESET_HOURS}
          />

          <ForecastSummaryCard
            status={status}
            locationName={location ? formatLocationName(location) : 'Locating you...'}
            selectedTime={selectedTime}
            conditionLabel={conditionLabel}
            timezone={forecast?.timezone}
            selectedHour={selectedHour}
            heatIndex={heatIndex}
            windChill={windChill}
            visibilityMiles={visibilityMiles}
            elevation={location?.elevation ?? null}
            errorMessage={errorMessage}
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <WearGuideCard status={status} sport={sport} gear={gear} />
          <PackListCard status={status} gear={gear} />
        </section>
      </main>
    </div>
  )
}
