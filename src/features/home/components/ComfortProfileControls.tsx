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
    'min-h-[40px] rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition shadow-sm',
    isSelected
      ? 'border-indigo-500/50 bg-indigo-900/40 text-indigo-300'
      : 'border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-900/30'
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
