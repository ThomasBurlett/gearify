import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const conditionIconMap: Array<{ icon: LucideIcon; codes: number[] }> = [
  { icon: Sun, codes: [0, 1] },
  { icon: CloudSun, codes: [2] },
  { icon: Cloud, codes: [3] },
  { icon: CloudFog, codes: [45, 48] },
  { icon: CloudDrizzle, codes: [51, 53, 55] },
  { icon: CloudRain, codes: [61, 63, 65, 80, 81, 82] },
  { icon: CloudSnow, codes: [66, 67, 71, 73, 75, 77, 85, 86] },
  { icon: CloudLightning, codes: [95, 96, 99] },
]

export function getConditionIcon(code?: number | null): LucideIcon {
  if (code === null || code === undefined) return Cloud
  const match = conditionIconMap.find((entry) => entry.codes.includes(code))
  return match?.icon ?? Cloud
}
