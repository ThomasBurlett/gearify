import type { ComponentType } from 'react'

import { GearItemChip } from '@/features/home/components/GearItemChip'
import { cn } from '@/lib/utils'

type BodyZoneCardProps = {
  label: string
  icon: ComponentType<{ className?: string }>
  accent: string
  items: string[]
  checkedItems: Set<string>
  onToggle: (item: string) => void
  onRemove: (item: string) => void
  getMappedGear: (item: string) => Array<{ id: string; name: string }>
  onMapGear: (item: string) => void
  optional?: boolean
}

export function BodyZoneCard({
  label,
  icon: Icon,
  accent,
  items,
  checkedItems,
  onToggle,
  onRemove,
  getMappedGear,
  onMapGear,
  optional = false,
}: BodyZoneCardProps) {
  if (items.length === 0) {
    return null
  }

  const iconSize = optional ? 'h-7 w-7' : 'h-9 w-9'
  const iconInnerSize = optional ? 'h-3.5 w-3.5' : 'h-4 w-4'
  const labelSize = optional ? 'text-[11px]' : 'text-xs'
  const labelOpacity = optional ? 'text-ink-100/50' : 'text-ink-100/60'
  const bgOpacity = optional ? 'bg-ink-950/40' : 'bg-ink-950/50'
  const padding = optional ? 'p-3' : 'p-4'

  return (
    <div className={cn('rounded-xl border border-ink-200/10', bgOpacity, padding)}>
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center rounded-lg border border-ink-200/10',
            optional ? 'bg-ink-900/50' : 'bg-ink-900/60',
            iconSize
          )}
        >
          <Icon className={cn(iconInnerSize, accent)} />
        </div>
        <p className={cn('uppercase tracking-[0.2em]', labelSize, labelOpacity)}>{label}</p>
      </div>
      <div className={cn('flex flex-wrap gap-2', optional ? 'mt-2' : 'mt-3')}>
        {items.map((item) => {
          const mappedGear = getMappedGear(item)
          return (
            <GearItemChip
              key={item}
              item={item}
              checked={checkedItems.has(item)}
              onToggle={onToggle}
              onRemove={onRemove}
              optional={optional}
              mappedGear={mappedGear.length > 0 ? mappedGear[0] : null}
              onMapGear={onMapGear}
            />
          )
        })}
      </div>
    </div>
  )
}
