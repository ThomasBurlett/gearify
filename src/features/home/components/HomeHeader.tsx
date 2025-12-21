import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

type HomeHeaderProps = {
  onShare: () => void
}

export function HomeHeader({ onShare }: HomeHeaderProps) {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 pb-10 pt-8">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-ink-100/90 ring-1 ring-ink-200/40 shadow-glow">
          <img src="/gearify-logo.svg" alt="Gearify logo" className="h-10 w-10" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-ink-50">Gearify</p>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-100/80">Wear-ready forecasts</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={onShare}>
                Share link
                <ArrowUpRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Shareable links keep your location, time, and sport synced.
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  )
}
