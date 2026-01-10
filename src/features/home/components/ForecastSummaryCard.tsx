import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ForecastSummaryHeader } from '@/features/home/components/ForecastSummaryHeader'
import { ForecastSummaryMetrics } from '@/features/home/components/ForecastSummaryMetrics'
import type { SelectedHour, LoadStatus } from '@/features/home/types'

type ForecastSummaryCardProps = {
  status: LoadStatus
  locationName: string
  selectedTime: string
  conditionLabel: string
  timezone?: string
  selectedHour: SelectedHour | null
  heatIndex: number | null
  windChill: number | null
  visibilityMiles: number | null
  elevation: number | null
  errorMessage: string
}

export function ForecastSummaryCard({
  status,
  locationName,
  selectedTime,
  conditionLabel,
  timezone,
  selectedHour,
  heatIndex,
  windChill,
  visibilityMiles,
  elevation,
  errorMessage,
}: ForecastSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <ForecastSummaryHeader
        status={status}
        locationName={locationName}
        conditionLabel={conditionLabel}
        selectedTime={selectedTime}
        timezone={timezone}
        conditionCode={selectedHour?.conditionCode}
      />
      <CardContent>
        {status === 'error' && (
          <div className="rounded-xl border border-pink-500/40 bg-pink-900/30 p-4 text-sm text-pink-200">
            {errorMessage}
          </div>
        )}

        {status === 'loading' ? (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </div>
            <Skeleton className="h-14" />
          </div>
        ) : selectedHour ? (
          <ForecastSummaryMetrics
            selectedHour={selectedHour}
            heatIndex={heatIndex}
            windChill={windChill}
            visibilityMiles={visibilityMiles}
            elevation={elevation}
          />
        ) : (
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/40 p-4 text-sm text-slate-400">
            Select a date/time within the next 7 days to see details.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
