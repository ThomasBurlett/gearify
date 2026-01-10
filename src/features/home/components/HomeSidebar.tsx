import {
  CalendarClock,
  CalendarDays,
  CloudSun,
  Compass,
  Home,
  Info,
  Link2,
  MapPin,
  Mountain,
  Package2,
  Share2,
  Sparkles,
  ThermometerSun,
  Wind,
} from 'lucide-react'
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
        colors: ['#3B82F6', '#60A5FA', '#93C5FD', '#F97316', '#FDBA74', '#10B981'],
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
      className="bg-transparent text-slate-100 [&_[data-slot=sidebar-inner]]:bg-gradient-to-b [&_[data-slot=sidebar-inner]]:from-slate-800/95 [&_[data-slot=sidebar-inner]]:to-slate-900/95 [&_[data-slot=sidebar-inner]]:backdrop-blur-xl [&_[data-slot=sidebar-inner]]:shadow-2xl [&_[data-slot=sidebar-inner]]:shadow-black/40 [&_[data-slot=sidebar-inner]]:ring-1 [&_[data-slot=sidebar-inner]]:ring-slate-700/50"
    >
      <SidebarHeader className="gap-3 px-4 pt-4 group-data-[collapsible=icon]:px-2">
        <div className="flex items-center justify-between gap-3 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
              <img
                src="/gearcast-logo.svg"
                alt="GearCast logo"
                className="h-7 w-7 brightness-0 invert group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5"
              />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <p className="font-display text-xl font-semibold tracking-tight text-white">
                GearCast
              </p>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-slate-400">
                Wear-ready forecasts
              </p>
            </div>
          </div>
          <SidebarTrigger className="h-8 w-8 rounded-lg border border-slate-600/50 bg-slate-800/80 text-slate-400 transition hover:bg-slate-700/80 hover:text-slate-200 group-data-[collapsible=icon]:order-2" />
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
                <DialogContent className="scrollbar-glow max-h-[85vh] overflow-y-auto p-0 sm:max-w-4xl">
                  <div className="grid">
                    <section className="relative overflow-hidden border-b border-slate-700/50 px-6 py-7 sm:px-10 sm:py-9">
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(99,102,241,0.2),transparent_55%),radial-gradient(circle_at_90%_0%,rgba(244,114,182,0.15),transparent_50%),radial-gradient(circle_at_60%_100%,rgba(34,197,94,0.12),transparent_55%)]" />
                      <div className="pointer-events-none absolute -top-20 right-0 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
                      <DialogHeader className="relative z-10 gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
                            <img src="/gearcast-logo.svg" alt="GearCast logo" className="h-7 w-7 brightness-0 invert" />
                          </div>
                          <div>
                            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
                              About GearCast
                            </p>
                            <DialogTitle className="font-display text-2xl text-white sm:text-3xl">
                              A wear-ready forecast for people who move outdoors.
                            </DialogTitle>
                          </div>
                        </div>
                        <DialogDescription className="max-w-2xl text-sm text-slate-300">
                          GearCast blends hourly weather, comfort tuning, and your sport to deliver
                          a clear, confident plan. Pick a location and time, and it returns what the
                          conditions feel like and the layers and pack items that make sense.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="relative z-10 mt-6 grid gap-4 sm:grid-cols-3">
                        {[
                          {
                            icon: Compass,
                            title: 'Condition clarity',
                            copy: 'Hour-by-hour readouts for temperature, wind, precipitation, and visibility.',
                          },
                          {
                            icon: Sparkles,
                            title: 'Smart layering',
                            copy: 'Recommendations tuned to exertion, duration, and your comfort profile.',
                          },
                          {
                            icon: Link2,
                            title: 'Ready to share',
                            copy: 'Shareable links keep the crew synced on timing and gear.',
                          },
                        ].map((item) => (
                          <div
                            key={item.title}
                            className="rounded-2xl border border-slate-700/50 bg-slate-800/80 p-4 shadow-lg"
                          >
                            <div className="flex items-center gap-2 text-slate-100">
                              <item.icon className="h-4 w-4 text-indigo-400" />
                              <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                                {item.title}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">{item.copy}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="grid gap-8 px-6 py-7 sm:px-10 sm:py-9">
                      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                            Why it exists
                          </p>
                          <p className="mt-3 text-sm text-slate-300">
                            Weather apps talk in broad terms. GearCast speaks the language of
                            runners and skiers: wind chill vs. effort, precipitation vs. layering,
                            and pack essentials you might forget when you are rushing out the door.
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <span className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                              Running
                            </span>
                            <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-medium text-pink-300">
                              Skiing
                            </span>
                            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
                              Local-first plans
                            </span>
                          </div>
                        </div>
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
                          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                            How it flows
                          </p>
                          <ul className="mt-4 grid gap-3 text-sm text-slate-300">
                            <li className="flex gap-3">
                              <MapPin className="mt-0.5 h-4 w-4 text-indigo-400" />
                              Choose a location or let GearCast find you.
                            </li>
                            <li className="flex gap-3">
                              <CalendarClock className="mt-0.5 h-4 w-4 text-indigo-400" />
                              Pick the hour and sport, then set comfort + effort.
                            </li>
                            <li className="flex gap-3">
                              <CloudSun className="mt-0.5 h-4 w-4 text-indigo-400" />
                              Review the conditions story and the scenario dial.
                            </li>
                            <li className="flex gap-3">
                              <Package2 className="mt-0.5 h-4 w-4 text-indigo-400" />
                              Get a wear guide and pack list you can edit.
                            </li>
                            <li className="flex gap-3">
                              <Share2 className="mt-0.5 h-4 w-4 text-indigo-400" />
                              Share a plan so everyone stays aligned.
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {[
                          { icon: ThermometerSun, label: 'Temperature', copy: 'Feels-like heat.' },
                          { icon: Wind, label: 'Wind + gusts', copy: 'Layering impact.' },
                          { icon: CloudSun, label: 'Sky + precip', copy: 'Wet vs. dry signals.' },
                          { icon: Mountain, label: 'Elevation', copy: 'True-to-trail context.' },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
                          >
                            <div className="flex items-center gap-2 text-slate-100">
                              <item.icon className="h-4 w-4 text-pink-400" />
                              <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">
                                {item.label}
                              </p>
                            </div>
                            <p className="mt-2 text-sm text-slate-300">{item.copy}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
                          <div className="flex items-center gap-2 text-slate-100">
                            <Info className="h-4 w-4 text-indigo-400" />
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                              Data sources
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-300">
                            Forecasts and geocoding come from Open-Meteo. We blend it with
                            OpenStreetMap Nominatim for location search and ipapi for IP-based
                            fallback.
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/60 p-6">
                          <div className="flex items-center gap-2 text-slate-100">
                            <Sparkles className="h-4 w-4 text-pink-400" />
                            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                              Local-first comfort
                            </p>
                          </div>
                          <p className="mt-3 text-sm text-slate-300">
                            Your comfort profile, gear inventory, and saved plans live in your
                            browser. GearCast uses that context to shape recommendations without
                            needing an account.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                        <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-400">
                          Good to know
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          Weather shifts quickly in the mountains. GearCast is a planning aid, not a
                          safety guarantee. Always check conditions and bring what makes you feel
                          confident.
                        </p>
                      </div>
                    </section>
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
