import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type {
  GearCondition,
  GearItem,
  WarmthRating,
  WaterproofRating,
} from '@/features/inventory/types'
import { WEAR_ITEM_CATALOG, type BodyZone } from '@/lib/gear'

type GearItemFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (item: Omit<GearItem, 'id' | 'createdAt'>) => void
  editItem?: GearItem
}

const ZONE_LABELS: Record<BodyZone, string> = {
  feet: 'Feet',
  legs: 'Legs',
  torso: 'Torso',
  hands: 'Hands',
  neckFace: 'Neck + Face',
  head: 'Head',
  eyes: 'Eyes',
}

const WARMTH_LABELS: Record<WarmthRating, string> = {
  1: '1 - Ultralight',
  2: '2 - Light',
  3: '3 - Medium',
  4: '4 - Warm',
  5: '5 - Heavy Insulation',
}

const WATERPROOF_LABELS: Record<WaterproofRating, string> = {
  none: 'None',
  'water-resistant': 'Water-Resistant',
  waterproof: 'Waterproof',
}

const CONDITION_LABELS: Record<GearCondition, string> = {
  new: 'New',
  good: 'Good',
  fair: 'Fair',
  worn: 'Worn',
}

export function GearItemForm({ open, onOpenChange, onSave, editItem }: GearItemFormProps) {
  const [name, setName] = useState(editItem?.name ?? '')
  const [category, setCategory] = useState(editItem?.category ?? '')
  const [zone, setZone] = useState<BodyZone>(editItem?.zone ?? 'torso')
  const [warmth, setWarmth] = useState<WarmthRating>(editItem?.warmth ?? 3)
  const [waterproof, setWaterproof] = useState<WaterproofRating>(editItem?.waterproof ?? 'none')
  const [weight, setWeight] = useState(editItem?.weight?.toString() ?? '')
  const [condition, setCondition] = useState<GearCondition>(editItem?.condition ?? 'good')
  const [notes, setNotes] = useState(editItem?.notes ?? '')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !category.trim()) {
      return
    }

    onSave({
      name: name.trim(),
      category: category.trim(),
      zone,
      warmth,
      waterproof,
      weight: weight ? Number(weight) : undefined,
      condition,
      notes: notes.trim() || undefined,
      lastUsed: editItem?.lastUsed,
    })

    // Reset form
    setName('')
    setCategory('')
    setZone('torso')
    setWarmth(3)
    setWaterproof('none')
    setWeight('')
    setCondition('good')
    setNotes('')

    onOpenChange(false)
  }

  // Get unique categories from catalog
  const categories = Array.from(new Set(WEAR_ITEM_CATALOG.map((entry) => entry.item))).sort()

  // Get zones
  const zones: BodyZone[] = ['feet', 'legs', 'torso', 'hands', 'neckFace', 'head', 'eyes']

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editItem ? 'Edit Gear Item' : 'Add Gear Item'}</DialogTitle>
          <DialogDescription>
            {editItem
              ? 'Update the details of your gear item.'
              : 'Add a new item to your gear inventory.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Patagonia R1 Hoody"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => value && setCategory(value)}
              required
            >
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zone">Body Zone *</Label>
              <Select value={zone} onValueChange={(value) => setZone(value as BodyZone)} required>
                <SelectTrigger id="zone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>
                      {ZONE_LABELS[z]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={condition}
                onValueChange={(value) => setCondition(value as GearCondition)}
              >
                <SelectTrigger id="condition">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warmth">Warmth Rating</Label>
              <Select
                value={warmth.toString()}
                onValueChange={(value) => setWarmth(Number(value) as WarmthRating)}
              >
                <SelectTrigger id="warmth">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WARMTH_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="waterproof">Waterproofing</Label>
              <Select
                value={waterproof}
                onValueChange={(value) => setWaterproof(value as WaterproofRating)}
              >
                <SelectTrigger id="waterproof">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WATERPROOF_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (grams, optional)</Label>
            <Input
              id="weight"
              type="number"
              min="0"
              placeholder="e.g., 310"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Great for cool morning runs"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editItem ? 'Save Changes' : 'Add Item'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
