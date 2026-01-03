import { createFileRoute } from '@tanstack/react-router'

import HomePage from '@/features/home/HomePage'
import type { HomeSearchParams } from '@/features/home/types'

const validateSearch = (search: Record<string, unknown>): HomeSearchParams => ({
  lat: typeof search.lat === 'string' ? search.lat : undefined,
  lon: typeof search.lon === 'string' ? search.lon : undefined,
  name: typeof search.name === 'string' ? search.name : undefined,
  elev: typeof search.elev === 'string' ? search.elev : undefined,
  time: typeof search.time === 'string' ? search.time : undefined,
})

export const Route = createFileRoute('/$sport')({
  component: HomeRoute,
  validateSearch,
})

function HomeRoute() {
  const { sport } = Route.useParams()
  const search = Route.useSearch()
  return <HomePage sportParam={sport} search={search} />
}
