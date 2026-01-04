import { CalendarDays, Compass, Home, Info, Link2, Package2, Share2, Sparkles } from 'lucide-react'
import type { MouseEvent } from 'react'
import confetti from 'canvas-confetti'
import { Link } from '@tanstack/react-router'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { toast } from 'sonner'
import { useHomeStore } from '@/features/home/store/useHomeStore'
type HomeSidebarProps = {
  onShare: () => Promise<boolean>
}

export function HomeSidebar({ onShare }: HomeSidebarProps) {
  const setActivePlanId = useHomeStore((state) => state.setActivePlanId)
  const handleShareClick = async (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const didCopy = await onShare()
    if (didCopy) {
      const viewport = window.visualViewport
      const viewportWidth = viewport?.width ?? window.innerWidth
      const viewportHeight = viewport?.height ?? window.innerHeight
      const offsetLeft = viewport?.offsetLeft ?? 0
      const offsetTop = viewport?.offsetTop ?? 0
      const origin = rect
        ? {
            x: Math.min(1, Math.max(0, (rect.left + rect.width / 2 - offsetLeft) / viewportWidth)),
            y: Math.min(1, Math.max(0, (rect.top + rect.height / 2 - offsetTop) / viewportHeight)),
          }
        : { x: 0.5, y: 0.2 }
      confetti({
        particleCount: 120,
        spread: 70,
        startVelocity: 30,
        origin,
        colors: ['#5aa48f', '#3ea884', '#8fc1a7', '#f6c77c', '#ffa348', '#3a5e8d'],
      })
      toast.success('Link copied', {
        description: 'Your current plan is ready to share.',
      })
    }
  }

  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="bg-transparent text-ink-50 [&_[data-slot=sidebar-inner]]:bg-ink-950/90 [&_[data-slot=sidebar-inner]]:backdrop-blur-sm [&_[data-slot=sidebar-inner]]:shadow-2xl [&_[data-slot=sidebar-inner]]:shadow-ink-950/60 [&_[data-slot=sidebar-inner]]:ring-1 [&_[data-slot=sidebar-inner]]:ring-ink-100/15"
    >
      <SidebarHeader className="gap-3 px-4 pt-3 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-ink-100/90 ring-1 ring-ink-200/40 shadow-glow group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
              <img
                src="/gearcast-logo.svg"
                alt="GearCast logo"
                className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6"
              />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-display text-lg font-semibold tracking-tight text-ink-50">
                GearCast
              </p>
              <p className="text-[11px] uppercase tracking-[0.3em] text-ink-100/70">
                Wear-ready forecasts
              </p>
            </div>
          </div>
          <SidebarTrigger className="h-8 w-8 rounded-lg border border-ink-200/10 bg-ink-950/60 text-ink-100/70 transition hover:text-ink-50 group-data-[collapsible=icon]:order-2" />
        </div>
      </SidebarHeader>
      <SidebarSeparator className="my-2 group-data-[collapsible=icon]:mx-2" />
      <SidebarContent className="px-2 pb-3 group-data-[collapsible=icon]:px-1">
        <SidebarGroup className="group-data-[collapsible=icon]:px-1">
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/" />}
                onClick={() => setActivePlanId(null)}
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Home />
                <span className="group-data-[collapsible=icon]:hidden">Home</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/plans" />}
                className="group-data-[collapsible=icon]:justify-center"
              >
                <CalendarDays />
                <span className="group-data-[collapsible=icon]:hidden">Saved plans</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<Link to="/inventory" />}
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Package2 />
                <span className="group-data-[collapsible=icon]:hidden">My Gear</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="group-data-[collapsible=icon]:mx-2" />
        <SidebarGroup className="group-data-[collapsible=icon]:px-1">
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                type="button"
                onClick={handleShareClick}
                className="group-data-[collapsible=icon]:justify-center"
              >
                <Share2 />
                <span className="group-data-[collapsible=icon]:hidden">Share plan</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Dialog>
                <DialogTrigger
                  render={
                    <SidebarMenuButton className="group-data-[collapsible=icon]:justify-center">
                      <Info />
                      <span className="group-data-[collapsible=icon]:hidden">About</span>
                    </SidebarMenuButton>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-100/90 ring-1 ring-ink-200/40">
                        <img src="/gearcast-logo.svg" alt="GearCast logo" className="h-7 w-7" />
                      </div>
                      <DialogTitle>GearCast is your outdoor-ready briefing</DialogTitle>
                    </div>
                    <DialogDescription className="text-ink-50/90">
                      Dial in a location, time, and sport to get the exact conditions and the gear
                      list you should bring.
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
                        A snapshot of temperature, wind, and precipitation at the hour you care
                        about, plus visibility and cloud cover to set expectations.
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
                        Recommendations tuned for running or skiing so you know what to wear and
                        what to pack without second guessing.
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
                        Share links keep the plan synced with your choices so your group stays
                        aligned on timing and conditions.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
