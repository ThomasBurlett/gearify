import { useMemo } from 'react'

import type { GearItem } from '@/features/inventory/types'
import { useHomeStore } from '@/features/home/store/useHomeStore'

export function useGearMappings(inventory: GearItem[]) {
  const gearMappings = useHomeStore((state) => state.gearMappings)
  const setGearMappings = useHomeStore((state) => state.setGearMappings)

  // Create a map of gear items by ID for quick lookup
  const gearById = useMemo(() => {
    return new Map(inventory.map((item) => [item.id, item]))
  }, [inventory])

  // Get mapped gear items for a recommendation
  const getMappedGear = (recommendation: string): GearItem[] => {
    const gearIds = gearMappings[recommendation] || []
    return gearIds.map((id) => gearById.get(id)).filter((item): item is GearItem => !!item)
  }

  // Check if a recommendation has any mappings
  const hasMappingFor = (recommendation: string): boolean => {
    const gearIds = gearMappings[recommendation]
    return !!gearIds && gearIds.length > 0
  }

  // Set mapping for a recommendation
  const setMapping = (recommendation: string, gearIds: string[]) => {
    setGearMappings((prev) => ({
      ...prev,
      [recommendation]: gearIds,
    }))
  }

  // Clear mapping for a recommendation
  const clearMapping = (recommendation: string) => {
    setGearMappings((prev) => {
      const next = { ...prev }
      delete next[recommendation]
      return next
    })
  }

  // Find matching gear items for a recommendation based on category
  const findMatchingGear = (recommendation: string): GearItem[] => {
    return inventory.filter((item) => {
      // Exact match
      if (item.category.toLowerCase() === recommendation.toLowerCase()) {
        return true
      }
      // Fuzzy match - check if recommendation contains category or vice versa
      const recLower = recommendation.toLowerCase()
      const catLower = item.category.toLowerCase()
      return recLower.includes(catLower) || catLower.includes(recLower)
    })
  }

  // Auto-suggest mappings for recommendations
  const suggestMappings = (recommendations: string[]): Record<string, string[]> => {
    const suggestions: Record<string, string[]> = {}

    recommendations.forEach((recommendation) => {
      // Skip if already mapped
      if (hasMappingFor(recommendation)) {
        return
      }

      // Find matching gear
      const matches = findMatchingGear(recommendation)
      if (matches.length > 0) {
        // Sort by lastUsed (most recent first), then by condition
        const sorted = [...matches].sort((a, b) => {
          if (a.lastUsed && b.lastUsed) {
            return b.lastUsed - a.lastUsed
          }
          if (a.lastUsed) return -1
          if (b.lastUsed) return 1

          // Sort by condition: new > good > fair > worn
          const conditionOrder = { new: 4, good: 3, fair: 2, worn: 1 }
          return conditionOrder[b.condition] - conditionOrder[a.condition]
        })

        // Suggest the best match
        suggestions[recommendation] = [sorted[0].id]
      }
    })

    return suggestions
  }

  return {
    gearMappings,
    getMappedGear,
    hasMappingFor,
    setMapping,
    clearMapping,
    findMatchingGear,
    suggestMappings,
  }
}
