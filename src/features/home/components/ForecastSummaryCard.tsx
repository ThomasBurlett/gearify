import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SelectedHour, LoadStatus } from '@/features/home/types'

type ForecastSummaryCardProps = {
  status: LoadStatus
  locationName: string
  selectedTime: string
  conditionLabel: string
  timezone?: string
  selectedHour: SelectedHour | null
  heatIndex: number | null
  windChill: number | null
  visibilityMiles: number | null
  errorMessage: string
}

export function ForecastSummaryCard({
  status,
  locationName,
  selectedTime,
  conditionLabel,
  timezone,
  selectedHour,
  heatIndex,
  windChill,
  visibilityMiles,
  errorMessage,
}: ForecastSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <Badge variant="warm">Forecast summary</Badge>
        <CardTitle className="text-2xl">
          {status === 'loading' ? (
            <span className="inline-flex items-center gap-2">
              Updating location
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
          {selectedTime} - {conditionLabel}
          {timezone ? ` - ${timezone}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
            <Skeleton className="h-14" />
          </div>
        ) : selectedHour ? (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Temp</p>
                <p className="mt-2 font-display text-3xl text-ink-50">
                  {Math.round(selectedHour.temperature)}F
                </p>
                <p className="text-sm text-ink-100/70">
                  Feels like {Math.round(selectedHour.feelsLike)}F
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Wind</p>
                <p className="mt-2 font-display text-3xl text-ink-50">
                  {Math.round(selectedHour.windSpeed)} mph
                </p>
                <p className="text-sm text-ink-100/70">
                  Gusts {Math.round(selectedHour.windGusts)} mph
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Humidity</p>
                <p className="mt-2 text-lg text-ink-50">{Math.round(selectedHour.humidity)}%</p>
                <p className="text-sm text-ink-100/70">
                  Dew point {Math.round(selectedHour.dewPoint)}F
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Precipitation</p>
                <p className="mt-2 text-lg text-ink-50">
                  {Math.round(selectedHour.precipitationChance)}% chance
                </p>
                <p className="text-sm text-ink-100/70">
                  {selectedHour.precipitation.toFixed(2)} in/hr
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">
                  Sky + visibility
                </p>
                <p className="mt-2 text-lg text-ink-50">
                  {Math.round(selectedHour.cloudCover)}% cloud cover
                </p>
                <p className="text-sm text-ink-100/70">
                  Visibility {visibilityMiles ? visibilityMiles.toFixed(1) : '0.0'} mi
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Pressure</p>
                <p className="mt-2 text-lg text-ink-50">{Math.round(selectedHour.pressure)} hPa</p>
                <p className="text-sm text-ink-100/70">
                  {heatIndex ? `Heat index ${heatIndex}F` : 'Heat index n/a'}
                </p>
                <p className="text-sm text-ink-100/70">
                  {windChill ? `Wind chill ${windChill}F` : 'Wind chill n/a'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4 text-sm text-ink-100/70">
            Select a date/time within the next 7 days to see details.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
