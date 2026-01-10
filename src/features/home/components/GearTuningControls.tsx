import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ComfortProfileControls } from '@/features/home/components/ComfortProfileControls'
import { cn } from '@/lib/utils'
import type { ComfortProfile, ExertionLevel, TripDuration } from '@/lib/gear'

const exertionOptions: Array<{ value: ExertionLevel; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'steady', label: 'Steady' },
  { value: 'hard', label: 'Hard' },
]

const durationOptions: Array<{ value: TripDuration; label: string }> = [
  { value: 'short', label: '< 1h' },
  { value: 'medium', label: '1-3h' },
  { value: 'long', label: '3h+' },
]

type Scenario = 'now' | 'colder' | 'wetter'

type GearTuningControlsProps = {
  scenario: Scenario
  onScenarioChange: (scenario: Scenario) => void
  comfortProfile: ComfortProfile
  onComfortProfileChange: (profile: ComfortProfile) => void
  exertion: ExertionLevel
  onExertionChange: (value: ExertionLevel) => void
  duration: TripDuration
  onDurationChange: (value: TripDuration) => void
  colderAvailable: boolean
  wetterAvailable: boolean
  onResetAddedItems: () => void
}

function optionClass(isSelected: boolean) {
  return cn(
    'min-h-[40px] rounded-lg border px-4 py-2 text-xs font-medium uppercase tracking-[0.15em] transition shadow-sm disabled:pointer-events-none disabled:opacity-40',
    isSelected
      ? 'border-indigo-500/50 bg-indigo-900/40 text-indigo-300'
      : 'border-slate-600/50 bg-slate-800/60 text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-900/30'
  )
}

export function GearTuningControls({
  scenario,
  onScenarioChange,
  comfortProfile,
  onComfortProfileChange,
  exertion,
  onExertionChange,
  duration,
  onDurationChange,
  colderAvailable,
  wetterAvailable,
  onResetAddedItems,
}: GearTuningControlsProps) {
  const handleChange = (fn: () => void) => {
    onResetAddedItems()
    fn()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Dial it in</CardTitle>
        <CardDescription>Adjust these to match how you actually feel outside.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Scenario</p>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              <button
                type="button"
                className={cn(optionClass(scenario === 'now'), 'w-full sm:w-auto')}
                onClick={() => handleChange(() => onScenarioChange('now'))}
              >
                Now
              </button>
              <button
                type="button"
                className={cn(optionClass(scenario === 'colder'), 'w-full sm:w-auto')}
                onClick={() => handleChange(() => onScenarioChange('colder'))}
                disabled={!colderAvailable}
              >
                10F colder
              </button>
              <button
                type="button"
                className={cn(optionClass(scenario === 'wetter'), 'w-full sm:w-auto')}
                onClick={() => handleChange(() => onScenarioChange('wetter'))}
                disabled={!wetterAvailable}
              >
                Gets wet
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Effort level</p>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              {exertionOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange(() => onExertionChange(option.value))}
                  className={cn(optionClass(exertion === option.value), 'w-full sm:w-auto')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trip length</p>
            <div className="grid gap-2 sm:flex sm:flex-wrap">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleChange(() => onDurationChange(option.value))}
                  className={cn(optionClass(duration === option.value), 'w-full sm:w-auto')}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <ComfortProfileControls
              profile={comfortProfile}
              onChange={(profile) => handleChange(() => onComfortProfileChange(profile))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
