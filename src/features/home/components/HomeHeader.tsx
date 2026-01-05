import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  FileText,
  Loader2,
  MoreHorizontal,
  Save,
  Star,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { formatDistanceToNow } from '@/lib/time'
import { cn } from '@/lib/utils'

type HomeHeaderProps = {
  canSavePlan: boolean
  onSavePlan: (name: string) => void
  // New props for saved plan mode
  activePlanId: string | null
  activePlanName: string | null
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSavedAt: number | null
  onRenamePlan: (newName: string) => void
  onDuplicatePlan: () => void
  onNewPlan: () => void
  onDeletePlan: () => void
  onToggleFavorite: () => void
  isFavorite: boolean
}

export function HomeHeader({
  canSavePlan,
  onSavePlan,
  activePlanId,
  activePlanName,
  saveStatus,
  lastSavedAt,
  onRenamePlan,
  onDuplicatePlan,
  onNewPlan,
  onDeletePlan,
  onToggleFavorite,
  isFavorite,
}: HomeHeaderProps) {
  const [planName, setPlanName] = useState('')
  const [isSaveOpen, setIsSaveOpen] = useState(false)
  const [isRenamingPlan, setIsRenamingPlan] = useState(false)
  const [planNameDraft, setPlanNameDraft] = useState('')

  const handleSave = () => {
    if (!canSavePlan) return
    onSavePlan(planName.trim())
    setPlanName('')
    setIsSaveOpen(false)
  }

  const handleSaveRename = () => {
    if (planNameDraft.trim()) {
      onRenamePlan(planNameDraft.trim())
    }
    setIsRenamingPlan(false)
    setPlanNameDraft('')
  }

  const handleStartRename = () => {
    setPlanNameDraft(activePlanName || '')
    setIsRenamingPlan(true)
  }

  return (
    <header className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-ink-200/10 bg-ink-950/30 px-6 py-5">
      {/* Left side: Title/Name + Status */}
      <div className="flex flex-wrap items-center gap-4">
        {activePlanId ? (
          // SAVED PLAN STATE
          <div className="flex items-center gap-3">
            <div>
              {isRenamingPlan ? (
                <Input
                  value={planNameDraft}
                  onChange={(e) => setPlanNameDraft(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveRename()
                    }
                    if (e.key === 'Escape') {
                      setIsRenamingPlan(false)
                      setPlanNameDraft('')
                    }
                  }}
                  className="font-display text-2xl h-auto border-0 bg-transparent px-0 focus-visible:ring-1 focus-visible:ring-tide-300"
                />
              ) : (
                <button
                  onClick={handleStartRename}
                  className="group flex items-center gap-2 font-display text-2xl font-semibold tracking-tight text-ink-50 hover:text-tide-200 transition-colors"
                >
                  {activePlanName}
                  <Edit className="h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity" />
                </button>
              )}
              <p className="text-xs uppercase tracking-[0.28em] text-ink-100/70">Saved plan</p>
            </div>

            {/* Auto-save status badge */}
            <Badge
              variant={saveStatus === 'error' ? 'destructive' : 'default'}
              className={cn(
                'h-6 gap-1.5 border-tide-300/40 bg-tide-500/15 text-tide-100 transition-opacity',
                saveStatus === 'saved' && 'opacity-60 hover:opacity-100'
              )}
            >
              {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
              {saveStatus === 'saved' && <CheckCircle className="h-3 w-3" />}
              {saveStatus === 'error' && <AlertCircle className="h-3 w-3" />}
              <span className="text-[11px] uppercase tracking-[0.2em]">
                {saveStatus === 'saving' ? 'Saving' : saveStatus === 'error' ? 'Error' : 'Saved'}
              </span>
              {saveStatus === 'saved' && lastSavedAt && (
                <span className="text-[10px]">• {formatDistanceToNow(lastSavedAt)} ago</span>
              )}
            </Badge>
          </div>
        ) : (
          // TEMPORARY PLAN STATE
          <div className="flex items-center gap-3">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight text-ink-50">
                Plan overview
              </p>
              <p className="text-xs uppercase tracking-[0.28em] text-ink-100/70">Temporary plan</p>
            </div>
            <Badge variant="outline" className="h-6 gap-1.5 border-ink-200/30 text-ink-300">
              <Clock className="h-3 w-3" />
              <span className="text-[11px] uppercase tracking-[0.2em]">Temporary</span>
            </Badge>
          </div>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2">
        {activePlanId ? (
          // SAVED PLAN ACTIONS
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="outline" size="sm" className="rounded-lg" />}
            >
              <MoreHorizontal className="h-4 w-4" />
              Plan options
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleStartRename}>
                <Edit className="h-4 w-4" />
                Rename plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicatePlan}>
                <Copy className="h-4 w-4" />
                Duplicate plan
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Star className={cn('h-4 w-4', isFavorite && 'fill-current text-spice-200')} />
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onNewPlan}>
                <FileText className="h-4 w-4" />
                New temporary plan
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDeletePlan}
                className="text-red-500 focus:text-red-600 focus:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          // TEMPORARY PLAN ACTIONS
          <Popover open={isSaveOpen} onOpenChange={setIsSaveOpen} modal={false}>
            <PopoverTrigger
              render={
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-lg"
                  disabled={!canSavePlan}
                />
              }
            >
              <Save className="h-4 w-4" />
              Save to plans
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="z-50 w-[min(90vw,20rem)] border border-ink-100/30 bg-ink-900 text-ink-50 shadow-[0_24px_80px_rgba(0,0,0,0.7)] ring-1 ring-ink-100/15"
              initialFocus={false}
              finalFocus={false}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-ink-100/60">Save plan</p>
                  <p className="mt-1 text-sm text-ink-100/70">
                    Name this plan to save it to your plans list.
                  </p>
                </div>
                <Input
                  placeholder="Plan name (optional)"
                  value={planName}
                  onChange={(event) => setPlanName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleSave()
                    }
                  }}
                />
                <div className="flex items-center justify-between gap-2">
                  {!canSavePlan && (
                    <span className="text-xs text-ink-100/60">Pick a location + time first.</span>
                  )}
                  <Button type="button" size="sm" onClick={handleSave} disabled={!canSavePlan}>
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        <SidebarTrigger className="md:hidden" />
      </div>
    </header>
  )
}
