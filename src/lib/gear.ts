import type { SportType } from './weather'

export type GearSuggestion = {
  wear: string[]
  pack: string[]
  wearPlan: WearPlan
}

export type TemperaturePreference = 'runs_cold' | 'neutral' | 'runs_hot'
export type WindSensitivity = 'low' | 'normal' | 'high'
export type PrecipitationPreference = 'avoid' | 'neutral' | 'okay'

export type ComfortProfile = {
  temperaturePreference: TemperaturePreference
  windSensitivity: WindSensitivity
  precipitationPreference: PrecipitationPreference
}

export type ExertionLevel = 'easy' | 'steady' | 'hard'
export type TripDuration = 'short' | 'medium' | 'long'

export type WearContext = {
  exertion: ExertionLevel
  duration: TripDuration
}

export type BodyZone = 'feet' | 'legs' | 'torso' | 'hands' | 'neckFace' | 'head' | 'eyes'

export type WearPlan = {
  primary: string[]
  coverage: Record<BodyZone, string[]>
  optionalCoverage: Partial<Record<BodyZone, string[]>>
  optional: string[]
  reasons: string[]
  confidence: 'high' | 'medium' | 'low'
  effectiveTemp: number
  adjustments: string[]
}

export const DEFAULT_COMFORT_PROFILE: ComfortProfile = {
  temperaturePreference: 'neutral',
  windSensitivity: 'normal',
  precipitationPreference: 'neutral',
}

export const DEFAULT_WEAR_CONTEXT: WearContext = {
  exertion: 'steady',
  duration: 'medium',
}

type WeatherInputs = {
  temperature: number
  feelsLike: number
  windSpeed: number
  windGusts: number
  precipitationProbability: number
  precipitation: number
  conditionLabel: string
  cloudCover: number
}

export type WearOverrides = Partial<WeatherInputs>

function isTemperaturePreference(value: unknown): value is TemperaturePreference {
  return value === 'runs_cold' || value === 'neutral' || value === 'runs_hot'
}

function isWindSensitivity(value: unknown): value is WindSensitivity {
  return value === 'low' || value === 'normal' || value === 'high'
}

function isPrecipitationPreference(value: unknown): value is PrecipitationPreference {
  return value === 'avoid' || value === 'neutral' || value === 'okay'
}

export function normalizeComfortProfile(value: unknown): ComfortProfile {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_COMFORT_PROFILE }
  }
  const profile = value as Partial<ComfortProfile>
  return {
    temperaturePreference: isTemperaturePreference(profile.temperaturePreference)
      ? profile.temperaturePreference
      : DEFAULT_COMFORT_PROFILE.temperaturePreference,
    windSensitivity: isWindSensitivity(profile.windSensitivity)
      ? profile.windSensitivity
      : DEFAULT_COMFORT_PROFILE.windSensitivity,
    precipitationPreference: isPrecipitationPreference(profile.precipitationPreference)
      ? profile.precipitationPreference
      : DEFAULT_COMFORT_PROFILE.precipitationPreference,
  }
}

function unique(items: string[]) {
  return Array.from(new Set(items))
}

function commonPackList(weather: WeatherInputs, profile: ComfortProfile) {
  const pack = ['Hydration', 'Snacks']
  const precipThreshold =
    profile.precipitationPreference === 'avoid'
      ? 20
      : profile.precipitationPreference === 'okay'
        ? 55
        : 40

  if (weather.precipitationProbability >= precipThreshold) {
    pack.push('Waterproof shell', 'Dry socks')
  }
  if (weather.windGusts >= 20) {
    pack.push('Wind shell')
  }
  if (weather.temperature <= 40) {
    pack.push('Spare base layer', 'Hand warmers')
  }
  if (weather.conditionLabel.toLowerCase().includes('snow')) {
    pack.push('Gaiters', 'Lens cloth')
  }

  return pack
}

function getWindThresholds(profile: ComfortProfile) {
  const windThreshold =
    profile.windSensitivity === 'high' ? 10 : profile.windSensitivity === 'low' ? 20 : 15
  const gustThreshold =
    profile.windSensitivity === 'high' ? 20 : profile.windSensitivity === 'low' ? 30 : 25
  return { windThreshold, gustThreshold }
}

function getPrecipThreshold(profile: ComfortProfile) {
  return profile.precipitationPreference === 'avoid'
    ? 20
    : profile.precipitationPreference === 'okay'
      ? 55
      : 40
}

function computeEffectiveTemp(
  sport: SportType,
  weather: WeatherInputs,
  profile: ComfortProfile,
  context: WearContext
) {
  const adjustments: string[] = []
  const reasons: string[] = []
  const base = weather.feelsLike
  let effective = base

  const sportOffset = sport === 'running' ? 6 : 0
  if (sportOffset !== 0) {
    effective += sportOffset
    adjustments.push(`Running heat: +${sportOffset}F`)
  }

  const exertionOffset = context.exertion === 'hard' ? 8 : context.exertion === 'steady' ? 4 : 0
  if (exertionOffset !== 0) {
    effective += exertionOffset
    adjustments.push(`Effort level: +${exertionOffset}F`)
  }

  const durationOffset = context.duration === 'long' ? -4 : context.duration === 'medium' ? -2 : 0
  if (durationOffset !== 0) {
    effective += durationOffset
    adjustments.push(`Long exposure: ${durationOffset}F`)
  }

  const comfortOffset =
    profile.temperaturePreference === 'runs_cold'
      ? -6
      : profile.temperaturePreference === 'runs_hot'
        ? 6
        : 0
  if (comfortOffset !== 0) {
    effective += comfortOffset
    const label = comfortOffset > 0 ? `Runs warm: +${comfortOffset}F` : `Runs cold: ${comfortOffset}F`
    adjustments.push(label)
  }

  const { windThreshold, gustThreshold } = getWindThresholds(profile)
  const isWindy = weather.windSpeed >= windThreshold || weather.windGusts >= gustThreshold
  let windPenalty = 0
  if (isWindy) {
    windPenalty = profile.windSensitivity === 'high' ? -6 : profile.windSensitivity === 'low' ? -3 : -4
    if (weather.windGusts >= gustThreshold + 10) {
      windPenalty -= 2
    }
    effective += windPenalty
    adjustments.push(`Wind exposure: ${windPenalty}F`)
  }

  const precipThreshold = getPrecipThreshold(profile)
  const isWet =
    weather.precipitationProbability >= precipThreshold || weather.precipitation > 0.05
  let precipPenalty = 0
  if (isWet) {
    precipPenalty =
      weather.precipitationProbability >= 70 || weather.precipitation >= 0.15 ? -6 : -4
    effective += precipPenalty
    adjustments.push(`Wet conditions: ${precipPenalty}F`)
  }

  if (weather.cloudCover >= 70) {
    effective -= 2
    adjustments.push('Low sun: -2F')
  } else if (weather.cloudCover <= 20) {
    effective += 2
    adjustments.push('Bright sun: +2F')
  }

  if (isWet) {
    const label = weather.conditionLabel.toLowerCase().includes('snow') ? 'Snow expected' : 'Rain likely'
    reasons.push(label)
  }
  if (isWindy) {
    const gustLabel = Math.round(weather.windGusts)
    reasons.push(`Gusts ${gustLabel} mph`)
  }

  if (reasons.length < 3 && weather.cloudCover <= 20) {
    reasons.push('Bright sun')
  }

  return {
    effectiveTemp: Math.round(effective),
    adjustments,
    reasons: reasons.slice(0, 3),
    isWet,
    isWindy,
  }
}

function computeConfidence(
  sport: SportType,
  effectiveTemp: number,
  isWet: boolean,
  weather: WeatherInputs
) {
  const thresholds = sport === 'running' ? [20, 35, 50, 65] : [10, 25, 40]
  const minDiff = thresholds.reduce((closest, value) => {
    const diff = Math.abs(effectiveTemp - value)
    return diff < closest ? diff : closest
  }, Number.POSITIVE_INFINITY)

  let score = minDiff <= 3 ? 1 : minDiff <= 6 ? 2 : 3
  if (isWet && weather.precipitationProbability >= 60) {
    score -= 1
  }
  if (weather.windGusts >= 30) {
    score -= 1
  }

  if (score <= 1) return 'low'
  if (score === 2) return 'medium'
  return 'high'
}

export function getWearPlan(
  sport: SportType,
  weather: WeatherInputs,
  profile: ComfortProfile = DEFAULT_COMFORT_PROFILE,
  context: WearContext = DEFAULT_WEAR_CONTEXT,
  overrides?: WearOverrides
): WearPlan {
  const mergedWeather = { ...weather, ...overrides }
  const { effectiveTemp, adjustments, reasons, isWet, isWindy } = computeEffectiveTemp(
    sport,
    mergedWeather,
    profile,
    context
  )

  const coverage: Record<BodyZone, string[]> = {
    feet: [],
    legs: [],
    torso: [],
    hands: [],
    neckFace: [],
    head: [],
    eyes: [],
  }
  const optionalCoverage: Partial<Record<BodyZone, string[]>> = {}

  const addCoverage = (zone: BodyZone, ...items: string[]) => {
    items.forEach((item) => {
      if (!coverage[zone].includes(item)) {
        coverage[zone].push(item)
      }
    })
  }
  const addOptionalCoverage = (zone: BodyZone, ...items: string[]) => {
    if (!optionalCoverage[zone]) {
      optionalCoverage[zone] = []
    }
    items.forEach((item) => {
      if (optionalCoverage[zone] && !optionalCoverage[zone]!.includes(item)) {
        optionalCoverage[zone]!.push(item)
      }
    })
  }

  if (sport === 'running') {
    addCoverage('feet', 'Running shoes', 'Running socks')
    if (effectiveTemp <= 20) {
      addCoverage('legs', 'Thermal tights')
      addCoverage('torso', 'Thermal mid layer', 'Insulated running jacket')
      addCoverage('hands', 'Insulated gloves')
      addCoverage('head', 'Beanie or ear band')
      addCoverage('feet', 'Wool socks')
    } else if (effectiveTemp <= 35) {
      addCoverage('legs', 'Tights')
      addCoverage('torso', 'Long-sleeve mid layer', 'Wind-resistant jacket')
      addCoverage('hands', 'Light gloves')
      addCoverage('head', 'Beanie')
    } else if (effectiveTemp <= 50) {
      addCoverage('legs', 'Tights or knee sleeves')
      addCoverage('torso', 'Long-sleeve top', 'Light shell if breezy')
    } else if (effectiveTemp <= 65) {
      addCoverage('legs', 'Shorts')
      addCoverage('torso', 'Short-sleeve top')
      addCoverage('head', 'Cap or visor')
    } else {
      addCoverage('legs', 'Shorts')
      addCoverage('torso', 'Ultralight top')
      addCoverage('head', 'Sun cap')
    }

    if (isWet) {
      addCoverage('torso', 'Waterproof shell')
      addCoverage('head', 'Brimmed cap')
    }
    if (isWindy) {
      addCoverage('torso', 'Wind shell')
    }
  }

  if (sport === 'skiing') {
    addCoverage('feet', 'Ski boots', 'Ski socks')
    if (effectiveTemp <= 10) {
      addCoverage('legs', 'Insulated pants')
      addCoverage('torso', 'Heavy mid layer', 'Insulated jacket')
      addCoverage('hands', 'Mittens')
      addCoverage('neckFace', 'Neck gaiter', 'Balaclava')
    } else if (effectiveTemp <= 25) {
      addCoverage('legs', 'Insulated pants')
      addCoverage('torso', 'Warm mid layer', 'Shell jacket')
      addCoverage('hands', 'Gloves')
      addCoverage('neckFace', 'Neck gaiter')
    } else if (effectiveTemp <= 40) {
      addCoverage('legs', 'Shell pants')
      addCoverage('torso', 'Mid layer', 'Shell jacket')
      addCoverage('hands', 'Gloves')
      addCoverage('head', 'Helmet liner')
    } else {
      addCoverage('legs', 'Shell pants')
      addCoverage('torso', 'Light mid layer', 'Shell jacket')
      addCoverage('hands', 'Light gloves')
    }

    addCoverage('head', 'Helmet')
    addCoverage('eyes', 'Goggles')
    if (isWet || isWindy) {
      addCoverage('torso', 'Storm shell')
      addCoverage('eyes', 'Goggle cover')
    }
  }

  const primary = unique([
    ...coverage.feet,
    ...coverage.legs,
    ...coverage.torso,
    ...coverage.hands,
    ...coverage.neckFace,
    ...coverage.head,
    ...coverage.eyes,
  ])

  const optional: string[] = []
  const confidence = computeConfidence(sport, effectiveTemp, isWet, mergedWeather)
  if (confidence !== 'high') {
    optional.push('Pack a light shell')
    addOptionalCoverage('torso', 'Light shell')
  }
  if (isWet) {
    optional.push('Spare dry layer')
    addOptionalCoverage('torso', 'Spare dry layer')
  }
  if (effectiveTemp <= 35) {
    optional.push('Hand warmers')
    addOptionalCoverage('hands', 'Hand warmers')
  }
  if (effectiveTemp >= 65) {
    optional.push('Light layer for cooldown')
    addOptionalCoverage('torso', 'Light layer for cooldown')
  }

  return {
    primary: unique(primary),
    coverage: {
      feet: unique(coverage.feet),
      legs: unique(coverage.legs),
      torso: unique(coverage.torso),
      hands: unique(coverage.hands),
      neckFace: unique(coverage.neckFace),
      head: unique(coverage.head),
      eyes: unique(coverage.eyes),
    },
    optionalCoverage,
    optional: unique(optional),
    reasons,
    confidence,
    effectiveTemp,
    adjustments,
  }
}

export function getGearSuggestions(
  sport: SportType,
  weather: WeatherInputs,
  profile: ComfortProfile = DEFAULT_COMFORT_PROFILE,
  context: WearContext = DEFAULT_WEAR_CONTEXT
): GearSuggestion {
  const wearPlan = getWearPlan(sport, weather, profile, context)
  const pack = commonPackList(weather, profile)
  return {
    wear: wearPlan.primary,
    pack: unique(pack),
    wearPlan,
  }
}
