import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <p className="text-sm uppercase tracking-[0.4em] text-ink-100/60">404</p>
      <h1 className="font-display text-3xl text-ink-50">This route is off trail.</h1>
      <p className="text-ink-100/70">
        The link you followed does not exist yet. Head back to Gearify to build a new forecast kit.
      </p>
      <Button asChild>
        <Link to="/">Return home</Link>
      </Button>
    </div>
  )
}
