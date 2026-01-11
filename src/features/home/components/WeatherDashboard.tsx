import { Cloud, CloudRain, Eye, Gauge, Droplets, Wind, Loader2 } from 'lucide-react'
import type { SelectedHour } from '@/features/home/types'

type WeatherDashboardProps = {
  selectedHour: SelectedHour | null
  heatIndex: number | null
  windChill: number | null
  visibilityMiles: number | null
  elevation: number | null
  isLoading?: boolean
}

function getMetricSize(type: 'temp' | 'wind' | 'precip' | 'humidity' | 'visibility' | 'elevation', value: number | null): 'large' | 'medium' | 'small' {
  if (value === null) return 'small'

  switch (type) {
    case 'temp':
      return 'large' // Always large
    case 'wind':
      if (value > 15) return 'large'
      if (value > 8) return 'medium'
      return 'small'
    case 'precip':
      if (value > 30) return 'large'
      if (value > 10) return 'medium'
      return 'small'
    case 'humidity':
      return 'small' // Always small
    case 'visibility':
      if (value < 3) return 'medium'
      return 'small'
    case 'elevation':
      return 'small' // Always small
    default:
      return 'small'
  }
}

function getSizeClasses(size: 'large' | 'medium' | 'small'): string {
  switch (size) {
    case 'large':
      return 'md:col-span-2 md:row-span-2'
    case 'medium':
      return 'md:col-span-1 md:row-span-1'
    case 'small':
      return 'md:col-span-1 md:row-span-1'
  }
}

function getCardHeight(size: 'large' | 'medium' | 'small'): string {
  switch (size) {
    case 'large':
      return 'h-48 md:h-auto'
    case 'medium':
      return 'h-32 md:h-32'
    case 'small':
      return 'h-28 md:h-28'
  }
}

function MetricCard({
  icon: Icon,
  label,
  value,
  unit,
  accentColor = 'indigo',
  size = 'small',
  secondary,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null
  unit?: string
  accentColor?: 'indigo' | 'pink' | 'emerald' | 'amber'
  size?: 'large' | 'medium' | 'small'
  secondary?: string
}) {
  const colorClasses = {
    indigo: 'text-indigo-400 border-indigo-500/40 from-indigo-500/10',
    pink: 'text-pink-400 border-pink-500/40 from-pink-500/10',
    emerald: 'text-emerald-400 border-emerald-500/40 from-emerald-500/10',
    amber: 'text-amber-400 border-amber-500/40 from-amber-500/10',
  }

  const iconColorClass = colorClasses[accentColor]

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-5 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[accentColor].split(' ')[2]} to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          </div>
          <Icon className={`h-5 w-5 shrink-0 ${iconColorClass}`} />
        </div>

        {/* Value */}
        <div className="space-y-1">
          {value !== null ? (
            <>
              <p className="flex items-baseline gap-1 text-2xl font-bold text-slate-100 md:text-3xl">
                {value}
                {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
              </p>
              {secondary && <p className="text-xs text-slate-400">{secondary}</p>}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Loading...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function WeatherDashboard({
  selectedHour,
  heatIndex,
  windChill,
  visibilityMiles,
  elevation,
  isLoading,
}: WeatherDashboardProps) {
  if (!selectedHour || isLoading) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-8 text-center">
        <Loader2 className="mb-2 h-5 w-5 animate-spin text-slate-400 mx-auto" />
        <p className="text-sm text-slate-400">Loading weather data...</p>
      </div>
    )
  }

  const temp = selectedHour.temperature
  const wind = selectedHour.windSpeed
  const precip = selectedHour.precipitation
  const humidity = selectedHour.humidity
  const visibility = visibilityMiles

  const tempSize = getMetricSize('temp', temp)
  const windSize = getMetricSize('wind', wind)
  const precipSize = getMetricSize('precip', precip)
  const humiditySize = getMetricSize('humidity', humidity)
  const visibilitySize = getMetricSize('visibility', visibility)
  const elevationSize = getMetricSize('elevation', elevation ?? 0)

  // Determine what feels like (heat index for warm, wind chill for cold)
  const feelsLikeValue = heatIndex ?? windChill ?? temp
  const feelsLikeType = heatIndex ? 'heat index' : windChill ? 'wind chill' : 'temperature'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-min">
        {/* Temperature (Large) */}
        <MetricCard
          icon={Cloud}
          label="Temperature"
          value={Math.round(temp)}
          unit="°F"
          accentColor="indigo"
          size={tempSize}
          secondary={`Feels like ${Math.round(feelsLikeValue)}°F (${feelsLikeType})`}
        />

        {/* Wind Speed (Dynamic) */}
        <MetricCard
          icon={Wind}
          label="Wind Speed"
          value={Math.round(wind)}
          unit="mph"
          accentColor="pink"
          size={windSize}
          secondary={`Gusts: ${Math.round(selectedHour.windGusts ?? wind)} mph`}
        />

        {/* Precipitation (Dynamic) */}
        <MetricCard
          icon={CloudRain}
          label="Precipitation"
          value={Math.round(precip)}
          unit="%"
          accentColor="emerald"
          size={precipSize}
          secondary={`0.0" possible`}
        />

        {/* Humidity */}
        <MetricCard
          icon={Droplets}
          label="Humidity"
          value={Math.round(humidity)}
          unit="%"
          accentColor="amber"
          size={humiditySize}
        />

        {/* Visibility (Dynamic) */}
        {visibility !== null && (
          <MetricCard
            icon={Eye}
            label="Visibility"
            value={visibility.toFixed(1)}
            unit="mi"
            accentColor="indigo"
            size={visibilitySize}
          />
        )}

        {/* Elevation */}
        {elevation !== null && (
          <MetricCard
            icon={Gauge}
            label="Elevation"
            value={Math.round(elevation)}
            unit="ft"
            accentColor="amber"
            size={elevationSize}
          />
        )}
      </div>

      {/* Info message if no selection */}
      {!selectedHour && (
        <div className="rounded-2xl border border-dashed border-slate-700/50 bg-slate-800/20 p-6 text-center">
          <p className="text-sm text-slate-400">
            Select a date and time to view weather conditions.
          </p>
        </div>
      )}
    </div>
  )
}
