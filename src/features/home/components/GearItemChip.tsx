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
        'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-slate-200 transition shadow-sm',
        optional
          ? 'border-dashed border-slate-600/60 bg-slate-800/50 text-slate-400'
          : 'border-slate-600/60 bg-slate-800/80',
        checked && !optional && 'border-emerald-500/50 bg-emerald-900/30 text-emerald-300',
        checked && optional && 'border-emerald-500/40 bg-emerald-900/20 text-emerald-400'
      )}
    >
      <label className="flex flex-1 cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(item)}
          className="h-3.5 w-3.5 shrink-0 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500/40"
        />
        <span className="flex flex-1 flex-wrap items-center gap-1.5">
          <span className="font-medium">{item}</span>
          {mappedGear && (
            <Badge
              variant="outline"
              className="text-[10px] border-indigo-500/50 bg-indigo-900/40 text-indigo-300"
            >
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
              className="h-5 px-1.5 text-[10px] text-slate-500 hover:text-indigo-400 hover:bg-indigo-900/30"
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
        className="ml-1 shrink-0 text-xs text-slate-500 transition hover:text-pink-400"
        aria-label="Remove item"
      >
        x
      </button>
    </div>
  )
}
