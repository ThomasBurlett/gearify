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
      return 'h-64 md:h-auto'
    case 'medium':
      return 'h-56 md:h-56'
    case 'small':
      return 'h-56 md:h-56'
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
  // Special handling for temperature card (large size)
  if (label === 'Temperature' && size === 'large' && value !== null) {
    const tempValue = typeof value === 'string' ? parseInt(value) : value
    const isCold = tempValue < 40
    const isHot = tempValue > 75
    const isWarm = tempValue >= 60 && tempValue <= 75

    // Calculate gradient position (0-100% based on temperature scale)
    // Scale: -20°F (0%) to 105°F (100%) - supports Utah's extreme temps
    const minTemp = -20
    const maxTemp = 105
    const gradientPosition = Math.max(0, Math.min(100, ((tempValue - minTemp) / (maxTemp - minTemp)) * 100))

    return (
      <div
        className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}
      >
        {/* Gradient background overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-slate-800/40 to-red-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="space-y-0.5 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            </div>
            <Icon className="h-5 w-5 shrink-0 text-indigo-400" />
          </div>

          {/* Main Temperature Display */}
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            {/* Large Temperature Value */}
            <div className="flex items-baseline gap-1">
              <span className="font-display text-6xl font-bold bg-gradient-to-r from-slate-50 via-slate-100 to-indigo-200 bg-clip-text text-transparent leading-none">
                {tempValue}
              </span>
              {unit && <span className="text-xl font-semibold text-slate-400 mb-1">{unit}</span>}
            </div>

            {/* Thermal Spectrum Gauge */}
            <div className="space-y-3">
              <div className="relative h-5 w-full rounded-full overflow-hidden shadow-lg" style={{
                background: 'linear-gradient(to right, rgb(15, 23, 42) 0%, rgb(30, 58, 138) 15%, rgb(37, 99, 235) 35%, rgb(59, 130, 246) 50%, rgb(34, 197, 94) 65%, rgb(251, 191, 36) 80%, rgb(239, 68, 68) 92%, rgb(153, 27, 27) 100%)'
              }}>
                {/* Enhanced Position indicator */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-2xl transition-all duration-500 ease-out border-2 border-slate-950 pointer-events-none"
                  style={{
                    left: `${gradientPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 16px rgba(255, 255, 255, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </div>
            </div>

            {/* Context Info */}
            <div className="space-y-3 pt-3 border-t border-slate-700/50">
              {secondary && (
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isCold ? 'bg-blue-400' : isHot ? 'bg-red-400' : 'bg-emerald-400'}`} />
                  <p className="text-xs font-medium text-slate-300">{secondary}</p>
                </div>
              )}

              {/* Quick comfort indicator */}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${isCold ? 'bg-blue-500/25 text-blue-200' : isHot ? 'bg-red-500/25 text-red-200' : 'bg-emerald-500/25 text-emerald-200'}`}>
                  {isCold ? 'Very Cold' : isHot ? 'Hot' : isWarm ? 'Mild' : 'Cool'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Wind Speed Card with directional gauge
  if (label === 'Wind Speed' && value !== null) {
    const windValue = typeof value === 'string' ? parseFloat(value) : value
    const gustValue = typeof secondary === 'string' ? parseInt(secondary.match(/\d+/)?.[0] || '0') : 0
    const isCalm = windValue < 5
    const isLight = windValue < 12
    const isModerate = windValue < 20
    const isStrong = windValue < 30
    // Position on 0-35 mph scale
    const windPosition = Math.max(0, Math.min(100, (windValue / 35) * 100))

    return (
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}>
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-slate-800/40 to-slate-800/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <Icon className="h-5 w-5 shrink-0 text-rose-400" />
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-rose-300">{Math.round(windValue)}</span>
              {unit && <span className="text-lg font-semibold text-slate-400">{unit}</span>}
            </div>

            {/* Wind Speed Gauge */}
            <div className="space-y-3">
              <div className="relative h-3 w-full rounded-full overflow-hidden shadow-lg" style={{
                background: 'linear-gradient(to right, rgb(34, 197, 94) 0%, rgb(59, 130, 246) 30%, rgb(251, 191, 36) 60%, rgb(239, 68, 68) 85%, rgb(153, 27, 27) 100%)'
              }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500 ease-out border-2 border-slate-900"
                  style={{
                    left: `${windPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 12px rgba(248, 113, 113, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
                <span>Calm</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Wind Context */}
            <div className="space-y-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isCalm ? 'bg-emerald-400' : isLight ? 'bg-blue-400' : isModerate ? 'bg-amber-400' : 'bg-rose-400'}`} />
                <p className="text-xs font-medium text-slate-300">Gusts {Math.round(gustValue)} {unit}</p>
              </div>
              <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${isCalm ? 'bg-emerald-500/25 text-emerald-200' : isLight ? 'bg-blue-500/25 text-blue-200' : isModerate ? 'bg-amber-500/25 text-amber-200' : 'bg-rose-500/25 text-rose-200'}`}>
                {isCalm ? 'Calm' : isLight ? 'Light' : isModerate ? 'Moderate' : isStrong ? 'Strong' : 'Very Strong'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Precipitation Card with circular gauge
  if (label === 'Precipitation' && value !== null) {
    const precipValue = typeof value === 'string' ? parseInt(value) : value
    const isDry = precipValue < 10
    const isScattered = precipValue < 30
    const isRainy = precipValue < 70
    // Circular progress
    const circumference = 2 * Math.PI * 42
    const strokeDashoffset = circumference - (precipValue / 100) * circumference

    return (
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-slate-800/40 to-slate-800/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <Icon className="h-5 w-5 shrink-0 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center flex-1 py-2">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(71, 85, 105)" strokeWidth="1.5" opacity="0.25" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="url(#precipGradient)"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="precipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                    <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                    <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-display text-2xl font-bold text-emerald-300">{precipValue}</span>
                <span className="text-xs text-slate-400 font-medium">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${isDry ? 'bg-emerald-500/25 text-emerald-200' : isScattered ? 'bg-blue-500/25 text-blue-200' : isRainy ? 'bg-amber-500/25 text-amber-200' : 'bg-rose-500/25 text-rose-200'}`}>
              {isDry ? 'Dry' : isScattered ? 'Scattered' : isRainy ? 'Showers' : 'Heavy Rain'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Humidity Card with concentric rings
  if (label === 'Humidity' && value !== null) {
    const humidValue = typeof value === 'string' ? parseInt(value) : value
    const isDry = humidValue < 30
    const isComfortable = humidValue < 60
    const isHumid = humidValue < 80

    return (
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-slate-800/40 to-slate-800/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <Icon className="h-5 w-5 shrink-0 text-amber-400" />
          </div>

          <div className="flex items-center justify-center flex-1 py-2">
            <div className="relative w-16 h-16">
              {/* Concentric circles showing humidity level */}
              <svg className="w-16 h-16 absolute inset-0 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                <circle cx="50" cy="50" r="28" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="rgb(100, 116, 139)" strokeWidth="0.5" opacity="0.3" />
                {/* Humidity fill */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={isDry ? 'rgb(251, 191, 36)' : isComfortable ? 'rgb(34, 197, 94)' : isHumid ? 'rgb(59, 130, 246)' : 'rgb(239, 68, 68)'}
                  strokeWidth="2"
                  strokeDasharray={`${(humidValue / 100) * 264} 264`}
                  strokeLinecap="round"
                  opacity="0.6"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-xl font-bold text-amber-300">{humidValue}</span>
                <span className="text-xs text-slate-400 font-medium">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${isDry ? 'bg-amber-500/25 text-amber-200' : isComfortable ? 'bg-emerald-500/25 text-emerald-200' : isHumid ? 'bg-blue-500/25 text-blue-200' : 'bg-rose-500/25 text-rose-200'}`}>
              {isDry ? 'Dry' : isComfortable ? 'Comfortable' : isHumid ? 'Humid' : 'Very Humid'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Visibility Card with horizontal bar
  if (label === 'Visibility' && value !== null) {
    const visValue = typeof value === 'string' ? parseFloat(value) : value
    const isExcellent = visValue > 10
    const isGood = visValue > 5
    const isLimited = visValue > 1
    // Scale 0-15 miles
    const visPosition = Math.max(0, Math.min(100, (visValue / 15) * 100))

    return (
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-slate-800/40 to-slate-800/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <Icon className="h-5 w-5 shrink-0 text-indigo-400" />
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-5xl font-bold text-indigo-300">{visValue.toFixed(1)}</span>
              {unit && <span className="text-lg font-semibold text-slate-400">{unit}</span>}
            </div>

            {/* Visibility Gauge */}
            <div className="space-y-3">
              <div className="relative h-3 w-full rounded-full overflow-hidden shadow-lg" style={{
                background: 'linear-gradient(to right, rgb(153, 27, 27) 0%, rgb(239, 68, 68) 25%, rgb(251, 191, 36) 50%, rgb(59, 130, 246) 75%, rgb(34, 197, 94) 100%)'
              }}>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500 ease-out border-2 border-slate-900"
                  style={{
                    left: `${visPosition}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 12px rgba(99, 102, 241, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </div>
              <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
                <span>Poor</span>
                <span>Good</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${isExcellent ? 'bg-emerald-500/25 text-emerald-200' : isGood ? 'bg-blue-500/25 text-blue-200' : isLimited ? 'bg-amber-500/25 text-amber-200' : 'bg-rose-500/25 text-rose-200'}`}>
                {isExcellent ? 'Excellent' : isGood ? 'Good' : isLimited ? 'Limited' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Elevation Card with vertical indicator
  if (label === 'Elevation' && value !== null) {
    const elevValue = typeof value === 'string' ? parseInt(value) : value
    // Scale 0-14000 feet (common Utah range)
    const elevPosition = Math.max(0, Math.min(100, (elevValue / 14000) * 100))
    const isLow = elevValue < 3000
    const isMid = elevValue < 7000
    const isHigh = elevValue < 10000

    return (
      <div className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-6 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}>
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-slate-800/40 to-slate-800/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative z-10 flex h-full flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
            <Icon className="h-5 w-5 shrink-0 text-amber-400" />
          </div>

          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-amber-300">{(elevValue / 1000).toFixed(1)}</span>
              <span className="text-sm font-semibold text-slate-400">k ft</span>
            </div>

            {/* Elevation Vertical Gauge */}
            <div className="flex-1 flex flex-col justify-center gap-2 min-h-20 py-2">
              <div className="relative h-32 w-7 rounded-full overflow-hidden shadow-lg mx-auto" style={{
                background: 'linear-gradient(to top, rgb(239, 68, 68) 0%, rgb(251, 191, 36) 25%, rgb(59, 130, 246) 50%, rgb(34, 197, 94) 75%, rgb(15, 23, 42) 100%)'
              }}>
                <div
                  className="absolute left-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-500 ease-out border-2 border-slate-900"
                  style={{
                    bottom: `${elevPosition}%`,
                    transform: 'translate(-50%, 50%)',
                    boxShadow: '0 0 12px rgba(251, 191, 36, 0.5), 0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                />
              </div>
            </div>

            <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${isLow ? 'bg-emerald-500/25 text-emerald-200' : isMid ? 'bg-amber-500/25 text-amber-200' : isHigh ? 'bg-blue-500/25 text-blue-200' : 'bg-rose-500/25 text-rose-200'}`}>
              {isLow ? 'Low' : isMid ? 'Mid' : isHigh ? 'High' : 'Very High'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Default card for any other metrics
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-5 transition-all duration-300 ${getSizeClasses(size)} ${getCardHeight(size)} hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/30`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100`} style={{
        backgroundImage: accentColor === 'pink' ? 'linear-gradient(to bottom right, rgba(244, 63, 94, 0.1), transparent)' :
                        accentColor === 'emerald' ? 'linear-gradient(to bottom right, rgba(16, 185, 129, 0.1), transparent)' :
                        accentColor === 'amber' ? 'linear-gradient(to bottom right, rgba(217, 119, 6, 0.1), transparent)' :
                        'linear-gradient(to bottom right, rgba(99, 102, 241, 0.1), transparent)'
      }} />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
          </div>
          <Icon className={`h-5 w-5 shrink-0 ${accentColor === 'pink' ? 'text-rose-400' : accentColor === 'emerald' ? 'text-emerald-400' : accentColor === 'amber' ? 'text-amber-400' : 'text-indigo-400'}`} />
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
