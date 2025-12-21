import { useRef } from 'react'
import type React from 'react'
import { Loader2, MapPin, Navigation, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { LocationResult } from '@/lib/weather'
import { formatElevationFeet } from '@/features/home/utils/formatters'

type ForecastSetupLocationSearchProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearchFocus: () => void
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  searchResults: LocationResult[]
  searchStatus: 'idle' | 'loading' | 'error'
  searchError: string
  hasSearched: boolean
  isSearchOpen: boolean
  onSearchOpenChange: (open: boolean) => void
  onLocationSelect: (result: LocationResult) => void
  selectedResultIndex: number
  formatLocationName: (result: LocationResult) => string
  recentLocations: LocationResult[]
  isLocating: boolean
  onUseCurrentLocation: () => void
  geoMessage: string
}

export function ForecastSetupLocationSearch({
  searchQuery,
  onSearchQueryChange,
  onSearchFocus,
  onSearchKeyDown,
  searchResults,
  searchStatus,
  searchError,
  hasSearched,
  isSearchOpen,
  onSearchOpenChange,
  onLocationSelect,
  selectedResultIndex,
  formatLocationName,
  recentLocations,
  isLocating,
  onUseCurrentLocation,
  geoMessage,
}: ForecastSetupLocationSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open && document.activeElement === inputRef.current) {
      return
    }
    onSearchOpenChange(open)
  }

  const handleClear = () => {
    onSearchQueryChange('')
    onSearchOpenChange(false)
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-3">
      <Label htmlFor="location-search">Location search</Label>
      <div className="flex flex-wrap gap-3">
        <Popover open={isSearchOpen} onOpenChange={handleOpenChange} modal={false}>
          <PopoverAnchor asChild>
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-ink-100/60" />
              <Input
                id="location-search"
                ref={inputRef}
                value={searchQuery}
                onFocus={onSearchFocus}
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={onSearchKeyDown}
                placeholder="Try Eldora, Mt. Hood, Aspen, 80302..."
                className="pl-10 pr-10"
              />
              {searchQuery.trim() ? (
                <button
                  type="button"
                  aria-label="Clear location search"
                  onClick={handleClear}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center text-ink-100/70 transition hover:text-ink-50"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </PopoverAnchor>
          {isSearchOpen && (
            <PopoverContent
              className="w-[min(90vw,28rem)]"
              align="start"
              onOpenAutoFocus={(event) => event.preventDefault()}
              onCloseAutoFocus={(event) => event.preventDefault()}
            >
              <Command shouldFilter={false}>
                <CommandList className="scrollbar-glow pr-1">
                  {searchStatus === 'loading' && (
                    <div className="px-4 py-3 text-sm text-ink-100/70">Searching...</div>
                  )}
                  {searchStatus === 'error' && (
                    <div className="px-4 py-3 text-sm text-spice-100">{searchError}</div>
                  )}
                  {recentLocations.length > 0 && (
                    <div className="px-4 pb-2 pt-3 text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Recent locations
                    </div>
                  )}
                  {recentLocations.map((result) => {
                    const elevation = formatElevationFeet(result.elevation)
                    return (
                      <CommandItem
                        key={`recent-${result.latitude}-${result.longitude}`}
                        onSelect={() => onLocationSelect(result)}
                        className="hover:border-tide-300/50 hover:bg-ink-950/60"
                      >
                        <span className="pr-4">{formatLocationName(result)}</span>
                        {elevation && (
                          <span className="whitespace-nowrap text-xs text-ink-100/60">
                            {elevation}
                          </span>
                        )}
                      </CommandItem>
                    )
                  })}
                  {searchResults.length > 0 && (
                    <div className="px-4 pb-2 pt-4 text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Search results
                    </div>
                  )}
                  {searchStatus !== 'loading' &&
                    searchResults.map((result, index) => {
                      const elevation = formatElevationFeet(result.elevation)
                      return (
                        <CommandItem
                          key={`${result.latitude}-${result.longitude}`}
                          onSelect={() => onLocationSelect(result)}
                          className={
                            index === selectedResultIndex
                              ? 'border-tide-300/60 bg-ink-950/60'
                              : 'hover:border-tide-300/50 hover:bg-ink-950/60'
                          }
                        >
                          <span className="pr-4">{formatLocationName(result)}</span>
                          {elevation && (
                            <span className="whitespace-nowrap text-xs text-ink-100/60">
                              {elevation}
                            </span>
                          )}
                        </CommandItem>
                      )
                    })}
                  {searchStatus === 'idle' && !searchQuery.trim() && recentLocations.length === 0 && (
                    <CommandEmpty>Start typing to search for a location.</CommandEmpty>
                  )}
                  {searchStatus === 'idle' && hasSearched && searchResults.length === 0 && (
                    <CommandEmpty>No results found.</CommandEmpty>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          )}
        </Popover>
        <Button
          type="button"
          variant="outline"
          onClick={onUseCurrentLocation}
          disabled={isLocating}
        >
          {isLocating ? <Loader2 className="animate-spin" /> : <Navigation />}
          {isLocating ? 'Locating...' : 'Current'}
        </Button>
      </div>
      {geoMessage && (
        <p className="text-xs text-ink-100/70" role="status">
          {geoMessage}
        </p>
      )}
    </div>
  )
}
