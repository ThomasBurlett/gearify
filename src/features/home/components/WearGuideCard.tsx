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
import { ComfortProfileControls } from '@/features/home/components/ComfortProfileControls'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { ComfortProfile, ExertionLevel, TripDuration, WearPlan } from '@/lib/gear'
import { WEAR_ITEM_CATALOG } from '@/lib/gear'
import type { SportType } from '@/lib/weather'
import type { LoadStatus } from '@/features/home/types'

const SPORT_LABELS: Record<SportType, string> = {
  running: 'Running',
  skiing: 'Skiing',
}

const exertionOptions: Array<{ value: ExertionLevel; label: string }> = [
  { value: 'easy', label: 'Easy' },
  { value: 'steady', label: 'Steady' },
  { value: 'hard', label: 'Hard' },
]

const durationOptions: Array<{ value: TripDuration; label: string }> = [
  { value: 'short', label: '< 1h' },
  { value: 'medium', label: '1-3h' },
  { value: 'long', label: '3h+' },
]

type WearGuideCardProps = {
  status: LoadStatus
  sport: SportType
  wearPlan: WearPlan | null
  colderWearPlan: WearPlan | null
  wetterWearPlan: WearPlan | null
  checkedWearItems: string[]
  onCheckedWearItemsChange: (items: string[]) => void
  removedWearItems: string[]
  onRemovedWearItemsChange: (items: string[]) => void
  addedWearItems: string[]
  onAddedWearItemsChange: (items: string[]) => void
  comfortProfile: ComfortProfile
  onComfortProfileChange: (profile: ComfortProfile) => void
  exertion: ExertionLevel
  onExertionChange: (value: ExertionLevel) => void
  duration: TripDuration
  onDurationChange: (value: TripDuration) => void
}

type Scenario = 'now' | 'colder' | 'wetter'

function optionClass(isSelected: boolean) {
  return cn(
    'min-h-[40px] rounded-lg border border-ink-200/20 px-4 py-2 text-xs uppercase tracking-[0.2em] transition disabled:pointer-events-none disabled:opacity-50',
    isSelected
      ? 'border-tide-300/60 bg-ink-950/60 text-ink-50'
      : 'text-ink-100/70 hover:border-tide-300/50 hover:text-ink-50'
  )
}

const coverageSections: Array<{
  key: keyof WearPlan['coverage']
  label: string
  icon: ComponentType<{ className?: string }>
  accent: string
}> = [
  { key: 'feet', label: 'Feet', icon: Footprints, accent: 'text-tide-200' },
  { key: 'legs', label: 'Legs', icon: PersonStanding, accent: 'text-ink-100' },
  { key: 'torso', label: 'Torso', icon: Shirt, accent: 'text-tide-200' },
  { key: 'hands', label: 'Hands', icon: Hand, accent: 'text-spice-200' },
  { key: 'neckFace', label: 'Neck + face', icon: VenetianMask, accent: 'text-spice-200' },
  { key: 'head', label: 'Head', icon: HatGlasses, accent: 'text-tide-200' },
  { key: 'eyes', label: 'Eyes', icon: RectangleGoggles, accent: 'text-ink-100' },
]

const CATEGORY_LABELS: Record<keyof WearPlan['coverage'], string> = {
  feet: 'Feet',
  legs: 'Legs',
  torso: 'Torso',
  hands: 'Hands',
  neckFace: 'Neck + face',
  head: 'Head',
  eyes: 'Eyes',
}

export function WearGuideCard({
  status,
  sport,
  wearPlan,
  colderWearPlan,
  wetterWearPlan,
  checkedWearItems,
  onCheckedWearItemsChange,
  removedWearItems,
  onRemovedWearItemsChange,
  addedWearItems,
  onAddedWearItemsChange,
  comfortProfile,
  onComfortProfileChange,
  exertion,
  onExertionChange,
  duration,
  onDurationChange,
}: WearGuideCardProps) {
  const [scenario, setScenario] = useState<Scenario>('now')
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const pickerInputRef = useRef<HTMLInputElement | null>(null)
  const pickerTriggerRef = useRef<HTMLDivElement | null>(null)

  const activePlan = useMemo(() => {
    if (scenario === 'colder') return colderWearPlan
    if (scenario === 'wetter') return wetterWearPlan
    return wearPlan
  }, [scenario, wearPlan, colderWearPlan, wetterWearPlan])

  const [itemQuery, setItemQuery] = useState('')
  const checkedSet = useMemo(() => new Set(checkedWearItems), [checkedWearItems])
  const addedSet = useMemo(() => new Set(addedWearItems), [addedWearItems])
  const catalogByItem = useMemo(
    () => new Map(WEAR_ITEM_CATALOG.map(({ item, zone }) => [item, zone])),
    []
  )
  const baseItems = useMemo(() => {
    if (!activePlan) return new Set<string>()
    const coverage = activePlan.coverage
    const optional = activePlan.optionalCoverage
    return new Set([
      ...coverage.feet,
      ...coverage.legs,
      ...coverage.torso,
      ...coverage.hands,
      ...coverage.neckFace,
      ...coverage.head,
      ...coverage.eyes,
      ...Object.values(optional).flat(),
    ])
  }, [activePlan])

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

  const resetAddedItems = () => {
    if (addedWearItems.length === 0) return
    onAddedWearItemsChange([])
    onCheckedWearItemsChange(checkedWearItems.filter((item) => !addedSet.has(item)))
  }

  const hasEdits = addedWearItems.length > 0 || removedWearItems.length > 0

  const resetEdits = () => {
    if (!hasEdits) return
    const editedItems = new Set([...addedWearItems, ...removedWearItems])
    onAddedWearItemsChange([])
    onRemovedWearItemsChange([])
    onCheckedWearItemsChange(checkedWearItems.filter((item) => !editedItems.has(item)))
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
    <Card>
      <CardHeader>
        <Badge variant="glow">Wear guide</Badge>
        <CardTitle className="text-2xl">Wear-ready guidance for {SPORT_LABELS[sport]}</CardTitle>
        <CardDescription>
          Adaptive layer planning that responds to conditions, effort, and how you run hot or cold.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : !activePlan ? (
          <p className="text-sm text-ink-100/70">Select a location and time to see gear.</p>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="rounded-lg border border-ink-200/10 bg-ink-950/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">
                    {scenario === 'now'
                      ? 'Layer breakdown'
                      : scenario === 'colder'
                        ? 'Layer breakdown (colder)'
                        : 'Layer breakdown (wet)'}
                  </p>
                </div>
                <div className="mt-4 space-y-4">
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
                        className="w-[min(90vw,22rem)] border border-ink-200/10 bg-ink-950 text-ink-50"
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
                                        : 'hover:border-tide-300/50 hover:bg-ink-950/60'
                                    }
                                  >
                                    <span className="flex flex-1 items-center justify-between gap-3">
                                      <span>{isActive ? item : `Add ${item}`}</span>
                                      <span className="rounded-lg border border-ink-200/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-ink-100/70">
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
                  <div className="rounded-lg border border-ink-200/10 bg-ink-950/40 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                        Wear edits
                      </p>
                      <button
                        type="button"
                        onClick={resetEdits}
                        disabled={!hasEdits}
                        className={cn(
                          'rounded-lg border border-ink-200/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink-100/70 transition hover:border-tide-300/40 hover:text-ink-50',
                          !hasEdits && 'cursor-not-allowed opacity-50 hover:border-ink-200/20'
                        )}
                      >
                        Reset edits
                      </button>
                    </div>
                    <div className="mt-3 space-y-3 text-xs text-ink-100/70">
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="uppercase tracking-[0.2em] text-ink-100/60">Added</span>
                        <div className="flex flex-1 flex-wrap gap-2">
                          {addedWearItems.length ? (
                            addedWearItems.map((item) => (
                              <span
                                key={`added-${item}`}
                                className="rounded-lg border border-tide-300/30 bg-ink-900/70 px-2 py-0.5 text-[11px] uppercase tracking-[0.15em] text-ink-50"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-ink-100/50">None</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-start gap-2">
                        <span className="uppercase tracking-[0.2em] text-ink-100/60">Removed</span>
                        <div className="flex flex-1 flex-wrap gap-2">
                          {removedWearItems.length ? (
                            removedWearItems.map((item) => (
                              <span
                                key={`removed-${item}`}
                                className="rounded-lg border border-spice-200/30 bg-ink-900/70 px-2 py-0.5 text-[11px] uppercase tracking-[0.15em] text-ink-50"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-ink-100/50">None</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {coverageSections.map((section) => {
                      const items = activePlan.coverage[section.key].filter(
                        (item) => !removedWearItems.includes(item)
                      )
                      const optionalItems = (activePlan.optionalCoverage[section.key] ?? []).filter(
                        (item) => !removedWearItems.includes(item)
                      )
                      const addedItems = addedWearItems.filter(
                        (item) => catalogByItem.get(item) === section.key
                      )
                      const displayAddedItems = addedItems.filter(
                        (item) => !items.includes(item) && !optionalItems.includes(item)
                      )
                      const displayItems = [...items, ...displayAddedItems]
                      const Icon = section.icon
                      return (
                        <div
                          key={section.key}
                          className="rounded-lg border border-ink-200/10 bg-ink-950/50 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200/10 bg-ink-900/60">
                              <Icon className={cn('h-4 w-4', section.accent)} />
                            </div>
                            <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                              {section.label}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {displayItems.length ? (
                              displayItems.map((item) => (
                                <div
                                  key={item}
                                  className={cn(
                                    'flex items-center gap-2 rounded-lg border border-ink-200/15 bg-ink-900/60 px-3 py-1 text-xs text-ink-50 transition',
                                    checkedSet.has(item) &&
                                      'border-tide-300/40 bg-ink-900/70 text-ink-100'
                                  )}
                                >
                                  <label className="flex cursor-pointer items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={checkedSet.has(item)}
                                      onChange={() => handleToggleWearItem(item)}
                                      className="h-3.5 w-3.5 rounded border-ink-200/30 bg-ink-950/60 text-tide-300 focus:ring-tide-300/60"
                                    />
                                    {item}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveWearItem(item)}
                                    className="ml-1 text-xs text-ink-100/60 transition hover:text-spice-200"
                                    aria-label="Remove item"
                                  >
                                    x
                                  </button>
                                </div>
                              ))
                            ) : (
                              <span className="text-xs text-ink-100/50">None</span>
                            )}
                            {optionalItems.map((item) => (
                              <div
                                key={`optional-${item}`}
                                className={cn(
                                  'flex items-center gap-2 rounded-lg border border-dashed border-ink-200/20 px-3 py-1 text-xs text-ink-100/70 transition',
                                  checkedSet.has(item) && 'border-tide-300/40 text-ink-100'
                                )}
                              >
                                <label className="flex cursor-pointer items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={checkedSet.has(item)}
                                    onChange={() => handleToggleWearItem(item)}
                                    className="h-3.5 w-3.5 rounded border-ink-200/30 bg-ink-950/60 text-tide-300 focus:ring-tide-300/60"
                                  />
                                  Optional: {item}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWearItem(item)}
                                  className="ml-1 text-xs text-ink-100/60 transition hover:text-spice-200"
                                  aria-label="Remove item"
                                >
                                  x
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activePlan.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-lg border border-ink-200/20 bg-ink-900/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-ink-100/80"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-ink-200/10 bg-ink-950/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Tune this plan</p>
                <p className="mt-2 text-sm text-ink-100/70">
                  Adjust comfort and effort to match how you actually feel outside.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">Scenario</p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'now'), 'w-full sm:w-auto')}
                        onClick={() => {
                          resetAddedItems()
                          setScenario('now')
                        }}
                      >
                        Now
                      </button>
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'colder'), 'w-full sm:w-auto')}
                        onClick={() => {
                          resetAddedItems()
                          setScenario('colder')
                        }}
                        disabled={!colderWearPlan}
                      >
                        10F colder
                      </button>
                      <button
                        type="button"
                        className={cn(optionClass(scenario === 'wetter'), 'w-full sm:w-auto')}
                        onClick={() => {
                          resetAddedItems()
                          setScenario('wetter')
                        }}
                        disabled={!wetterWearPlan}
                      >
                        Gets wet
                      </button>
                    </div>
                  </div>
                  <ComfortProfileControls
                    profile={comfortProfile}
                    onChange={(profile) => {
                      resetAddedItems()
                      onComfortProfileChange(profile)
                    }}
                  />
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Effort level
                    </p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {exertionOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            resetAddedItems()
                            onExertionChange(option.value)
                          }}
                          className={cn(optionClass(exertion === option.value), 'w-full sm:w-auto')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60">
                      Trip length
                    </p>
                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      {durationOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            resetAddedItems()
                            onDurationChange(option.value)
                          }}
                          className={cn(optionClass(duration === option.value), 'w-full sm:w-auto')}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
