import { Badge } from '@/components/ui/badge'
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
      <Badge variant="warm">Forecast summary</Badge>
      <CardTitle className="text-2xl">
        {status === 'loading' ? (
          <span className="inline-flex items-center gap-2">
            Updating location
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
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-spice-500/20 text-spice-100">
            <ConditionIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>{description}</span>
        </div>
      </CardDescription>
    </CardHeader>
  )
}
