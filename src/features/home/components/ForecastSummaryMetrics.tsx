import type { ReactNode } from 'react'
import { CloudRain, CloudSun, Droplets, Mountain, ThermometerSun, Wind } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { formatElevationFeet } from '@/features/home/utils/formatters'
import type { SelectedHour } from '@/features/home/types'

type ForecastSummaryMetricsProps = {
  selectedHour: SelectedHour
  heatIndex: number | null
  windChill: number | null
  visibilityMiles: number | null
  elevation: number | null
}

type ForecastMetricCardProps = {
  label: string
  icon: LucideIcon
  primary: string
  primaryClassName?: string
  children?: ReactNode
}

function ForecastMetricCard({
  label,
  icon: Icon,
  primary,
  primaryClassName,
  children,
}: ForecastMetricCardProps) {
  const primaryClass = ['text-lg text-ink-50', primaryClassName].filter(Boolean).join(' ')

  return (
    <div className="rounded-2xl border border-ink-200/10 bg-ink-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-ink-100/60">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <Icon className="h-6 w-6 text-tide-200" aria-hidden="true" />
        <p className={primaryClass}>{primary}</p>
      </div>
      {children}
    </div>
  )
}

export function ForecastSummaryMetrics({
  selectedHour,
  heatIndex,
  windChill,
  visibilityMiles,
  elevation,
}: ForecastSummaryMetricsProps) {
  const elevationLabel = formatElevationFeet(elevation) ?? 'Elevation n/a'
  const visibilityLabel = visibilityMiles ? visibilityMiles.toFixed(1) : '0.0'

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <ForecastMetricCard
          label="Temp"
          icon={ThermometerSun}
          primary={`${Math.round(selectedHour.temperature)}F`}
          primaryClassName="font-display text-3xl"
        >
          <p className="text-sm text-ink-100/70">
            Feels like {Math.round(selectedHour.feelsLike)}F
          </p>
          {heatIndex !== null && (
            <p className="text-sm text-ink-100/70">Heat index {Math.round(heatIndex)}F</p>
          )}
          {windChill !== null && (
            <p className="text-sm text-ink-100/70">Wind chill {Math.round(windChill)}F</p>
          )}
        </ForecastMetricCard>

        <ForecastMetricCard
          label="Wind"
          icon={Wind}
          primary={`${Math.round(selectedHour.windSpeed)} mph`}
          primaryClassName="font-display text-3xl"
        >
          <p className="text-sm text-ink-100/70">Gusts {Math.round(selectedHour.windGusts)} mph</p>
        </ForecastMetricCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ForecastMetricCard
          label="Humidity"
          icon={Droplets}
          primary={`${Math.round(selectedHour.humidity)}%`}
        >
          <p className="text-sm text-ink-100/70">Dew point {Math.round(selectedHour.dewPoint)}F</p>
        </ForecastMetricCard>

        <ForecastMetricCard
          label="Precipitation"
          icon={CloudRain}
          primary={`${Math.round(selectedHour.precipitationChance)}% chance`}
        >
          <p className="text-sm text-ink-100/70">{selectedHour.precipitation.toFixed(2)} in/hr</p>
        </ForecastMetricCard>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ForecastMetricCard
          label="Sky + visibility"
          icon={CloudSun}
          primary={`${Math.round(selectedHour.cloudCover)}% cloud cover`}
        >
          <p className="text-sm text-ink-100/70">Visibility {visibilityLabel} mi</p>
        </ForecastMetricCard>

        <ForecastMetricCard label="Elevation" icon={Mountain} primary={elevationLabel} />
      </div>
    </div>
  )
}
