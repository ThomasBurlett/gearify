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
            <header className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 px-6 py-5 shadow-xl shadow-black/20 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">Gear Inventory</h1>
                  <p className="text-sm text-slate-400">
                    Manage your gear collection and map items to recommendations
                  </p>
                </div>
              </div>
              <SidebarTrigger
                className="md:hidden rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 shadow-lg shadow-indigo-500/20 hover:bg-indigo-500/25 hover:text-white"
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
