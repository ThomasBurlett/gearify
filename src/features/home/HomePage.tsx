import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { WEAR_ITEM_CATALOG, getGearSuggestions, getWearPlan } from '@/lib/gear'
import { toLocalHourInput } from '@/lib/time'
import { debounce } from '@/lib/utils'
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
import { HomeHeader } from '@/features/home/components/HomeHeader'
import { HomeSidebar } from '@/features/home/components/HomeSidebar'
import { PackListCard } from '@/features/home/components/PackListCard'
import { WearGuideCard } from '@/features/home/components/WearGuideCard'
import { StickyContextBar } from '@/features/home/components/StickyContextBar'
import { QuickSetupSection } from '@/features/home/components/QuickSetupSection'
import { WeatherDashboard } from '@/features/home/components/WeatherDashboard'
import { TuningPanel } from '@/features/home/components/TuningPanel'
import { ForecastSetupLocationSearch } from '@/features/home/components/ForecastSetupLocationSearch'
import type { HomeSearchParams, SelectedHour } from '@/features/home/types'
import { useForecastData } from '@/features/home/hooks/useForecastData'
import { useComfortProfileStorage } from '@/features/home/hooks/useComfortProfileStorage'
import { useInitialLocation } from '@/features/home/hooks/useInitialLocation'
import { useLocationSearch } from '@/features/home/hooks/useLocationSearch'
import { useSavedPlans } from '@/features/home/hooks/useSavedPlans'
import { toast } from 'sonner'
import { useHomeStore } from '@/features/home/store/useHomeStore'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const DEFAULT_LOCATION: LocationResult = {
  name: 'Sandy',
  admin1: 'Utah',
  country: 'United States',
  latitude: 40.56498,
  longitude: -111.83897,
}

function parseSport(value?: string): SportType {
  return value === 'skiing' ? 'skiing' : 'running'
}

function isSameList(a: string[], b: string[]) {
  return a.length === b.length && a.every((item, index) => item === b[index])
}

type HomePageProps = {
  sportParam?: string
  search?: HomeSearchParams
}

export default function HomePage({ sportParam, search = {} }: HomePageProps) {
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
    setErrorMessage,
    geoMessage,
    setGeoMessage,
    comfortProfile,
    setComfortProfile,
    exertion,
    setExertion,
    duration,
    setDuration,
    checkedPackItems,
    setCheckedPackItems,
    customPackItems,
    setCustomPackItems,
    removedPackItems,
    setRemovedPackItems,
    checkedWearItems,
    setCheckedWearItems,
    removedWearItems,
    setRemovedWearItems,
    addedWearItems,
    setAddedWearItems,
    gearMappings,
    activePlanId,
    setActivePlanId,
    saveStatus,
    setSaveStatus,
    lastSavedAt,
    setLastSavedAt,
  } = useHomeStore()
  const [isLocating, setIsLocating] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scenario, setScenario] = useState<'now' | 'colder' | 'wetter'>('now')
  const lastUrlTime = useRef<string | null | undefined>(undefined)

  useComfortProfileStorage(comfortProfile, setComfortProfile)
  useInitialLocation({
    search,
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
  const { plans, savePlan, updatePlan, renamePlan, toggleFavorite, deletePlan } = useSavedPlans()
  const activePlanName = useMemo(() => {
    if (!activePlanId) return null
    return plans.find((plan) => plan.id === activePlanId)?.name ?? null
  }, [activePlanId, plans])
  const canSavePlan = Boolean(location && selectedTime)

  // Debounced auto-save for active plans
  const debouncedSave = useMemo(
    () =>
      debounce((planId: string) => {
        if (!location || !selectedTime) return

        setSaveStatus('saving')
        try {
          updatePlan(planId, {
            location,
            sport,
            selectedTime,
            checkedPackItems,
            checkedWearItems,
            customPackItems,
            removedPackItems,
            removedWearItems,
            addedWearItems,
            gearMappings,
          })
          setSaveStatus('saved')
          setLastSavedAt(Date.now())
        } catch (error) {
          console.error('Failed to save plan:', error)
          setSaveStatus('error')
        }
      }, 500),
    [
      location,
      sport,
      selectedTime,
      checkedPackItems,
      checkedWearItems,
      customPackItems,
      removedPackItems,
      removedWearItems,
      addedWearItems,
      gearMappings,
      updatePlan,
      setSaveStatus,
      setLastSavedAt,
    ]
  )

  const handleSavePlan = (name: string) => {
    if (!location || !selectedTime) return
    const saved = savePlan({
      name,
      location,
      sport,
      selectedTime,
      checkedPackItems,
      checkedWearItems,
      customPackItems,
      removedPackItems,
      removedWearItems,
      addedWearItems,
      gearMappings,
    })
    setActivePlanId(saved.id)
    const planLabel = name.trim().length > 0 ? name.trim() : 'Untitled plan'
    toast.success(`Saved: ${planLabel}`, {
      description: `${formatLocationName(location)} - ${selectedTime} - ${
        sport === 'skiing' ? 'Skiing' : 'Running'
      }`,
    })
  }

  const handleRenamePlan = (newName: string) => {
    if (!activePlanId) return
    const trimmed = newName.trim()
    if (!trimmed) return

    renamePlan(activePlanId, trimmed)
    toast.success('Plan renamed', {
      description: trimmed,
    })
  }

  const handleDuplicatePlan = () => {
    if (!activePlanId || !location || !selectedTime) return

    const currentPlan = plans.find((p) => p.id === activePlanId)
    if (!currentPlan) return

    const duplicated = savePlan({
      name: `${currentPlan.name} (copy)`,
      location,
      sport,
      selectedTime,
      checkedPackItems,
      checkedWearItems,
      customPackItems,
      removedPackItems,
      removedWearItems,
      addedWearItems,
      gearMappings,
    })

    setActivePlanId(duplicated.id)
    toast.success('Plan duplicated', {
      description: duplicated.name,
    })
  }

  const handleNewPlan = () => {
    setActivePlanId(null)
    setSaveStatus('idle')
    setLastSavedAt(null)
    toast.info('New temporary plan started')
  }

  const handleDeletePlan = () => {
    if (!activePlanId) return
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!activePlanId) return

    deletePlan(activePlanId)
    setActivePlanId(null)
    setSaveStatus('idle')
    setLastSavedAt(null)
    setDeleteDialogOpen(false)
    toast.success('Plan deleted')
  }

  const handleToggleFavorite = () => {
    if (!activePlanId) return
    toggleFavorite(activePlanId)

    const currentPlan = plans.find((p) => p.id === activePlanId)
    const isFav = currentPlan?.favorite
    toast.success(isFav ? 'Removed from favorites' : 'Added to favorites')
  }

  const isFavorite = useMemo(() => {
    if (!activePlanId) return false
    return plans.find((p) => p.id === activePlanId)?.favorite ?? false
  }, [activePlanId, plans])

  useEffect(() => {
    const fromUrl = search.time
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
  }, [search.time, selectedTime, setSelectedTime])

  useEffect(() => {
    const nextSport = parseSport(sportParam)
    setSport(nextSport)
  }, [sportParam, setSport])

  useEffect(() => {
    if (!location) return
    navigate({
      to: '/$sport',
      params: { sport },
      search: {
        lat: location.latitude.toFixed(5),
        lon: location.longitude.toFixed(5),
        name: formatLocationName(location),
        elev: location.elevation !== undefined ? location.elevation.toFixed(0) : undefined,
        time: selectedTime,
      },
      replace: true,
    })
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
  const wearContext = { exertion, duration }
  const baseInputs = selectedHour
    ? {
        temperature: selectedHour.temperature,
        feelsLike: selectedHour.feelsLike,
        windSpeed: selectedHour.windSpeed,
        windGusts: selectedHour.windGusts,
        precipitationProbability: selectedHour.precipitationChance,
        precipitation: selectedHour.precipitation,
        conditionLabel,
        cloudCover: selectedHour.cloudCover,
      }
    : null
  const gear = baseInputs
    ? getGearSuggestions(sport, baseInputs, comfortProfile, wearContext)
    : null
  const packItems = useMemo(() => (gear ? gear.pack : []), [gear])

  useEffect(() => {
    if (!gear) return
    const basePack = packItems.filter((item) => !removedPackItems.includes(item))
    const allowed = new Set([...basePack, ...customPackItems])
    const nextChecked = checkedPackItems.filter((item) => allowed.has(item))
    if (!isSameList(nextChecked, checkedPackItems)) {
      setCheckedPackItems(nextChecked)
    }
  }, [gear, packItems, customPackItems, removedPackItems, checkedPackItems, setCheckedPackItems])

  useEffect(() => {
    if (!gear) return
    const allowed = new Set(packItems)
    const nextRemoved = removedPackItems.filter((item) => allowed.has(item))
    if (!isSameList(nextRemoved, removedPackItems)) {
      setRemovedPackItems(nextRemoved)
    }
  }, [gear, packItems, removedPackItems, setRemovedPackItems])

  const wearAllowed = useMemo(() => {
    const items = WEAR_ITEM_CATALOG.map((entry) => entry.item)
    return { key: items.join('|'), items }
  }, [])

  useEffect(() => {
    if (!wearAllowed.items.length) return
    const allowed = new Set(wearAllowed.items)
    const nextChecked = checkedWearItems.filter(
      (item) => allowed.has(item) && !removedWearItems.includes(item)
    )
    if (!isSameList(nextChecked, checkedWearItems)) {
      setCheckedWearItems(nextChecked)
    }
    const nextRemoved = removedWearItems.filter((item) => allowed.has(item))
    if (!isSameList(nextRemoved, removedWearItems)) {
      setRemovedWearItems(nextRemoved)
    }
    const nextAdded = addedWearItems.filter((item) => allowed.has(item))
    if (!isSameList(nextAdded, addedWearItems)) {
      setAddedWearItems(nextAdded)
    }
  }, [
    wearAllowed.items,
    checkedWearItems,
    removedWearItems,
    addedWearItems,
    setCheckedWearItems,
    setRemovedWearItems,
    setAddedWearItems,
  ])
  const colderWearPlan = baseInputs
    ? getWearPlan(sport, baseInputs, comfortProfile, wearContext, {
        temperature: baseInputs.temperature - 10,
        feelsLike: baseInputs.feelsLike - 10,
      })
    : null
  const wetterWearPlan = baseInputs
    ? getWearPlan(sport, baseInputs, comfortProfile, wearContext, {
        precipitationProbability: Math.max(baseInputs.precipitationProbability, 80),
        precipitation: Math.max(baseInputs.precipitation, 0.15),
        conditionLabel: baseInputs.conditionLabel.toLowerCase().includes('snow') ? 'Snow' : 'Rain',
      })
    : null

  const activePlan = useMemo(() => {
    if (scenario === 'colder') return colderWearPlan
    if (scenario === 'wetter') return wetterWearPlan
    return gear?.wearPlan ?? null
  }, [scenario, gear?.wearPlan, colderWearPlan, wetterWearPlan])

  const resetAddedItems = () => {
    if (addedWearItems.length === 0) return
    setAddedWearItems([])
    setCheckedWearItems(checkedWearItems.filter((item) => !addedWearItems.includes(item)))
  }

  const handleLocationSelect = (result: LocationResult) => {
    searchDirty.current = false
    setLocation(result)
    setSearchQuery(formatLocationName(result))
    setIsSearchOpen(false)
    resetSearchState()
    pushRecentLocation(result)
  }

  // Auto-save active plan with debouncing
  useEffect(() => {
    if (!activePlanId || !location || !selectedTime) return

    debouncedSave(activePlanId)

    return () => {
      debouncedSave.cancel()
    }
  }, [activePlanId, location, selectedTime, debouncedSave])

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
    if (typeof window === 'undefined') return false
    try {
      await navigator.clipboard.writeText(window.location.href)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="grain" />
      <SidebarProvider defaultOpen>
        <HomeSidebar onShare={handleShare} />
        <SidebarInset className="bg-transparent">
          {/* Sticky Context Bar */}
          <StickyContextBar
            locationName={location ? formatLocationName(location) : 'Locating...'}
            sport={sport}
            selectedTime={selectedTime}
            onLocationClick={() => setIsSearchOpen(true)}
            onSportClick={() => {}}
            onTimeClick={() => {}}
            onSaveClick={() => {}}
          />

          <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-6 pb-24 pt-8">
            <HomeHeader
              canSavePlan={canSavePlan}
              onSavePlan={handleSavePlan}
              activePlanId={activePlanId}
              activePlanName={activePlanName}
              saveStatus={saveStatus}
              lastSavedAt={lastSavedAt}
              onRenamePlan={handleRenamePlan}
              onDuplicatePlan={handleDuplicatePlan}
              onNewPlan={handleNewPlan}
              onDeletePlan={handleDeletePlan}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite}
            />

            <main className="flex w-full flex-col gap-8">
              {/* Quick Setup Section */}
              <QuickSetupSection
                locationName={location ? formatLocationName(location) : 'Locating...'}
                sport={sport}
                selectedTime={selectedTime}
                onLocationClick={() => setIsSearchOpen(true)}
                onSportClick={() => {}}
                onTimeClick={() => {}}
              />

              {/* Location Search Popover */}
              <ForecastSetupLocationSearch
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
              />

              {/* Weather Dashboard */}
              <WeatherDashboard
                selectedHour={selectedHour}
                heatIndex={heatIndex}
                windChill={windChill}
                visibilityMiles={visibilityMiles}
                elevation={location?.elevation ?? null}
                isLoading={status === 'loading'}
              />

              {/* Tuning Panel */}
              <TuningPanel
                scenario={scenario}
                onScenarioChange={setScenario}
                comfortProfile={comfortProfile}
                onComfortProfileChange={setComfortProfile}
                exertion={exertion}
                onExertionChange={setExertion}
                duration={duration}
                onDurationChange={setDuration}
                colderAvailable={!!colderWearPlan}
                wetterAvailable={!!wetterWearPlan}
                onResetAddedItems={resetAddedItems}
              />

              {/* Gear Recommendations */}
              <section className="grid gap-6 lg:gap-8 xl:grid-cols-[1fr_auto]">
                <WearGuideCard
                  status={status}
                  wearPlan={activePlan}
                  checkedWearItems={checkedWearItems}
                  onCheckedWearItemsChange={setCheckedWearItems}
                  removedWearItems={removedWearItems}
                  onRemovedWearItemsChange={setRemovedWearItems}
                  addedWearItems={addedWearItems}
                  onAddedWearItemsChange={setAddedWearItems}
                />
                <div className="xl:w-80">
                  <PackListCard
                    status={status}
                    gear={gear}
                    checkedItems={checkedPackItems}
                    onCheckedItemsChange={setCheckedPackItems}
                    customItems={customPackItems}
                    onCustomItemsChange={setCustomPackItems}
                    removedItems={removedPackItems}
                    onRemovedItemsChange={setRemovedPackItems}
                  />
                </div>
              </section>
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete plan?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{activePlanName}&quot;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
