import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) =>
  (() => {
    const viewport = (
      <ToastPrimitives.Viewport
        ref={ref}
        className={cn(
          'fixed bottom-6 left-1/2 z-[9999] flex w-[min(90vw,22rem)] -translate-x-1/2 flex-col gap-2',
          className
        )}
        {...props}
      />
    )
    if (typeof document === 'undefined') {
      return viewport
    }
    return createPortal(viewport, document.body)
  })()
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'relative flex items-start gap-3 rounded-2xl border border-ink-200/20 bg-ink-900/95 p-4 text-ink-50 shadow-lg shadow-ink-950/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-right-2 data-[state=open]:slide-in-from-top-2',
      className
    )}
    {...props}
  />
))
Toast.displayName = ToastPrimitives.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold text-ink-50', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-xs text-ink-100/80', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'ml-auto inline-flex h-6 w-6 items-center justify-center rounded-full border border-ink-200/20 text-ink-100/70 transition hover:text-ink-50',
      className
    )}
    {...props}
  >
    <X className="h-3 w-3" />
    <span className="sr-only">Close</span>
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose }
