import { ArrowUpRight, Compass, Info, Link2, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              About
              <Info />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-100/90 ring-1 ring-ink-200/40">
                  <img src="/gearify-logo.svg" alt="Gearify logo" className="h-7 w-7" />
                </div>
                <DialogTitle>Gearify is your outdoor-ready briefing</DialogTitle>
              </div>
              <DialogDescription className="text-ink-50/90">
                Dial in a location, time, and sport to get the exact conditions and the gear list
                you should bring.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 grid gap-4">
              <div className="rounded-2xl border border-ink-200/15 bg-ink-900/80 p-4">
                <div className="flex items-center gap-2 text-ink-50">
                  <Compass className="h-4 w-4 text-tide-200" />
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">
                    What you get
                  </p>
                </div>
                <p className="mt-2 text-sm text-ink-50/85">
                  A snapshot of temperature, wind, and precipitation at the hour you care about,
                  plus visibility and cloud cover to set expectations.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/15 bg-ink-900/80 p-4">
                <div className="flex items-center gap-2 text-ink-50">
                  <Sparkles className="h-4 w-4 text-tide-200" />
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">
                    Gear guidance
                  </p>
                </div>
                <p className="mt-2 text-sm text-ink-50/85">
                  Recommendations tuned for running or skiing so you know what to wear and what to
                  pack without second guessing.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-200/15 bg-ink-900/80 p-4">
                <div className="flex items-center gap-2 text-ink-50">
                  <Link2 className="h-4 w-4 text-tide-200" />
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">
                    Built to share
                  </p>
                </div>
                <p className="mt-2 text-sm text-ink-50/85">
                  Share links keep the plan synced with your choices so your group stays aligned on
                  timing and conditions.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="glow" size="sm" onClick={onShare}>
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
