import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Mountain,
  Sun,
  ThermometerSun,
  Wind,
} from 'lucide-react'

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
  elevation: number | null
  errorMessage: string
}

const conditionIconMap: Array<{ icon: typeof Sun; codes: number[] }> = [
  { icon: Sun, codes: [0, 1] },
  { icon: CloudSun, codes: [2] },
  { icon: Cloud, codes: [3] },
  { icon: CloudFog, codes: [45, 48] },
  { icon: CloudDrizzle, codes: [51, 53, 55] },
  { icon: CloudRain, codes: [61, 63, 65, 80, 81, 82] },
  { icon: CloudSnow, codes: [66, 67, 71, 73, 75, 77, 85, 86] },
  { icon: CloudLightning, codes: [95, 96, 99] },
]

const getConditionIcon = (code?: number | null) => {
  if (code === null || code === undefined) return Cloud
  const match = conditionIconMap.find((entry) => entry.codes.includes(code))
  return match?.icon ?? Cloud
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
  elevation,
  errorMessage,
}: ForecastSummaryCardProps) {
  const elevationFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })
  const ConditionIcon = getConditionIcon(selectedHour?.conditionCode)
  const formattedTime = (() => {
    const parsed = new Date(selectedTime)
    if (Number.isNaN(parsed.getTime())) {
      return selectedTime
    }
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(parsed)
  })()

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
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-spice-500/20 text-spice-100">
              <ConditionIcon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>{`${conditionLabel} - ${formattedTime}${timezone ? ` - ${timezone}` : ''}`}</span>
          </div>
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
                <div className="mt-2 flex items-center gap-3">
                  <ThermometerSun className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="font-display text-3xl text-ink-50">
                    {Math.round(selectedHour.temperature)}F
                  </p>
                </div>
                <p className="text-sm text-ink-100/70">
                  Feels like {Math.round(selectedHour.feelsLike)}F
                </p>
                {heatIndex !== null && (
                  <p className="text-sm text-ink-100/70">Heat index {Math.round(heatIndex)}F</p>
                )}
                {windChill !== null && (
                  <p className="text-sm text-ink-100/70">Wind chill {Math.round(windChill)}F</p>
                )}
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Wind</p>
                <div className="mt-2 flex items-center gap-3">
                  <Wind className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="font-display text-3xl text-ink-50">
                    {Math.round(selectedHour.windSpeed)} mph
                  </p>
                </div>
                <p className="text-sm text-ink-100/70">
                  Gusts {Math.round(selectedHour.windGusts)} mph
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Humidity</p>
                <div className="mt-2 flex items-center gap-3">
                  <Droplets className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="text-lg text-ink-50">{Math.round(selectedHour.humidity)}%</p>
                </div>
                <p className="text-sm text-ink-100/70">
                  Dew point {Math.round(selectedHour.dewPoint)}F
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Precipitation</p>
                <div className="mt-2 flex items-center gap-3">
                  <CloudRain className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="text-lg text-ink-50">
                    {Math.round(selectedHour.precipitationChance)}% chance
                  </p>
                </div>
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
                <div className="mt-2 flex items-center gap-3">
                  <CloudSun className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="text-lg text-ink-50">
                    {Math.round(selectedHour.cloudCover)}% cloud cover
                  </p>
                </div>
                <p className="text-sm text-ink-100/70">
                  Visibility {visibilityMiles ? visibilityMiles.toFixed(1) : '0.0'} mi
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">Elevation</p>
                <div className="mt-2 flex items-center gap-3">
                  <Mountain className="h-6 w-6 text-tide-200" aria-hidden="true" />
                  <p className="text-lg text-ink-50">
                    {elevation !== null
                      ? `${elevationFormatter.format(Math.round(elevation * 3.28084))} ft`
                      : 'Elevation n/a'}
                  </p>
                </div>
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
