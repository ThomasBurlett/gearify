import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatLocalDateTime } from '@/features/home/utils/formatters'
import { getConditionIcon } from '@/features/home/utils/conditionIcons'
import type { LoadStatus } from '@/features/home/types'

type ForecastSummaryHeaderProps = {
  status: LoadStatus
  locationName: string
  conditionLabel: string
  selectedTime: string
  timezone?: string
  conditionCode?: number | null
}

export function ForecastSummaryHeader({
  status,
  locationName,
  conditionLabel,
  selectedTime,
  timezone,
  conditionCode,
}: ForecastSummaryHeaderProps) {
  const ConditionIcon = getConditionIcon(conditionCode)
  const formattedTime = formatLocalDateTime(selectedTime)
  const description = `${conditionLabel} - ${formattedTime}${timezone ? ` - ${timezone}` : ''}`

  return (
    <CardHeader>
      <CardTitle className="font-display text-3xl font-semibold tracking-tight text-slate-100">
        {status === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            Loading
            <span className="loading-ellipsis" aria-hidden="true">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </span>
        ) : (
          locationName
        )}
      </CardTitle>
      <CardDescription className={status === 'loading' ? 'opacity-0' : 'opacity-100'}>
        <span className="inline-flex flex-wrap items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/30 to-pink-600/40 text-pink-300 shadow-sm border border-pink-500/30">
            <ConditionIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-slate-300">{description}</span>
        </span>
      </CardDescription>
    </CardHeader>
  )
}
