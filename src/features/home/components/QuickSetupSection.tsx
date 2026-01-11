import { MapPin, Calendar } from 'lucide-react'
import type { SportType } from '@/lib/weather'

type QuickSetupSectionProps = {
  locationName: string
  sport: SportType
  selectedTime: string
  onLocationClick?: () => void
  onSportClick?: () => void
  onTimeClick?: () => void
}

export function QuickSetupSection({
  locationName,
  sport,
  selectedTime,
  onLocationClick,
  onSportClick,
  onTimeClick,
}: QuickSetupSectionProps) {
  // Format time for display
  const timeDate = new Date(selectedTime)
  const timeDisplay = timeDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  const timeTime = timeDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const sportLabel = sport === 'skiing' ? '⛷️ Skiing' : '🏃 Running'
  const sportColor =
    sport === 'skiing'
      ? 'from-pink-500/20 to-pink-600/20 border-pink-500/40 hover:border-pink-500/60'
      : 'from-indigo-500/20 to-indigo-600/20 border-indigo-500/40 hover:border-indigo-500/60'
  const sportIconColor = sport === 'skiing' ? 'text-pink-400' : 'text-indigo-400'

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Location Card */}
      <button
        onClick={onLocationClick}
        className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-5 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-indigo-300">
              Location
            </span>
          </div>
          <div className="space-y-1">
            <p className="line-clamp-2 text-base font-semibold text-slate-100 group-hover:text-white">
              {locationName}
            </p>
            <p className="text-xs text-slate-500">Click to change</p>
          </div>
        </div>
      </button>

      {/* Sport Card */}
      <button
        onClick={onSportClick}
        className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all duration-200 hover:shadow-lg ${sportColor}`}
      >
        <div
          className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 bg-gradient-to-br ${sport === 'skiing' ? 'from-pink-500/5 to-transparent' : 'from-indigo-500/5 to-transparent'}`}
        />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${sportIconColor}`}>{sport === 'skiing' ? '⛷️' : '🏃'}</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-slate-300">
              Activity
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-100 group-hover:text-white">
              {sportLabel}
            </p>
            <p className="text-xs text-slate-500">Click to change</p>
          </div>
        </div>
      </button>

      {/* Time Card */}
      <button
        onClick={onTimeClick}
        className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-800/40 p-5 transition-all duration-200 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 group-hover:text-emerald-300">
              When
            </span>
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-slate-100 group-hover:text-white">
              {timeDisplay}
            </p>
            <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300">
              {timeTime}
            </p>
          </div>
        </div>
      </button>
    </div>
  )
}
