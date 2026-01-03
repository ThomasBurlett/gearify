import { useEffect, useState } from 'react'

import { DEFAULT_COMFORT_PROFILE, normalizeComfortProfile, type ComfortProfile } from '@/lib/gear'

const COMFORT_PROFILE_STORAGE_KEY = 'gearcast.comfortProfile'

export function useComfortProfileStorage(
  profile: ComfortProfile,
  setProfile: (profile: ComfortProfile) => void
) {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMFORT_PROFILE_STORAGE_KEY)
      if (stored) {
        setProfile(normalizeComfortProfile(JSON.parse(stored)))
      } else {
        setProfile(DEFAULT_COMFORT_PROFILE)
      }
    } catch {
      setProfile(DEFAULT_COMFORT_PROFILE)
    } finally {
      setHasHydrated(true)
    }
  }, [setProfile])

  useEffect(() => {
    if (!hasHydrated) return
    try {
      localStorage.setItem(COMFORT_PROFILE_STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // Ignore storage errors.
    }
  }, [hasHydrated, profile])
}
