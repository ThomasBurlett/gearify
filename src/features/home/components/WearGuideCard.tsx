import { ShieldCheck } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { GearSuggestion } from '@/lib/gear'
import type { SportType } from '@/lib/weather'
import type { LoadStatus } from '@/features/home/types'

const SPORT_LABELS: Record<SportType, string> = {
  running: 'Running',
  skiing: 'Skiing',
}

type WearGuideCardProps = {
  status: LoadStatus
  sport: SportType
  gear: GearSuggestion | null
}

export function WearGuideCard({ status, sport, gear }: WearGuideCardProps) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="glow">Wear guide</Badge>
        <CardTitle className="text-2xl">Suggested layers for {SPORT_LABELS[sport]}</CardTitle>
        <CardDescription>
          Built for the forecast you selected. Adjust once we add comfort profiles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : gear ? (
          <div className="grid gap-3">
            {gear.wear.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-ink-200/10 bg-ink-950/40 px-4 py-3 text-sm text-ink-50"
              >
                <span>{item}</span>
                <ShieldCheck className="h-4 w-4 text-tide-200" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-100/70">Select a location and time to see gear.</p>
        )}
      </CardContent>
    </Card>
  )
}
