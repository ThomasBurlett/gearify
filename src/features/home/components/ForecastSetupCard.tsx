import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastSetupLocationSearch } from '@/features/home/components/ForecastSetupLocationSearch'
import { ForecastSetupSportPicker } from '@/features/home/components/ForecastSetupSportPicker'
import {
  ForecastSetupTimePicker,
  type PresetHour,
} from '@/features/home/components/ForecastSetupTimePicker'
import type { LocationResult, SportType } from '@/lib/weather'

type ForecastSetupCardProps = {
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
  sport: SportType
  onSportChange: (sport: SportType) => void
  selectedTime: string
  onTimeChange: (value: string) => void
  onPreset: (hour: number) => void
  presetHours: PresetHour[]
}

export function ForecastSetupCard({
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
  sport,
  onSportChange,
  selectedTime,
  onTimeChange,
  onPreset,
  presetHours,
}: ForecastSetupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Where & when?</CardTitle>
        <CardDescription>
          Search for any trail, mountain, or resort. We'll keep your link in sync.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Location search - full width */}
          <ForecastSetupLocationSearch
            searchQuery={searchQuery}
            onSearchQueryChange={onSearchQueryChange}
            onSearchFocus={onSearchFocus}
            onSearchKeyDown={onSearchKeyDown}
            searchResults={searchResults}
            searchStatus={searchStatus}
            searchError={searchError}
            hasSearched={hasSearched}
            isSearchOpen={isSearchOpen}
            onSearchOpenChange={onSearchOpenChange}
            onLocationSelect={onLocationSelect}
            selectedResultIndex={selectedResultIndex}
            formatLocationName={formatLocationName}
            recentLocations={recentLocations}
            isLocating={isLocating}
            onUseCurrentLocation={onUseCurrentLocation}
            geoMessage={geoMessage}
          />

          {/* Sport + Time - side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <ForecastSetupSportPicker sport={sport} onSportChange={onSportChange} />

            <ForecastSetupTimePicker
              selectedTime={selectedTime}
              onTimeChange={onTimeChange}
              onPreset={onPreset}
              presetHours={presetHours}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
