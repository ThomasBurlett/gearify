import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type {
  ComfortProfile,
  PrecipitationPreference,
  TemperaturePreference,
  WindSensitivity,
} from '@/lib/gear'

type ComfortProfileControlsProps = {
  profile: ComfortProfile
  onChange: (profile: ComfortProfile) => void
}

const temperatureOptions: Array<{ value: TemperaturePreference; label: string }> = [
  { value: 'runs_cold', label: 'Runs cold' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'runs_hot', label: 'Runs hot' },
]

const windOptions: Array<{ value: WindSensitivity; label: string }> = [
  { value: 'low', label: 'Windproof' },
  { value: 'normal', label: 'Balanced' },
  { value: 'high', label: 'Wind-sensitive' },
]

const precipitationOptions: Array<{ value: PrecipitationPreference; label: string }> = [
  { value: 'avoid', label: 'Avoid rain' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'okay', label: 'Okay with wet' },
]

function optionClass(isSelected: boolean) {
  return cn(
    'min-h-[40px] rounded-lg border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] transition',
    isSelected
      ? 'border-tide-300/60 bg-ink-950/60 text-ink-50'
      : 'text-ink-100/70 hover:border-tide-300/50 hover:text-ink-50'
  )
}

export function ComfortProfileControls({ profile, onChange }: ComfortProfileControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Temperature comfort</Label>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {temperatureOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...profile, temperaturePreference: option.value })}
              className={cn(
                optionClass(profile.temperaturePreference === option.value),
                'w-full sm:w-auto'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Wind tolerance</Label>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {windOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...profile, windSensitivity: option.value })}
              className={cn(
                optionClass(profile.windSensitivity === option.value),
                'w-full sm:w-auto'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Precipitation preference</Label>
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {precipitationOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ ...profile, precipitationPreference: option.value })}
              className={cn(
                optionClass(profile.precipitationPreference === option.value),
                'w-full sm:w-auto'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
