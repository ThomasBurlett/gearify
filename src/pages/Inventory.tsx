import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { GearInventoryCard } from '@/features/inventory/components/GearInventoryCard'

export default function InventoryPage() {
  return (
    <div className="min-h-screen bg-ink-1000 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
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

        {/* Inventory Card */}
        <GearInventoryCard />
      </div>
    </div>
  )
}
