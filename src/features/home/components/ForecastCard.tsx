import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ForecastSetupLocationSearch } from '@/features/home/components/ForecastSetupLocationSearch'
import { ForecastSetupSportPicker } from '@/features/home/components/ForecastSetupSportPicker'
import {
  ForecastSetupTimePicker,
  type PresetHour,
} from '@/features/home/components/ForecastSetupTimePicker'
import { ForecastSummaryMetrics } from '@/features/home/components/ForecastSummaryMetrics'
import { ComfortProfileControls } from '@/features/home/components/ComfortProfileControls'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getConditionIcon } from '@/features/home/utils/conditionIcons'
import { formatLocalDateTime } from '@/features/home/utils/formatters'
import type { LocationResult, SportType } from '@/lib/weather'
import type { ComfortProfile, ExertionLevel, TripDuration } from '@/lib/gear'
import type { SelectedHour, LoadStatus } from '@/features/home/types'

const exertionOptions: Array<{ value: ExertionLevel; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'steady', label: 'Steady' },
  { value: 'hard', label: 'Hard' },
]

const durationOptions: Array<{ value: TripDuration; label: string }> = [
  { value: 'short', label: '< 1h' },
  { value: 'medium', label: '1-3h' },
  { value: 'long', label: '3h+' },
]

type Scenario = 'now' | 'colder' | 'wetter'

function optionClass(isSelected: boolean) {
  return cn(
    'min-h-[40px] rounded-lg border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-50',
    isSelected
      ? 'border-tide-300/60 bg-ink-950/60 text-ink-50'
      : 'text-ink-100/70 hover:border-tide-300/50 hover:text-ink-50'
  )
}

type ForecastCardProps = {
  // Location search props
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

  // Sport & time props
  sport: SportType
  onSportChange: (sport: SportType) => void
  selectedTime: string
  onTimeChange: (value: string) => void
  onPreset: (hour: number) => void
  presetHours: PresetHour[]

  // Forecast summary props
  status: LoadStatus
  locationName: string
  conditionLabel: string
  timezone?: string
  selectedHour: SelectedHour | null
  heatIndex: number | null
  windChill: number | null
  visibilityMiles: number | null
  elevation: number | null
  errorMessage: string

  // Tuning controls props
  scenario: Scenario
  onScenarioChange: (scenario: Scenario) => void
  comfortProfile: ComfortProfile
  onComfortProfileChange: (profile: ComfortProfile) => void
  exertion: ExertionLevel
  onExertionChange: (value: ExertionLevel) => void
  duration: TripDuration
  onDurationChange: (value: TripDuration) => void
  colderAvailable: boolean
  wetterAvailable: boolean
  onResetAddedItems: () => void
}

export function ForecastCard({
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
  status,
  locationName,
  conditionLabel,
  timezone,
  selectedHour,
  heatIndex,
  windChill,
  visibilityMiles,
  elevation,
  errorMessage,
  scenario,
  onScenarioChange,
  comfortProfile,
  onComfortProfileChange,
  exertion,
  onExertionChange,
  duration,
  onDurationChange,
  colderAvailable,
  wetterAvailable,
  onResetAddedItems,
}: ForecastCardProps) {
  const ConditionIcon = getConditionIcon(selectedHour?.conditionCode)
  const formattedTime = formatLocalDateTime(selectedTime)
  const description = `${conditionLabel} - ${formattedTime}${timezone ? ` - ${timezone}` : ''}`

  const handleChange = (fn: () => void) => {
    onResetAddedItems()
    fn()
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">
          {status === 'loading' ? (
            <span className="inline-flex items-center gap-2">
              Loading
              <span className="loading-ellipsis" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </span>
          ) : (
            locationName
          )}
        </CardTitle>
        <CardDescription className={status === 'loading' ? 'opacity-0' : 'opacity-100'}>
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-spice-500/20 text-spice-100">
              <ConditionIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>{description}</span>
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* Setup controls */}
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

          {/* Divider */}
          <div className="border-t border-ink-200/10" />

          {/* Tuning controls */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-ink-50">Dial it in</h3>
              <p className="text-sm text-ink-100/70">
                Adjust these to match how you actually feel outside.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Scenario</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className={optionClass(scenario === 'now')}
                      onClick={() => handleChange(() => onScenarioChange('now'))}
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      className={optionClass(scenario === 'colder')}
                      onClick={() => handleChange(() => onScenarioChange('colder'))}
                      disabled={!colderAvailable}
                    >
                      10F colder
                    </button>
                    <button
                      type="button"
                      className={optionClass(scenario === 'wetter')}
                      onClick={() => handleChange(() => onScenarioChange('wetter'))}
                      disabled={!wetterAvailable}
                    >
                      Gets wet
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Effort level</p>
                  <div className="flex flex-col gap-2">
                    {exertionOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange(() => onExertionChange(option.value))}
                        className={optionClass(exertion === option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Trip length</p>
                  <div className="flex flex-col gap-2">
                    {durationOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange(() => onDurationChange(option.value))}
                        className={optionClass(duration === option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/30 p-4">
                <ComfortProfileControls
                  profile={comfortProfile}
                  onChange={(profile) => handleChange(() => onComfortProfileChange(profile))}
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-ink-200/10" />

          {/* Current conditions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-ink-50">Current conditions</h3>
              <p className="text-sm text-ink-100/70">
                A quick readout for the selected time so you can sanity-check your kit.
              </p>
            </div>

            {status === 'error' && (
              <div className="rounded-2xl border border-spice-400/40 bg-spice-500/10 p-4 text-sm text-spice-100">
                {errorMessage}
              </div>
            )}

            {status === 'loading' ? (
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Skeleton className="h-24" />
                  <Skeleton className="h-24" />
                </div>
              </div>
            ) : selectedHour ? (
              <ForecastSummaryMetrics
                selectedHour={selectedHour}
                heatIndex={heatIndex}
                windChill={windChill}
                visibilityMiles={visibilityMiles}
                elevation={elevation}
              />
            ) : (
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4 text-sm text-ink-100/70">
                Select a date/time within the next 7 days to see details.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
