import type { BodyZone } from '@/lib/gear'

export type WarmthRating = 1 | 2 | 3 | 4 | 5 // 1=ultralight, 5=heavy insulation
export type WaterproofRating = 'none' | 'water-resistant' | 'waterproof'
export type GearCondition = 'new' | 'good' | 'fair' | 'worn'

export type GearItem = {
  id: string // UUID or timestamp-based
  name: string // "Patagonia R1 Hoody"
  category: string // "Mid layer" - maps to WEAR_ITEM_CATALOG
  zone: BodyZone // feet|legs|torso|hands|neckFace|head|eyes
  warmth: WarmthRating // 1-5 scale
  waterproof: WaterproofRating
  weight?: number // grams, optional
  condition: GearCondition
  notes?: string
  createdAt: number
  lastUsed?: number // Track usage for smart sorting
}

export type GearInventory = {
  version: number // Schema version for migrations
  items: GearItem[]
}

// Maps generic recommendation → owned gear IDs
export type GearMappings = Record<string, string[]>
// Example: { "Mid layer": ["uuid-123"], "Insulated gloves": ["uuid-456", "uuid-789"] }
