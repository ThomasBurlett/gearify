import {
  Footprints,
  Hand,
  HatGlasses,
  PersonStanding,
  RectangleGoggles,
  Search,
  Shirt,
  VenetianMask,
  X,
} from 'lucide-react'
import { useMemo, useRef, useState, type ComponentType } from 'react'
import type { PopoverRootChangeEventDetails } from '@base-ui/react/popover'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Command, CommandEmpty, CommandItem, CommandList } from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { BodyZoneCard } from '@/features/home/components/BodyZoneCard'
import { GearItemChip } from '@/features/home/components/GearItemChip'
import { GearMappingSelector } from '@/features/inventory/components/GearMappingSelector'
import { useGearInventory } from '@/features/inventory/hooks/useGearInventory'
import { useGearMappings } from '@/features/inventory/hooks/useGearMappings'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { WearPlan } from '@/lib/gear'
import { WEAR_ITEM_CATALOG } from '@/lib/gear'
import type { LoadStatus } from '@/features/home/types'

const CATEGORY_LABELS: Record<keyof WearPlan['coverage'], string> = {
  feet: 'Feet',
  legs: 'Legs',
  torso: 'Torso',
  hands: 'Hands',
  neckFace: 'Neck + face',
  head: 'Head',
  eyes: 'Eyes',
}

const coverageSections: Array<{
  key: keyof WearPlan['coverage']
  label: string
  icon: ComponentType<{ className?: string }>
  accent: string
}> = [
  { key: 'feet', label: 'Feet', icon: Footprints, accent: 'text-indigo-400' },
  { key: 'legs', label: 'Legs', icon: PersonStanding, accent: 'text-slate-400' },
  { key: 'torso', label: 'Torso', icon: Shirt, accent: 'text-indigo-400' },
  { key: 'hands', label: 'Hands', icon: Hand, accent: 'text-pink-400' },
  { key: 'neckFace', label: 'Neck + face', icon: VenetianMask, accent: 'text-pink-400' },
  { key: 'head', label: 'Head', icon: HatGlasses, accent: 'text-emerald-400' },
  { key: 'eyes', label: 'Eyes', icon: RectangleGoggles, accent: 'text-slate-400' },
]

type WearGuideCardProps = {
  status: LoadStatus
  wearPlan: WearPlan | null
  checkedWearItems: string[]
  onCheckedWearItemsChange: (items: string[]) => void
  removedWearItems: string[]
  onRemovedWearItemsChange: (items: string[]) => void
  addedWearItems: string[]
  onAddedWearItemsChange: (items: string[]) => void
}

export function WearGuideCard({
  status,
  wearPlan,
  checkedWearItems,
  onCheckedWearItemsChange,
  removedWearItems,
  onRemovedWearItemsChange,
  addedWearItems,
  onAddedWearItemsChange,
}: WearGuideCardProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerInputRef = useRef<HTMLInputElement | null>(null)
  const pickerTriggerRef = useRef<HTMLDivElement | null>(null)

  // Gear mapping state
  const { items: inventory } = useGearInventory()
  const { getMappedGear, setMapping, findMatchingGear } = useGearMappings(inventory)
  const [mappingSelectorOpen, setMappingSelectorOpen] = useState(false)
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)

  const [itemQuery, setItemQuery] = useState('')
  const checkedSet = useMemo(() => new Set(checkedWearItems), [checkedWearItems])
  const addedSet = useMemo(() => new Set(addedWearItems), [addedWearItems])
  const catalogByItem = useMemo(
    () => new Map(WEAR_ITEM_CATALOG.map(({ item, zone }) => [item, zone])),
    []
  )

  const baseItems = useMemo(() => {
    if (!wearPlan) return new Set<string>()
    const coverage = wearPlan.coverage
    const optional = wearPlan.optionalCoverage
    return new Set([
      ...wearPlan.primary,
      ...coverage.feet,
      ...coverage.legs,
      ...coverage.torso,
      ...coverage.hands,
      ...coverage.neckFace,
      ...coverage.head,
      ...coverage.eyes,
      ...Object.values(optional).flat(),
      ...wearPlan.optional,
    ])
  }, [wearPlan])

  const availableItems = useMemo(() => {
    return WEAR_ITEM_CATALOG.map((entry) => entry.item)
  }, [])

  const filteredItems = useMemo(() => {
    const query = itemQuery.trim().toLowerCase()
    return availableItems.filter((item) => {
      const isBase = baseItems.has(item)
      const isRemoved = removedWearItems.includes(item)
      const isAdded = addedSet.has(item)
      if ((isBase && !isRemoved) || isAdded) return false
      if (!query) return true
      const zone = catalogByItem.get(item)
      const categoryLabel = zone ? CATEGORY_LABELS[zone] : ''
      return item.toLowerCase().includes(query) || categoryLabel.toLowerCase().includes(query)
    })
  }, [availableItems, itemQuery, baseItems, removedWearItems, addedSet, catalogByItem])

  const handleToggleWearItem = (item: string) => {
    if (checkedSet.has(item)) {
      onCheckedWearItemsChange(checkedWearItems.filter((entry) => entry !== item))
    } else {
      onCheckedWearItemsChange([...checkedWearItems, item])
    }
  }

  const handleOpenMappingSelector = (recommendation: string) => {
    setSelectedRecommendation(recommendation)
    setMappingSelectorOpen(true)
  }

  const handleSaveMapping = (gearIds: string[]) => {
    if (selectedRecommendation) {
      setMapping(selectedRecommendation, gearIds)
    }
  }

  const handleRemoveWearItem = (item: string) => {
    if (!baseItems.has(item) && addedSet.has(item)) {
      onAddedWearItemsChange(addedWearItems.filter((entry) => entry !== item))
      onCheckedWearItemsChange(checkedWearItems.filter((entry) => entry !== item))
      return
    }
    if (!removedWearItems.includes(item)) {
      onRemovedWearItemsChange([...removedWearItems, item])
    }
    onCheckedWearItemsChange(checkedWearItems.filter((entry) => entry !== item))
  }

  const handleAddWearItem = (item: string) => {
    if (baseItems.has(item)) {
      if (removedWearItems.includes(item)) {
        onRemovedWearItemsChange(removedWearItems.filter((entry) => entry !== item))
      }
      return
    }
    if (!addedSet.has(item)) {
      onAddedWearItemsChange([...addedWearItems, item])
    }
  }

  const handlePickerOpenChange = (open: boolean, details?: PopoverRootChangeEventDetails) => {
    const target = details?.event?.target as Node | null | undefined
    if (!open && target && pickerTriggerRef.current?.contains(target)) {
      return
    }
    if (
      !open &&
      (details?.reason === 'trigger-press' ||
        details?.reason === 'trigger-focus' ||
        details?.reason === 'focus-out')
    ) {
      return
    }
    if (!open && document.activeElement === pickerInputRef.current) {
      return
    }
    setIsPickerOpen(open)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">What to wear</CardTitle>
          <CardDescription>
            Smart layering based on weather, effort, and how you run hot or cold.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' ? (
            <div className="grid gap-3">
              <Skeleton className="h-16" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : !wearPlan ? (
            <p className="text-sm text-slate-400">Select a location and time to see gear.</p>
          ) : (
            <div className="space-y-8">
              {/* Summary badges */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="glow">Effective {wearPlan.effectiveTemp}F</Badge>
                <Badge variant="outline" className="border-slate-600/50 text-slate-300">
                  Confidence: {wearPlan.confidence}
                </Badge>
              </div>

              {/* Primary picks section */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Primary picks
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Adjustments:{' '}
                    {wearPlan.adjustments.length
                      ? wearPlan.adjustments
                          .map((adjustment) => adjustment.replace(/:\s*/, ' '))
                          .join(', ')
                      : 'No adjustments'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {wearPlan.primary.filter((item) => !removedWearItems.includes(item)).length ? (
                    wearPlan.primary
                      .filter((item) => !removedWearItems.includes(item))
                      .map((item) => (
                        <GearItemChip
                          key={`primary-${item}`}
                          item={item}
                          checked={checkedSet.has(item)}
                          onToggle={handleToggleWearItem}
                          onRemove={handleRemoveWearItem}
                          mappedGear={
                            getMappedGear(item).length > 0 ? getMappedGear(item)[0] : null
                          }
                          onMapGear={handleOpenMappingSelector}
                        />
                      ))
                  ) : (
                    <span className="text-xs text-slate-500">None</span>
                  )}
                </div>
              </div>

              {/* Add item search */}
              <Popover open={isPickerOpen} onOpenChange={handlePickerOpenChange} modal={false}>
                <PopoverTrigger
                  nativeButton={false}
                  render={<div ref={pickerTriggerRef} className="relative" />}
                >
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-100/60" />
                  <Input
                    ref={pickerInputRef}
                    placeholder="Search items to add"
                    value={itemQuery}
                    onFocus={() => setIsPickerOpen(true)}
                    onChange={(event) => {
                      setItemQuery(event.target.value)
                      setIsPickerOpen(true)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Escape') {
                        setIsPickerOpen(false)
                      }
                    }}
                    className="h-11 pl-9 pr-9"
                  />
                  {itemQuery.trim() ? (
                    <button
                      type="button"
                      aria-label="Clear item search"
                      onClick={() => {
                        setItemQuery('')
                        setIsPickerOpen(false)
                        pickerInputRef.current?.focus()
                      }}
                      className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center text-ink-100/70 transition hover:text-ink-50"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </PopoverTrigger>
                {isPickerOpen && (
                  <PopoverContent
                    className="w-[min(90vw,22rem)] border border-slate-700/50 bg-slate-800 text-slate-100 shadow-elevation"
                    align="start"
                    initialFocus={false}
                    finalFocus={false}
                  >
                    <Command shouldFilter={false}>
                      <CommandList className="max-h-56 pr-1">
                        {filteredItems.length > 0 ? (
                          filteredItems.map((item) => {
                            const isBase = baseItems.has(item)
                            const isRemoved = removedWearItems.includes(item)
                            const isAdded = addedSet.has(item)
                            const isActive = (isBase && !isRemoved) || isAdded
                            return (
                              <CommandItem
                                key={`pick-${item}`}
                                onSelect={() => {
                                  if (isActive) return
                                  handleAddWearItem(item)
                                  setItemQuery('')
                                  setIsPickerOpen(false)
                                }}
                                disabled={isActive}
                                className={
                                  isActive
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'hover:bg-slate-700/50'
                                }
                              >
                                <span className="flex flex-1 items-center justify-between gap-3">
                                  <span>{isActive ? item : `Add ${item}`}</span>
                                  <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                                    {catalogByItem.get(item) ?? 'Gear'}
                                  </span>
                                </span>
                              </CommandItem>
                            )
                          })
                        ) : (
                          <CommandEmpty>No matches found.</CommandEmpty>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                )}
              </Popover>

              {/* Body zones - Wear */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    What to wear
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Core layers by body zone.</p>
                </div>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {coverageSections.map((section) => {
                    const items = wearPlan.coverage[section.key].filter(
                      (item) => !removedWearItems.includes(item)
                    )
                    const addedItems = addedWearItems.filter(
                      (item) => catalogByItem.get(item) === section.key
                    )
                    const displayAddedItems = addedItems.filter((item) => !items.includes(item))
                    const displayItems = [...items, ...displayAddedItems]

                    return (
                      <BodyZoneCard
                        key={section.key}
                        label={section.label}
                        icon={section.icon}
                        accent={section.accent}
                        items={displayItems}
                        checkedItems={checkedSet}
                        onToggle={handleToggleWearItem}
                        onRemove={handleRemoveWearItem}
                        getMappedGear={getMappedGear}
                        onMapGear={handleOpenMappingSelector}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Optional / Pack section */}
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                    Optional / Pack
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Nice-to-have extras if conditions shift.
                  </p>
                </div>

                {/* General optional items */}
                {wearPlan.optional.filter((item) => !removedWearItems.includes(item)).length >
                  0 && (
                  <div className="flex flex-wrap gap-2">
                    {wearPlan.optional
                      .filter((item) => !removedWearItems.includes(item))
                      .map((item) => (
                        <GearItemChip
                          key={`optional-${item}`}
                          item={item}
                          checked={checkedSet.has(item)}
                          onToggle={handleToggleWearItem}
                          onRemove={handleRemoveWearItem}
                          optional
                          mappedGear={
                            getMappedGear(item).length > 0 ? getMappedGear(item)[0] : null
                          }
                          onMapGear={handleOpenMappingSelector}
                        />
                      ))}
                  </div>
                )}

                {/* Optional by body zone */}
                <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {coverageSections.map((section) => {
                    const optionalItems = (wearPlan.optionalCoverage[section.key] ?? []).filter(
                      (item) => !removedWearItems.includes(item)
                    )

                    return (
                      <BodyZoneCard
                        key={`optional-${section.key}`}
                        label={section.label}
                        icon={section.icon}
                        accent={section.accent}
                        items={optionalItems}
                        checkedItems={checkedSet}
                        onToggle={handleToggleWearItem}
                        onRemove={handleRemoveWearItem}
                        getMappedGear={getMappedGear}
                        onMapGear={handleOpenMappingSelector}
                        optional
                      />
                    )
                  })}
                </div>
              </div>

              {/* Reasons */}
              {wearPlan.reasons.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {wearPlan.reasons.map((reason) => (
                    <Badge
                      key={reason}
                      variant="outline"
                      className="border-slate-600/50 bg-slate-700/40 text-slate-300"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gear Mapping Selector Dialog */}
      {selectedRecommendation && (
        <GearMappingSelector
          open={mappingSelectorOpen}
          onOpenChange={setMappingSelectorOpen}
          recommendation={selectedRecommendation}
          matchingGear={findMatchingGear(selectedRecommendation)}
          currentMappings={getMappedGear(selectedRecommendation).map((g) => g.id)}
          onSave={handleSaveMapping}
        />
      )}
    </>
  )
}
