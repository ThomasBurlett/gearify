import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-ink-200/20 bg-ink-900/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-ink-50/80',
  {
    variants: {
      variant: {
        default: '',
        glow: 'border-tide-300/40 bg-tide-500/10 text-tide-100',
        warm: 'border-spice-400/40 bg-spice-500/10 text-spice-100',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge }
