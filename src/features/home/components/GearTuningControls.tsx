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
    'min-h-[40px] rounded-lg border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-50',
    isSelected
      ? 'border-tide-300/60 bg-ink-950/60 text-ink-50'
      : 'text-ink-100/70 hover:border-tide-300/50 hover:text-ink-50'
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
            <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Scenario</p>
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
            <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Effort level</p>
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
            <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Trip length</p>
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
