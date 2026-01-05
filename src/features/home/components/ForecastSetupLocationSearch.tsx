import { useRef } from 'react'
import type React from 'react'
import type { PopoverRootChangeEventDetails } from '@base-ui/react/popover'
import { Loader2, MapPin, Navigation, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
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
  const triggerRef = useRef<HTMLDivElement | null>(null)

  const handleOpenChange = (open: boolean, details?: PopoverRootChangeEventDetails) => {
    const target = details?.event?.target as Node | null | undefined
    if (!open && target && triggerRef.current?.contains(target)) {
      return
    }
    if (
      !open &&
      (details?.reason === 'trigger-press' ||
        details?.reason === 'trigger-focus' ||
        details?.reason === 'focus-out')
    ) {
      return
    }
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
    <div className="flex flex-wrap gap-3">
      <Popover open={isSearchOpen} onOpenChange={handleOpenChange} modal={false}>
        <PopoverTrigger
          nativeButton={false}
          render={(triggerProps) => {
            const {
              ref,
              onFocus,
              onBlur,
              onClick,
              onPointerDown,
              onMouseDown,
              onKeyDown,
              onKeyUp,
              role: _role,
              tabIndex: _tabIndex,
              ...rest
            } = triggerProps
            return (
              <div ref={triggerRef} className="relative flex-1">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-100/60" />
                <Input
                  {...rest}
                  id="location-search"
                  ref={(node) => {
                    inputRef.current = node
                    if (typeof ref === 'function') {
                      ref(node)
                    } else if (ref && 'current' in ref) {
                      ref.current = node
                    }
                  }}
                  value={searchQuery}
                  onFocus={(event) => {
                    onFocus?.(event)
                    onSearchFocus()
                  }}
                  onBlur={onBlur}
                  onPointerDown={onPointerDown}
                  onMouseDown={onMouseDown}
                  onClick={onClick}
                  onKeyDown={(event) => {
                    onKeyDown?.(event)
                    onSearchKeyDown(event)
                  }}
                  onKeyUp={onKeyUp}
                  onChange={(event) => onSearchQueryChange(event.target.value)}
                  placeholder="Try Eldora, Mt. Hood, Aspen, 80302..."
                  className="h-11 pl-10 pr-10"
                />
                {searchQuery.trim() ? (
                  <button
                    type="button"
                    aria-label="Clear location search"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center text-ink-100/70 transition hover:text-ink-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            )
          }}
        />
        {isSearchOpen && (
          <PopoverContent
            className="w-[min(90vw,28rem)] border border-ink-200/10 bg-ink-950 text-ink-50"
            align="start"
            initialFocus={false}
            finalFocus={false}
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
        className="h-11 px-4 whitespace-nowrap"
      >
        {isLocating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Navigation className="h-4 w-4" />
        )}
        <span className="ml-2">{isLocating ? 'Locating...' : 'Current'}</span>
      </Button>
      {geoMessage && (
        <p className="col-span-full text-xs text-ink-100/70" role="status">
          {geoMessage}
        </p>
      )}
    </div>
  )
}
