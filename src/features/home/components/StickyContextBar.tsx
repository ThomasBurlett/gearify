import { MapPin, Calendar } from 'lucide-react'
import type { SportType } from '@/lib/weather'

type StickyContextBarProps = {
  locationName: string
  sport: SportType
  selectedTime: string
  onLocationClick?: () => void
  onSportClick?: () => void
  onTimeClick?: () => void
}

export function StickyContextBar({
  locationName,
  sport,
  selectedTime,
  onLocationClick,
  onSportClick,
  onTimeClick,
}: StickyContextBarProps) {
  // Format time for display
  const timeDate = new Date(selectedTime)
  const timeDisplay = timeDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const sportLabel = sport === 'skiing' ? '⛷️ Skiing' : '🏃 Running'

  return (
    <div className="sticky top-0 z-40 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-md shadow-lg shadow-black/20">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-6 py-3">
        {/* Left: Context items */}
        <div className="flex flex-1 items-center gap-4 min-w-0">
          {/* Location */}
          <button
            onClick={onLocationClick}
            className="group flex flex-1 items-center gap-2 rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-2 transition-all hover:border-indigo-500/40 hover:bg-indigo-900/20 md:flex-none md:basis-auto"
            title="Click to change location"
          >
            <MapPin className="h-4 w-4 shrink-0 text-indigo-400 transition-colors group-hover:text-indigo-300" />
            <span className="truncate text-xs font-medium text-slate-200 group-hover:text-slate-100 md:whitespace-nowrap">
              {locationName}
            </span>
          </button>

          {/* Sport */}
          <button
            onClick={onSportClick}
            className="hidden items-center gap-2 rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-2 transition-all hover:border-pink-500/40 hover:bg-pink-900/20 md:flex"
            title="Click to change sport"
          >
            <span className="text-sm font-medium text-slate-200 transition-colors hover:text-slate-100">
              {sportLabel}
            </span>
          </button>

          {/* Time */}
          <button
            onClick={onTimeClick}
            className="hidden items-center gap-2 rounded-lg border border-slate-700/30 bg-slate-800/40 px-3 py-2 transition-all hover:border-emerald-500/40 hover:bg-emerald-900/20 md:flex"
            title="Click to change time"
          >
            <Calendar className="h-4 w-4 shrink-0 text-emerald-400 transition-colors hover:text-emerald-300" />
            <span className="whitespace-nowrap text-xs font-medium text-slate-200 transition-colors hover:text-slate-100">
              {timeDisplay}
            </span>
          </button>
        </div>

      </div>
    </div>
  )
}
