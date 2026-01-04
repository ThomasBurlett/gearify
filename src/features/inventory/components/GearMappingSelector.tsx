import { Link2, Package2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { GearItem } from '@/features/inventory/types'

type GearMappingSelectorProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recommendation: string
  matchingGear: GearItem[]
  currentMappings: string[]
  onSave: (gearIds: string[]) => void
}

const ZONE_LABELS: Record<string, string> = {
  feet: 'Feet',
  legs: 'Legs',
  torso: 'Torso',
  hands: 'Hands',
  neckFace: 'Neck + Face',
  head: 'Head',
  eyes: 'Eyes',
}

export function GearMappingSelector({
  open,
  onOpenChange,
  recommendation,
  matchingGear,
  currentMappings,
  onSave,
}: GearMappingSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(currentMappings)

  // Update selected IDs when currentMappings changes
  useEffect(() => {
    setSelectedIds(currentMappings)
  }, [currentMappings])

  const handleToggle = (gearId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(gearId)) {
        return prev.filter((id) => id !== gearId)
      }
      return [...prev, gearId]
    })
  }

  const handleSave = () => {
    onSave(selectedIds)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedIds(currentMappings)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-tide-200" />
            Map Gear to &quot;{recommendation}&quot;
          </DialogTitle>
          <DialogDescription>
            Select which gear items from your inventory to use for this recommendation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {matchingGear.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-200/20 py-8 text-center">
              <Package2 className="mb-3 h-10 w-10 text-ink-400" />
              <h3 className="mb-1 font-medium text-ink-100">No matching gear found</h3>
              <p className="mb-4 text-sm text-ink-400">
                Add gear items with category &quot;{recommendation}&quot; to your inventory.
              </p>
              <Link to="/inventory">
                <Button variant="outline" size="sm">
                  Go to My Gear
                </Button>
              </Link>
            </div>
          ) : (
            <div className="max-h-[400px] space-y-2 overflow-y-auto">
              {matchingGear.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-ink-200/20 bg-ink-950/40 p-3 transition hover:border-tide-300/40"
                >
                  <input
                    type="checkbox"
                    id={item.id}
                    checked={selectedIds.includes(item.id)}
                    onChange={() => handleToggle(item.id)}
                    className="mt-1.5 h-4 w-4 shrink-0 rounded border-ink-200/30 bg-ink-950/60 text-tide-300 focus:ring-tide-300/60"
                  />
                  <label htmlFor={item.id} className="flex-1 cursor-pointer space-y-1">
                    <div className="font-medium text-ink-50">{item.name}</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline" className="text-tide-200">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-ink-300">
                        {ZONE_LABELS[item.zone]}
                      </Badge>
                      <span className="text-ink-400">Warmth: {item.warmth}/5</span>
                      <span className="text-ink-400 capitalize">{item.waterproof}</span>
                      {item.weight && <span className="text-ink-400">{item.weight}g</span>}
                    </div>
                    {item.notes && (
                      <p className="text-xs text-ink-400 line-clamp-1">{item.notes}</p>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="rounded-lg bg-tide-900/20 p-3 text-sm text-ink-100">
              <strong>{selectedIds.length}</strong> {selectedIds.length === 1 ? 'item' : 'items'}{' '}
              selected
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={selectedIds.length === 0}>
            {selectedIds.length > 0 ? `Map ${selectedIds.length} item(s)` : 'Select items'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
