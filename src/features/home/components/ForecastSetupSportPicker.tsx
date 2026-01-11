import type { SportType } from '@/lib/weather'

type ForecastSetupSportPickerProps = {
  sport: SportType
  onSportChange: (sport: SportType) => void
}

const SPORT_LABELS: Record<SportType, string> = {
  running: '🏃 Running',
  skiing: '⛷️ Skiing',
}

export function ForecastSetupSportPicker({ sport, onSportChange }: ForecastSetupSportPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {(['running', 'skiing'] as SportType[]).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSportChange(value)}
          className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm transition ${
            sport === value
              ? 'border-tide-300/70 bg-tide-500/15 text-ink-50'
              : 'border-ink-200/10 bg-ink-950/40 text-ink-100/70 hover:border-ink-200/30'
          }`}
        >
          {SPORT_LABELS[value]}
        </button>
      ))}
    </div>
  )
}
