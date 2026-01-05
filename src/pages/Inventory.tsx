import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { HomeSidebar } from '@/features/home/components/HomeSidebar'
import { GearInventoryCard } from '@/features/inventory/components/GearInventoryCard'

export default function InventoryPage() {
  const handleShare = async () => {
    if (typeof window === 'undefined') return false
    try {
      await navigator.clipboard.writeText(window.location.href)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="grain" />
      <SidebarProvider defaultOpen>
        <HomeSidebar onShare={handleShare} />
        <SidebarInset className="bg-transparent">
          <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 pb-24 pt-8">
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-ink-200/10 bg-ink-950/30 px-6 py-5">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-ink-50">Gear Inventory</h1>
                  <p className="text-sm text-ink-400">
                    Manage your gear collection and map items to recommendations
                  </p>
                </div>
              </div>
              <SidebarTrigger
                className="md:hidden rounded-full border border-tide-300/40 bg-tide-500/15 text-tide-50 shadow-glow hover:bg-tide-500/25 hover:text-white"
                variant="outline"
                label="Plans & Gear"
              />
            </header>

            <main className="flex w-full flex-col gap-10">
              <GearInventoryCard />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
