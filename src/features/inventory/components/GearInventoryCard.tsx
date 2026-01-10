import { Package2, Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { GearItemForm } from '@/features/inventory/components/GearItemForm'
import { useGearInventory } from '@/features/inventory/hooks/useGearInventory'
import type { GearItem, WarmthRating, WaterproofRating } from '@/features/inventory/types'
import type { BodyZone } from '@/lib/gear'

const ZONE_LABELS: Record<BodyZone | 'all', string> = {
  all: 'All Zones',
  feet: 'Feet',
  legs: 'Legs',
  torso: 'Torso',
  hands: 'Hands',
  neckFace: 'Neck + Face',
  head: 'Head',
  eyes: 'Eyes',
}

const ZONE_ITEMS = Object.entries(ZONE_LABELS).map(([value, label]) => ({
  value,
  label,
}))

const WARMTH_DOTS: Record<WarmthRating, string> = {
  1: '•',
  2: '••',
  3: '•••',
  4: '••••',
  5: '•••••',
}

const WATERPROOF_ICONS: Record<WaterproofRating, string> = {
  none: '○',
  'water-resistant': '◐',
  waterproof: '●',
}

export function GearInventoryCard() {
  const { items, addItem, updateItem, deleteItem } = useGearInventory()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterZone, setFilterZone] = useState<BodyZone | 'all'>('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editItem, setEditItem] = useState<GearItem | undefined>(undefined)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<GearItem | null>(null)

  // Filter and search items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filter by zone
      if (filterZone !== 'all' && item.zone !== filterZone) {
        return false
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [items, filterZone, searchQuery])

  const handleAddClick = () => {
    setEditItem(undefined)
    setFormOpen(true)
  }

  const handleEditClick = (item: GearItem) => {
    setEditItem(item)
    setFormOpen(true)
  }

  const handleDeleteClick = (item: GearItem) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteItem(itemToDelete.id)
      setItemToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleSave = (data: Omit<GearItem, 'id' | 'createdAt'>) => {
    if (editItem) {
      updateItem(editItem.id, data)
    } else {
      addItem(data)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Gear</CardTitle>
              <CardDescription>Manage your gear inventory</CardDescription>
            </div>
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Gear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by name, category, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filterZone}
              onValueChange={(value) => setFilterZone(value as BodyZone | 'all')}
              items={ZONE_ITEMS}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ZONE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Items count */}
          <div className="text-sm text-slate-400">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            {searchQuery || filterZone !== 'all' ? ` (filtered from ${items.length})` : ''}
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700/50 py-12 text-center">
              <Package2 className="mb-4 h-12 w-12 text-slate-400" />
              <h3 className="mb-2 text-lg font-medium text-slate-200">
                {items.length === 0 ? 'No gear items yet' : 'No items match your filters'}
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                {items.length === 0
                  ? 'Start building your gear inventory by adding your first item.'
                  : 'Try adjusting your search or filter criteria.'}
              </p>
              {items.length === 0 && (
                <Button onClick={handleAddClick}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-700/50 bg-slate-800/60 p-4 transition hover:border-indigo-500/40"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-slate-100">{item.name}</h4>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-slate-100"
                          onClick={() => handleEditClick(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-pink-400"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      <Badge variant="outline" className="text-indigo-300">
                        {item.category}
                      </Badge>
                      <Badge variant="outline" className="text-slate-300">
                        {ZONE_LABELS[item.zone]}
                      </Badge>
                      <span className="text-slate-400" title={`Warmth: ${item.warmth}/5`}>
                        {WARMTH_DOTS[item.warmth]}
                      </span>
                      <span className="text-slate-400" title={`Waterproof: ${item.waterproof}`}>
                        {WATERPROOF_ICONS[item.waterproof]}
                      </span>
                      {item.weight && (
                        <span className="text-slate-400" title="Weight">
                          {item.weight}g
                        </span>
                      )}
                      <span className="text-slate-400 capitalize" title="Condition">
                        {item.condition}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-slate-400 line-clamp-2">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Form */}
      <GearItemForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        editItem={editItem}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Gear Item?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.name}&quot;? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-pink-500">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
