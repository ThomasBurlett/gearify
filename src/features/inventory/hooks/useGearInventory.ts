import { useEffect, useMemo, useState } from 'react'

import type {
  GearCondition,
  GearInventory,
  GearItem,
  WarmthRating,
  WaterproofRating,
} from '@/features/inventory/types'
import type { BodyZone } from '@/lib/gear'

const STORAGE_KEY = 'gearcast.inventory'

function normalizeGearItem(value: unknown): GearItem | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Partial<GearItem>

  // Validate required fields
  if (!item.id || !item.name || !item.category || !item.zone) return null

  // Validate warmth rating
  const warmth = Number(item.warmth)
  if (warmth < 1 || warmth > 5) return null

  // Validate waterproof rating
  const validWaterproof: WaterproofRating[] = ['none', 'water-resistant', 'waterproof']
  if (!item.waterproof || !validWaterproof.includes(item.waterproof)) return null

  // Validate condition
  const validConditions: GearCondition[] = ['new', 'good', 'fair', 'worn']
  const condition = item.condition || 'good'
  if (!validConditions.includes(condition)) return null

  // Validate zone
  const validZones: BodyZone[] = ['feet', 'legs', 'torso', 'hands', 'neckFace', 'head', 'eyes']
  if (!validZones.includes(item.zone)) return null

  return {
    id: String(item.id),
    name: String(item.name),
    category: String(item.category),
    zone: item.zone,
    warmth: warmth as WarmthRating,
    waterproof: item.waterproof,
    weight: item.weight ? Number(item.weight) : undefined,
    condition,
    notes: item.notes ? String(item.notes) : undefined,
    createdAt: Number(item.createdAt ?? Date.now()),
    lastUsed: item.lastUsed ? Number(item.lastUsed) : undefined,
  }
}

function normalizeInventory(value: unknown): GearInventory {
  if (!value || typeof value !== 'object') {
    return { version: 1, items: [] }
  }

  const inv = value as Partial<GearInventory>
  const items = Array.isArray(inv.items)
    ? inv.items.map(normalizeGearItem).filter((x): x is GearItem => x !== null)
    : []

  return {
    version: inv.version ?? 1,
    items,
  }
}

export function useGearInventory() {
  const [inventory, setInventory] = useState<GearInventory>({ version: 1, items: [] })
  const [hasHydrated, setHasHydrated] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return
      const parsed = JSON.parse(stored)
      setInventory(normalizeInventory(parsed))
    } catch {
      setInventory({ version: 1, items: [] })
    } finally {
      setHasHydrated(true)
    }
  }, [])

  // Persist to localStorage on changes
  useEffect(() => {
    if (!hasHydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
    } catch {
      // Ignore storage errors
    }
  }, [hasHydrated, inventory])

  const actions = useMemo(() => {
    const addItem = (input: Omit<GearItem, 'id' | 'createdAt'>): GearItem => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`

      const newItem: GearItem = {
        ...input,
        id,
        createdAt: Date.now(),
      }

      setInventory((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }))

      return newItem
    }

    const updateItem = (id: string, updates: Partial<Omit<GearItem, 'id' | 'createdAt'>>) => {
      setInventory((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      }))
    }

    const deleteItem = (id: string) => {
      setInventory((prev) => ({
        ...prev,
        items: prev.items.filter((item) => item.id !== id),
      }))
    }

    const findByCategory = (category: string): GearItem[] => {
      return inventory.items.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      )
    }

    const findByZone = (zone: BodyZone): GearItem[] => {
      return inventory.items.filter((item) => item.zone === zone)
    }

    const findById = (id: string): GearItem | undefined => {
      return inventory.items.find((item) => item.id === id)
    }

    return {
      addItem,
      updateItem,
      deleteItem,
      findByCategory,
      findByZone,
      findById,
    }
  }, [inventory.items])

  return {
    items: inventory.items,
    ...actions,
  }
}
