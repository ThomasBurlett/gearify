import { useRef } from 'react'
import type React from 'react'
import { CalendarClock, MapPin, Navigation, Loader2, Snowflake, SunMedium } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import type { LocationResult, SportType } from '@/lib/weather'

type PresetHour = {
  label: string
  hour: number
}

type ForecastSetupCardProps = {
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  onSearchFocus: () => void
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onSearchSubmit: (event: React.FormEvent<HTMLFormElement>) => void
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
  sport: SportType
  onSportChange: (sport: SportType) => void
  selectedTime: string
  onTimeChange: (value: string) => void
  onPreset: (hour: number) => void
  presetHours: PresetHour[]
}

const SPORT_LABELS: Record<SportType, string> = {
  running: 'Running',
  skiing: 'Skiing',
}

export function ForecastSetupCard({
  searchQuery,
  onSearchQueryChange,
  onSearchFocus,
  onSearchKeyDown,
  onSearchSubmit,
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
  sport,
  onSportChange,
  selectedTime,
  onTimeChange,
  onPreset,
  presetHours,
}: ForecastSetupCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleOpenChange = (open: boolean) => {
    if (!open && document.activeElement === inputRef.current) {
      return
    }
    onSearchOpenChange(open)
  }

  return (
    <Card>
      <CardHeader>
        <Badge variant="glow">Forecast setup</Badge>
        <CardTitle className="text-2xl">Plan your gear with hour-level precision.</CardTitle>
        <CardDescription>
          Search mountains, trails, or resorts. We will keep the shareable link in sync with your
          choices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={onSearchSubmit} className="space-y-3">
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
                    placeholder="Try Eldora, Mt. Hood, Aspen, Big Cottonwood..."
                    className="pl-10"
                  />
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
                    <CommandList className="scrollbar-glow">
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
                      {recentLocations.map((result) => (
                        <CommandItem
                          key={`recent-${result.latitude}-${result.longitude}`}
                          onSelect={() => onLocationSelect(result)}
                          className="hover:border-tide-300/50 hover:bg-ink-950/60"
                        >
                          <span className="pr-4">{formatLocationName(result)}</span>
                          <span className="whitespace-nowrap text-xs text-ink-100/60">
                            {result.elevation
                              ? `${Math.round(result.elevation * 3.28084)} ft`
                              : 'Elevation n/a'}
                          </span>
                        </CommandItem>
                      ))}
                      {searchResults.length > 0 && (
                        <div className="px-4 pb-2 pt-4 text-xs uppercase tracking-[0.2em] text-ink-100/60">
                          Search results
                        </div>
                      )}
                      {searchStatus !== 'loading' &&
                        searchResults.map((result, index) => (
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
                            <span className="whitespace-nowrap text-xs text-ink-100/60">
                              {result.elevation
                                ? `${Math.round(result.elevation * 3.28084)} ft`
                                : 'Elevation n/a'}
                            </span>
                          </CommandItem>
                        ))}
                      {searchStatus === 'idle' &&
                        !searchQuery.trim() &&
                        recentLocations.length === 0 && (
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
            <Button type="submit">Search</Button>
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
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Label>Sport</Label>
            <div className="flex gap-2">
              {(['running', 'skiing'] as SportType[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onSportChange(value)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm transition ${
                    sport === value
                      ? 'border-tide-300/70 bg-tide-500/15 text-ink-50'
                      : 'border-ink-200/10 bg-ink-950/40 text-ink-100/70 hover:border-ink-200/30'
                  }`}
                >
                  {value === 'running' ? (
                    <SunMedium className="h-4 w-4" />
                  ) : (
                    <Snowflake className="h-4 w-4" />
                  )}
                  {SPORT_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="forecast-time">Date + time</Label>
            <div className="relative">
              <Input
                id="forecast-time"
                type="datetime-local"
                step={3600}
                value={selectedTime}
                onChange={(event) => onTimeChange(event.target.value)}
                className="pr-12"
              />
              <button
                type="button"
                aria-label="Open date and time picker"
                onClick={() => {
                  const input = document.getElementById('forecast-time') as HTMLInputElement | null
                  input?.showPicker?.()
                  input?.focus()
                }}
                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border border-ink-200/20 bg-ink-950/50 text-ink-50 transition hover:border-tide-300/60 hover:bg-ink-900/70"
              >
                <CalendarClock className="h-4 w-4 text-ink-50" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {presetHours.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onPreset(preset.hour)}
                  className="rounded-full border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-ink-100/70 transition hover:border-tide-300/50 hover:text-ink-50"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
