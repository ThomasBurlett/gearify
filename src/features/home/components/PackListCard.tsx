import { Wind } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { GearSuggestion } from '@/lib/gear'
import type { LoadStatus } from '@/features/home/types'

type PackListCardProps = {
  status: LoadStatus
  gear: GearSuggestion | null
}

export function PackListCard({ status, gear }: PackListCardProps) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="warm">Pack list</Badge>
        <CardTitle className="text-2xl">Items to bring</CardTitle>
        <CardDescription>
          Extra gear that is helpful for variable conditions and travel.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : gear ? (
          <div className="grid gap-3">
            {gear.pack.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-2xl border border-ink-200/10 bg-ink-950/40 px-4 py-3 text-sm text-ink-50"
              >
                <span>{item}</span>
                <Wind className="h-4 w-4 text-spice-200" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-100/70">Pack list will appear with your forecast.</p>
        )}
      </CardContent>
    </Card>
  )
}
