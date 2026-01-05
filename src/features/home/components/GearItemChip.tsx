import { Link2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type GearItemChipProps = {
  item: string
  checked: boolean
  onToggle: (item: string) => void
  onRemove: (item: string) => void
  optional?: boolean
  mappedGear?: { id: string; name: string } | null
  onMapGear?: (item: string) => void
}

export function GearItemChip({
  item,
  checked,
  onToggle,
  onRemove,
  optional = false,
  mappedGear,
  onMapGear,
}: GearItemChipProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs text-ink-50 transition',
        optional
          ? 'border-dashed border-ink-200/20 text-ink-100/70'
          : 'border-ink-200/15 bg-ink-900/60',
        checked && !optional && 'border-tide-300/40 bg-ink-900/70 text-ink-100',
        checked && optional && 'border-tide-300/40 text-ink-100'
      )}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item)}
          className="h-3.5 w-3.5 shrink-0 rounded border-ink-200/30 bg-ink-950/60 text-tide-300 focus:ring-tide-300/60"
        />
        <span className="flex flex-1 flex-wrap items-center gap-1.5">
          <span>{item}</span>
          {mappedGear && (
            <Badge variant="outline" className="text-[10px] text-tide-200">
              → {mappedGear.name}
            </Badge>
          )}
          {!mappedGear && onMapGear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                onMapGear(item)
              }}
              className="h-5 px-1.5 text-[10px] text-ink-400 hover:text-tide-200"
            >
              <Link2 className="mr-0.5 h-3 w-3" />
              Map
            </Button>
          )}
        </span>
      </label>
      <button
        type="button"
        onClick={() => onRemove(item)}
        className="ml-1 shrink-0 text-xs text-ink-100/60 transition hover:text-spice-200"
        aria-label="Remove item"
      >
        x
      </button>
    </div>
  )
}
