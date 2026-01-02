import { SidebarTrigger } from '@/components/ui/sidebar'

type HomeHeaderProps = {
  activePlanName?: string | null
}

export function HomeHeader({ activePlanName }: HomeHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink-200/10 bg-ink-950/30 px-6 py-5">
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
      <SidebarTrigger className="md:hidden" />
    </header>
  )
}
