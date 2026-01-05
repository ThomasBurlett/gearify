import { CalendarClock } from 'lucide-react'

import { Input } from '@/components/ui/input'

export type PresetHour = {
  label: string
  hour: number
}

type ForecastSetupTimePickerProps = {
  selectedTime: string
  onTimeChange: (value: string) => void
  onPreset: (hour: number) => void
  presetHours: PresetHour[]
}

export function ForecastSetupTimePicker({
  selectedTime,
  onTimeChange,
  onPreset,
  presetHours,
}: ForecastSetupTimePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Input
          id="forecast-time"
          type="datetime-local"
          step={3600}
          value={selectedTime}
          onChange={(event) => onTimeChange(event.target.value)}
          className="h-11 pr-12"
        />
        <button
          type="button"
          aria-label="Open date and time picker"
          onClick={() => {
            const input = document.getElementById('forecast-time') as HTMLInputElement | null
            input?.showPicker?.()
            input?.focus()
          }}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg border border-ink-200/20 bg-ink-950/50 text-ink-50 transition hover:border-tide-300/60 hover:bg-ink-900/70"
        >
          <CalendarClock className="h-4 w-4 text-ink-50" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {presetHours.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onPreset(preset.hour)}
            className="rounded-lg border border-ink-200/20 px-2 py-2 text-xs text-ink-100/70 transition hover:border-tide-300/50 hover:text-ink-50"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
