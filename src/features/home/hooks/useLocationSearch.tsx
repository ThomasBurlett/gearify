import { useEffect, useRef, useState } from 'react'

import type { LocationResult } from '@/lib/weather'
import { fetchGeocoding } from '@/lib/weather'

type UseLocationSearchArgs = {
  location: LocationResult | null
  formatLocationName: (result: LocationResult) => string
}

type StoredLocation = {
  name: string
  latitude: number
  longitude: number
  admin1?: string
  country?: string
  elevation?: number
}

const RECENT_STORAGE_KEY = 'gearify.recentLocations'
const MAX_RECENTS = 3

export function useLocationSearch({ location, formatLocationName }: UseLocationSearchArgs) {
  const searchDirty = useRef(false)
  const searchRequestId = useRef(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<LocationResult[]>([])
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [searchError, setSearchError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [recentLocations, setRecentLocations] = useState<LocationResult[]>([])

  useEffect(() => {
    if (!location) return
    if (!searchDirty.current) {
      setSearchQuery(formatLocationName(location))
    }
  }, [location])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored) as StoredLocation[]
      setRecentLocations(parsed)
    } catch {
      setRecentLocations([])
    }
  }, [])

  useEffect(() => {
    if (!searchDirty.current) return
    const query = searchQuery.trim()
    if (!query) {
      return
    }
    const id = ++searchRequestId.current
    const timer = window.setTimeout(async () => {
      try {
        setSearchStatus('loading')
        setSearchError('')
        setHasSearched(true)
        const results = await fetchGeocoding(query)
        if (id !== searchRequestId.current) return
        setSearchResults(results)
        setSelectedResultIndex(0)
        setSearchStatus('idle')
        setIsSearchOpen(true)
      } catch (error) {
        if (id !== searchRequestId.current) return
        setSearchStatus('error')
        setSearchError(error instanceof Error ? error.message : 'Unable to search locations')
        setIsSearchOpen(true)
      }
    }, 250)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const resetSearchState = () => {
    setSearchResults([])
    setHasSearched(false)
    setSearchStatus('idle')
    setSearchError('')
    setSelectedResultIndex(0)
  }

  const pushRecentLocation = (result: LocationResult) => {
    const entry: StoredLocation = {
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      admin1: result.admin1,
      country: result.country,
      elevation: result.elevation,
    }
    const next = [
      entry,
      ...recentLocations.filter(
        (item) =>
          item.latitude !== entry.latitude ||
          item.longitude !== entry.longitude ||
          item.name !== entry.name
      ),
    ].slice(0, MAX_RECENTS)
    setRecentLocations(next)
    try {
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Ignore storage errors.
    }
  }

  const handleQueryChange = (value: string) => {
    searchDirty.current = true
    setSearchQuery(value)
    if (!value.trim()) {
      resetSearchState()
    }
  }

  const handleSearchFocus = () => {
    if (searchQuery.trim() && location) {
      setSearchResults([
        {
          name: formatLocationName(location),
          latitude: location.latitude,
          longitude: location.longitude,
          admin1: location.admin1,
          country: location.country,
          elevation: location.elevation,
        },
      ])
      setHasSearched(true)
    }
    setIsSearchOpen(true)
  }

  return {
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
  }
}
