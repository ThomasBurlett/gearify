import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HomeHeaderProps = {
  activePlanName?: string | null
  canSavePlan: boolean
  onSavePlan: (name: string) => void
}

export function HomeHeader({ activePlanName, canSavePlan, onSavePlan }: HomeHeaderProps) {
  const [planName, setPlanName] = useState('')
  const [isSaveOpen, setIsSaveOpen] = useState(false)

  const handleSave = () => {
    if (!canSavePlan) return
    onSavePlan(planName.trim())
    setPlanName('')
    setIsSaveOpen(false)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-ink-200/10 bg-ink-950/30 px-6 py-5">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <p className="font-display text-2xl font-semibold tracking-tight text-ink-50">
            Plan overview
          </p>
          <p className="text-xs uppercase tracking-[0.28em] text-ink-100/70">
            Forecast and gear guidance
          </p>
        </div>
        {activePlanName && (
          <div className="inline-flex items-center gap-2 rounded-full border border-tide-300/40 bg-tide-500/15 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-tide-100">
            <span className="h-1.5 w-1.5 rounded-full bg-tide-200 shadow-[0_0_8px_rgba(113,204,185,0.8)]" />
            Active plan: {activePlanName}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Popover open={isSaveOpen} onOpenChange={setIsSaveOpen} modal={false}>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="rounded-lg" />}>
            Save plan
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="z-50 w-[min(90vw,20rem)] border border-ink-100/30 bg-ink-900 text-ink-50 shadow-[0_24px_80px_rgba(0,0,0,0.7)] ring-1 ring-ink-100/15 backdrop-blur-md"
            initialFocus={false}
            finalFocus={false}
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Save plan</p>
                <p className="mt-1 text-sm text-ink-100/70">
                  Name this plan so you can find it on the plans page.
                </p>
              </div>
              <Input
                placeholder="Plan name (optional)"
                value={planName}
                onChange={(event) => setPlanName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    handleSave()
                  }
                }}
              />
              <div className="flex items-center justify-between gap-2">
                {!canSavePlan && (
                  <span className="text-xs text-ink-100/60">Pick a location + time first.</span>
                )}
                <Button type="button" size="sm" onClick={handleSave} disabled={!canSavePlan}>
                  Save
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <SidebarTrigger className="md:hidden" />
      </div>
    </header>
  )
}
