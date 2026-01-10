import { useMemo, useState } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import type { GearSuggestion } from '@/lib/gear'
import type { LoadStatus } from '@/features/home/types'
import { cn } from '@/lib/utils'

type PackListCardProps = {
  status: LoadStatus
  gear: GearSuggestion | null
  checkedItems: string[]
  onCheckedItemsChange: (items: string[]) => void
  customItems: string[]
  onCustomItemsChange: (items: string[]) => void
  removedItems: string[]
  onRemovedItemsChange: (items: string[]) => void
}

export function PackListCard({
  status,
  gear,
  checkedItems,
  onCheckedItemsChange,
  customItems,
  onCustomItemsChange,
  removedItems,
  onRemovedItemsChange,
}: PackListCardProps) {
  const packItems = useMemo(() => gear?.pack ?? [], [gear])
  const combinedItems = useMemo(() => {
    const seen = new Set<string>()
    const next: string[] = []
    packItems.forEach((item) => {
      if (removedItems.includes(item)) return
      if (seen.has(item)) return
      seen.add(item)
      next.push(item)
    })
    customItems.forEach((item) => {
      const trimmed = item.trim()
      if (!trimmed || seen.has(trimmed)) return
      seen.add(trimmed)
      next.push(trimmed)
    })
    return next
  }, [packItems, customItems, removedItems])
  const checkedSet = useMemo(() => new Set(checkedItems), [checkedItems])
  const [customValue, setCustomValue] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const handleToggleItem = (item: string) => {
    if (checkedSet.has(item)) {
      onCheckedItemsChange(checkedItems.filter((entry) => entry !== item))
    } else {
      onCheckedItemsChange([...checkedItems, item])
    }
  }

  const handleAddItem = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    if (!customItems.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      onCustomItemsChange([...customItems, trimmed])
    }
    setCustomValue('')
  }

  const handleRemoveItem = (item: string) => {
    if (customItems.includes(item)) {
      onCustomItemsChange(customItems.filter((entry) => entry !== item))
      onCheckedItemsChange(checkedItems.filter((entry) => entry !== item))
      return
    }
    if (!removedItems.includes(item)) {
      onRemovedItemsChange([...removedItems, item])
    }
    onCheckedItemsChange(checkedItems.filter((entry) => entry !== item))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl font-bold">What to pack</CardTitle>
        <CardDescription>Check items off as you go.</CardDescription>
      </CardHeader>
      <CardContent>
        {status === 'loading' ? (
          <div className="grid gap-3">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        ) : gear ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {isAddOpen ? (
                <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto]">
                  <Input
                    placeholder="Add an item to pack"
                    value={customValue}
                    onChange={(event) => setCustomValue(event.target.value)}
                    className="h-11"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        handleAddItem()
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:from-indigo-600 hover:to-indigo-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddOpen(false)
                        setCustomValue('')
                      }}
                      className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-medium text-slate-400 transition hover:bg-slate-700/50"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/60 px-4 text-xs font-medium uppercase tracking-[0.15em] text-slate-300 shadow-sm transition hover:border-indigo-500/40 hover:bg-indigo-900/30"
                >
                  Add item
                </button>
              )}
            </div>
            <div className="grid gap-3">
              {combinedItems.map((item) => {
                const checked = checkedSet.has(item)
                const isCustom = customItems.includes(item)
                return (
                  <label
                    key={item}
                    className={cn(
                      'flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/60 px-4 py-3 text-sm text-slate-200 shadow-sm transition',
                      checked && 'border-emerald-500/50 bg-emerald-900/30 text-emerald-300'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleToggleItem(item)}
                        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-emerald-500 focus:ring-emerald-500/40"
                      />
                      <span className="font-medium">{item}</span>
                      {!isCustom && (
                        <span className="rounded-md bg-slate-700/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                          Suggested
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:text-pink-400"
                      aria-label={isCustom ? 'Remove custom item' : 'Remove item'}
                    >
                      x
                    </button>
                  </label>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">Pack list will appear with your forecast.</p>
        )}
      </CardContent>
    </Card>
  )
}
