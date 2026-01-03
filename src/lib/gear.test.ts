import { describe, expect, it } from 'vitest'

import {
  DEFAULT_COMFORT_PROFILE,
  DEFAULT_WEAR_CONTEXT,
  getGearSuggestions,
  getWearPlan,
  normalizeComfortProfile,
  type ComfortProfile,
  type WearContext,
} from './gear'

describe('gear recommendation logic', () => {
  describe('normalizeComfortProfile', () => {
    it('returns default profile for invalid input', () => {
      expect(normalizeComfortProfile(null)).toEqual(DEFAULT_COMFORT_PROFILE)
      expect(normalizeComfortProfile(undefined)).toEqual(DEFAULT_COMFORT_PROFILE)
      expect(normalizeComfortProfile('invalid')).toEqual(DEFAULT_COMFORT_PROFILE)
      expect(normalizeComfortProfile(123)).toEqual(DEFAULT_COMFORT_PROFILE)
    })

    it('returns default profile for empty object', () => {
      expect(normalizeComfortProfile({})).toEqual(DEFAULT_COMFORT_PROFILE)
    })

    it('normalizes partial profile with defaults', () => {
      const result = normalizeComfortProfile({
        temperaturePreference: 'runs_cold',
      })
      expect(result).toEqual({
        temperaturePreference: 'runs_cold',
        windSensitivity: 'normal',
        precipitationPreference: 'neutral',
      })
    })

    it('validates and filters invalid values', () => {
      const result = normalizeComfortProfile({
        temperaturePreference: 'invalid' as any,
        windSensitivity: 'high',
        precipitationPreference: 'bad' as any,
      })
      expect(result).toEqual({
        temperaturePreference: 'neutral', // falls back to default
        windSensitivity: 'high',
        precipitationPreference: 'neutral', // falls back to default
      })
    })

    it('accepts all valid profile values', () => {
      const profile: ComfortProfile = {
        temperaturePreference: 'runs_hot',
        windSensitivity: 'low',
        precipitationPreference: 'avoid',
      }
      expect(normalizeComfortProfile(profile)).toEqual(profile)
    })
  })

  describe('getWearPlan - running sport', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('recommends shorts and short-sleeve for warm weather (65+F)', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 75,
        feelsLike: 75,
      })

      expect(result.coverage.legs).toContain('Shorts')
      expect(result.coverage.torso).toContain('Ultralight top')
      expect(result.coverage.head).toContain('Sun cap')
      expect(result.coverage.feet).toContain('Running shoes')
      expect(result.coverage.feet).toContain('Running socks')
    })

    it('recommends moderate layers for 50-65F', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 55,
        feelsLike: 55,
        cloudCover: 50, // More neutral cloud cover
      })

      expect(result.coverage.legs).toContain('Shorts')
      expect(result.coverage.torso).toContain('Short-sleeve top')
      expect(result.coverage.head).toContain('Cap or visor')
    })

    it('recommends tights and long sleeves for 35-50F', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 42,
        feelsLike: 40,
      })

      expect(result.coverage.legs).toContain('Tights or knee sleeves')
      expect(result.coverage.torso).toContain('Long-sleeve top')
      expect(result.coverage.torso).toContain('Light shell if breezy')
    })

    it('recommends thermal layers for 20-35F', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 28,
        feelsLike: 25,
      })

      expect(result.coverage.legs).toContain('Tights')
      expect(result.coverage.torso).toContain('Long-sleeve mid layer')
      expect(result.coverage.torso).toContain('Wind-resistant jacket')
      expect(result.coverage.hands).toContain('Light gloves')
      expect(result.coverage.head).toContain('Beanie')
    })

    it('recommends heavy insulation for very cold (<=20F)', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 15,
        feelsLike: 10,
      })

      expect(result.coverage.legs).toContain('Thermal tights')
      expect(result.coverage.torso).toContain('Thermal mid layer')
      expect(result.coverage.torso).toContain('Insulated running jacket')
      expect(result.coverage.hands).toContain('Insulated gloves')
      expect(result.coverage.head).toContain('Beanie or ear band')
      expect(result.coverage.feet).toContain('Wool socks')
    })

    it('adds waterproof shell for wet conditions', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        precipitationProbability: 60,
        precipitation: 0.1,
        conditionLabel: 'Rain',
      })

      expect(result.coverage.torso).toContain('Waterproof shell')
      expect(result.coverage.head).toContain('Brimmed cap')
    })

    it('adds wind shell for windy conditions', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        windSpeed: 20,
        windGusts: 30,
      })

      expect(result.coverage.torso).toContain('Wind shell')
    })
  })

  describe('getWearPlan - skiing sport', () => {
    const baseWeather = {
      temperature: 25,
      feelsLike: 20,
      windSpeed: 10,
      windGusts: 15,
      precipitationProbability: 20,
      precipitation: 0,
      conditionLabel: 'Partly cloudy',
      cloudCover: 40,
    }

    it('recommends heavy insulation for very cold (<=10F)', () => {
      const result = getWearPlan('skiing', {
        ...baseWeather,
        temperature: 5,
        feelsLike: -5,
      })

      expect(result.coverage.legs).toContain('Insulated pants')
      expect(result.coverage.torso).toContain('Heavy mid layer')
      expect(result.coverage.torso).toContain('Insulated jacket')
      expect(result.coverage.hands).toContain('Mittens')
      expect(result.coverage.neckFace).toContain('Neck gaiter')
      expect(result.coverage.neckFace).toContain('Balaclava')
    })

    it('recommends warm layers for 10-25F', () => {
      const result = getWearPlan('skiing', {
        ...baseWeather,
        temperature: 18,
        feelsLike: 15,
      })

      expect(result.coverage.legs).toContain('Insulated pants')
      expect(result.coverage.torso).toContain('Warm mid layer')
      expect(result.coverage.torso).toContain('Shell jacket')
      expect(result.coverage.hands).toContain('Gloves')
      expect(result.coverage.neckFace).toContain('Neck gaiter')
    })

    it('recommends shell layers for 25-40F', () => {
      const result = getWearPlan('skiing', {
        ...baseWeather,
        temperature: 32,
        feelsLike: 30,
      })

      expect(result.coverage.legs).toContain('Shell pants')
      expect(result.coverage.torso).toContain('Mid layer')
      expect(result.coverage.torso).toContain('Shell jacket')
      expect(result.coverage.hands).toContain('Gloves')
      expect(result.coverage.head).toContain('Helmet liner')
    })

    it('recommends light layers for warmer skiing (>40F)', () => {
      const result = getWearPlan('skiing', {
        ...baseWeather,
        temperature: 45,
        feelsLike: 42,
      })

      expect(result.coverage.legs).toContain('Shell pants')
      expect(result.coverage.torso).toContain('Light mid layer')
      expect(result.coverage.torso).toContain('Shell jacket')
      expect(result.coverage.hands).toContain('Light gloves')
    })

    it('always includes helmet and goggles for skiing', () => {
      const result = getWearPlan('skiing', baseWeather)

      expect(result.coverage.head).toContain('Helmet')
      expect(result.coverage.eyes).toContain('Goggles')
      expect(result.coverage.feet).toContain('Ski boots')
      expect(result.coverage.feet).toContain('Ski socks')
    })

    it('adds storm shell for wet or windy conditions', () => {
      const result = getWearPlan('skiing', {
        ...baseWeather,
        windSpeed: 25,
        windGusts: 35,
        precipitationProbability: 70,
        conditionLabel: 'Snow',
      })

      expect(result.coverage.torso).toContain('Storm shell')
      expect(result.coverage.eyes).toContain('Goggle cover')
    })
  })

  describe('effective temperature adjustments', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('adds heat for running sport', () => {
      const runningResult = getWearPlan('running', baseWeather)
      const skiingResult = getWearPlan('skiing', baseWeather)

      // Running should feel warmer than skiing at same temp
      expect(runningResult.effectiveTemp).toBeGreaterThan(skiingResult.effectiveTemp)
      expect(runningResult.adjustments).toContain('Running heat: +6F')
    })

    it('adjusts for exertion level', () => {
      const easyContext: WearContext = { exertion: 'easy', duration: 'medium' }
      const steadyContext: WearContext = { exertion: 'steady', duration: 'medium' }
      const hardContext: WearContext = { exertion: 'hard', duration: 'medium' }

      const easyResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE, easyContext)
      const steadyResult = getWearPlan(
        'running',
        baseWeather,
        DEFAULT_COMFORT_PROFILE,
        steadyContext
      )
      const hardResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE, hardContext)

      expect(steadyResult.effectiveTemp).toBeGreaterThan(easyResult.effectiveTemp)
      expect(hardResult.effectiveTemp).toBeGreaterThan(steadyResult.effectiveTemp)
    })

    it('adjusts for trip duration', () => {
      const shortContext: WearContext = { exertion: 'steady', duration: 'short' }
      const mediumContext: WearContext = { exertion: 'steady', duration: 'medium' }
      const longContext: WearContext = { exertion: 'steady', duration: 'long' }

      const shortResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE, shortContext)
      const mediumResult = getWearPlan(
        'running',
        baseWeather,
        DEFAULT_COMFORT_PROFILE,
        mediumContext
      )
      const longResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE, longContext)

      // Longer trips feel colder due to exposure
      expect(shortResult.effectiveTemp).toBeGreaterThan(mediumResult.effectiveTemp)
      expect(mediumResult.effectiveTemp).toBeGreaterThan(longResult.effectiveTemp)
    })

    it('adjusts for temperature preference - runs cold', () => {
      const runsColdProfile: ComfortProfile = {
        temperaturePreference: 'runs_cold',
        windSensitivity: 'normal',
        precipitationPreference: 'neutral',
      }

      const result = getWearPlan('running', baseWeather, runsColdProfile)
      const neutralResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE)

      // Runs cold should have lower effective temp (feels colder)
      expect(result.effectiveTemp).toBeLessThan(neutralResult.effectiveTemp)
      expect(result.adjustments).toContain('Runs cold: -6F')
    })

    it('adjusts for temperature preference - runs hot', () => {
      const runsHotProfile: ComfortProfile = {
        temperaturePreference: 'runs_hot',
        windSensitivity: 'normal',
        precipitationPreference: 'neutral',
      }

      const result = getWearPlan('running', baseWeather, runsHotProfile)
      const neutralResult = getWearPlan('running', baseWeather, DEFAULT_COMFORT_PROFILE)

      // Runs hot should have higher effective temp (feels warmer)
      expect(result.effectiveTemp).toBeGreaterThan(neutralResult.effectiveTemp)
      expect(result.adjustments).toContain('Runs warm: +6F')
    })

    it('adjusts for wind sensitivity', () => {
      const windyWeather = {
        ...baseWeather,
        windSpeed: 20,
        windGusts: 30,
      }

      const lowSensitivity: ComfortProfile = {
        ...DEFAULT_COMFORT_PROFILE,
        windSensitivity: 'low',
      }
      const highSensitivity: ComfortProfile = {
        ...DEFAULT_COMFORT_PROFILE,
        windSensitivity: 'high',
      }

      const lowResult = getWearPlan('running', windyWeather, lowSensitivity)
      const normalResult = getWearPlan('running', windyWeather, DEFAULT_COMFORT_PROFILE)
      const highResult = getWearPlan('running', windyWeather, highSensitivity)

      // Higher wind sensitivity should have lower effective temp
      expect(highResult.effectiveTemp).toBeLessThan(normalResult.effectiveTemp)
      expect(normalResult.effectiveTemp).toBeLessThan(lowResult.effectiveTemp)
    })

    it('adjusts for precipitation', () => {
      const wetWeather = {
        ...baseWeather,
        precipitationProbability: 80,
        precipitation: 0.2,
        conditionLabel: 'Rain',
      }

      const result = getWearPlan('running', wetWeather)
      const dryResult = getWearPlan('running', baseWeather)

      // Wet conditions should reduce effective temp
      expect(result.effectiveTemp).toBeLessThan(dryResult.effectiveTemp)
      expect(result.adjustments.some((adj) => adj.includes('Wet conditions'))).toBe(true)
    })

    it('adjusts for cloud cover', () => {
      const sunnyWeather = { ...baseWeather, cloudCover: 10 }
      const cloudyWeather = { ...baseWeather, cloudCover: 80 }

      const sunnyResult = getWearPlan('running', sunnyWeather)
      const cloudyResult = getWearPlan('running', cloudyWeather)

      expect(sunnyResult.effectiveTemp).toBeGreaterThan(cloudyResult.effectiveTemp)
      expect(sunnyResult.adjustments).toContain('Bright sun: +2F')
      expect(cloudyResult.adjustments).toContain('Low sun: -2F')
    })
  })

  describe('confidence scoring', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('has high confidence far from thresholds', () => {
      // Temperature far from running thresholds (20/35/50/65)
      // Need effective temp > 6 away from any threshold
      // For running: +6 running heat, +4 effort, -2 duration = ~+8 adjustment
      // To get effective ~27 (mid of 20-35), start with ~19F
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 19,
        feelsLike: 19,
        cloudCover: 50,
        windSpeed: 5,
        windGusts: 10,
        precipitationProbability: 0,
      })

      expect(result.confidence).toBe('high')
    })

    it('has lower confidence near temperature thresholds', () => {
      // Near the 50F threshold for running (accounting for running heat +6F and other adjustments)
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 42,
        feelsLike: 42,
        cloudCover: 50,
      })

      // Confidence should be medium or low when near thresholds
      expect(['medium', 'low']).toContain(result.confidence)
    })

    it('has lower confidence with uncertain weather', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        precipitationProbability: 60,
        windGusts: 35,
        temperature: 52,
        feelsLike: 48,
      })

      expect(result.confidence).toBe('low')
    })
  })

  describe('optional items', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('suggests extra layer for low confidence', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 51,
        feelsLike: 48,
        windGusts: 30,
      })

      expect(result.optional).toContain('Pack a light shell')
    })

    it('suggests spare layer for wet conditions', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        precipitationProbability: 70,
        conditionLabel: 'Rain',
      })

      expect(result.optional).toContain('Spare dry layer')
    })

    it('suggests hand warmers for cold weather', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 30,
        feelsLike: 25,
      })

      expect(result.optional).toContain('Hand warmers')
    })

    it('suggests cooldown layer for warm weather', () => {
      const result = getWearPlan('running', {
        ...baseWeather,
        temperature: 75,
        feelsLike: 75,
      })

      expect(result.optional).toContain('Light layer for cooldown')
    })
  })

  describe('getGearSuggestions', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('returns wear list, pack list, and wear plan', () => {
      const result = getGearSuggestions('running', baseWeather)

      expect(result).toHaveProperty('wear')
      expect(result).toHaveProperty('pack')
      expect(result).toHaveProperty('wearPlan')
      expect(Array.isArray(result.wear)).toBe(true)
      expect(Array.isArray(result.pack)).toBe(true)
      expect(result.wearPlan).toHaveProperty('effectiveTemp')
    })

    it('includes hydration and snacks in pack list', () => {
      const result = getGearSuggestions('running', baseWeather)

      expect(result.pack).toContain('Hydration')
      expect(result.pack).toContain('Snacks')
    })

    it('includes waterproof gear in pack for rain', () => {
      const result = getGearSuggestions('running', {
        ...baseWeather,
        precipitationProbability: 60,
        conditionLabel: 'Rain',
      })

      expect(result.pack).toContain('Waterproof shell')
      expect(result.pack).toContain('Dry socks')
    })

    it('includes wind shell in pack for gusty conditions', () => {
      const result = getGearSuggestions('running', {
        ...baseWeather,
        windGusts: 25,
      })

      expect(result.pack).toContain('Wind shell')
    })

    it('includes cold weather gear in pack for low temps', () => {
      const result = getGearSuggestions('running', {
        ...baseWeather,
        temperature: 35,
        feelsLike: 30,
      })

      expect(result.pack).toContain('Spare base layer')
      expect(result.pack).toContain('Hand warmers')
    })

    it('includes snow gear in pack for snowy conditions', () => {
      const result = getGearSuggestions('skiing', {
        ...baseWeather,
        temperature: 25,
        feelsLike: 20,
        conditionLabel: 'Snow',
      })

      expect(result.pack).toContain('Gaiters')
      expect(result.pack).toContain('Lens cloth')
    })

    it('respects precipitation preference in pack recommendations', () => {
      const avoidProfile: ComfortProfile = {
        ...DEFAULT_COMFORT_PROFILE,
        precipitationPreference: 'avoid',
      }
      const okayProfile: ComfortProfile = {
        ...DEFAULT_COMFORT_PROFILE,
        precipitationPreference: 'okay',
      }

      // 30% precip - should trigger for 'avoid', not for 'okay'
      const weather = { ...baseWeather, precipitationProbability: 30 }

      const avoidResult = getGearSuggestions('running', weather, avoidProfile)
      const okayResult = getGearSuggestions('running', weather, okayProfile)

      expect(avoidResult.pack).toContain('Waterproof shell')
      expect(okayResult.pack).not.toContain('Waterproof shell')
    })
  })

  describe('wear plan overrides', () => {
    const baseWeather = {
      temperature: 50,
      feelsLike: 48,
      windSpeed: 5,
      windGusts: 10,
      precipitationProbability: 10,
      precipitation: 0,
      conditionLabel: 'Clear',
      cloudCover: 20,
    }

    it('allows overriding temperature', () => {
      const result = getWearPlan(
        'running',
        baseWeather,
        DEFAULT_COMFORT_PROFILE,
        DEFAULT_WEAR_CONTEXT,
        { temperature: 25, feelsLike: 22 }
      )

      // Should use overridden temperature for calculations (colder = tights)
      expect(result.coverage.legs).toContain('Tights')
    })

    it('allows overriding wind conditions', () => {
      const result = getWearPlan(
        'running',
        baseWeather,
        DEFAULT_COMFORT_PROFILE,
        DEFAULT_WEAR_CONTEXT,
        { windSpeed: 25, windGusts: 35 }
      )

      expect(result.coverage.torso).toContain('Wind shell')
    })

    it('allows overriding precipitation', () => {
      const result = getWearPlan(
        'running',
        baseWeather,
        DEFAULT_COMFORT_PROFILE,
        DEFAULT_WEAR_CONTEXT,
        { precipitationProbability: 80, conditionLabel: 'Heavy rain' }
      )

      expect(result.coverage.torso).toContain('Waterproof shell')
    })
  })

  describe('edge cases', () => {
    it('handles extreme cold temperatures', () => {
      const result = getWearPlan('running', {
        temperature: -10,
        feelsLike: -20,
        windSpeed: 15,
        windGusts: 25,
        precipitationProbability: 0,
        precipitation: 0,
        conditionLabel: 'Clear',
        cloudCover: 10,
      })

      expect(result.coverage.legs).toContain('Thermal tights')
      expect(result.coverage.torso).toContain('Thermal mid layer')
      expect(result.coverage.hands).toContain('Insulated gloves')
    })

    it('handles extreme heat temperatures', () => {
      const result = getWearPlan('running', {
        temperature: 95,
        feelsLike: 100,
        windSpeed: 5,
        windGusts: 10,
        precipitationProbability: 0,
        precipitation: 0,
        conditionLabel: 'Clear',
        cloudCover: 0,
      })

      expect(result.coverage.legs).toContain('Shorts')
      expect(result.coverage.torso).toContain('Ultralight top')
      expect(result.coverage.head).toContain('Sun cap')
    })

    it('handles no wind conditions', () => {
      const result = getWearPlan('running', {
        temperature: 50,
        feelsLike: 50,
        windSpeed: 0,
        windGusts: 0,
        precipitationProbability: 0,
        precipitation: 0,
        conditionLabel: 'Clear',
        cloudCover: 20,
      })

      expect(result.primary.length).toBeGreaterThan(0)
      expect(result.effectiveTemp).toBeDefined()
    })

    it('produces unique items in recommendations', () => {
      const result = getWearPlan('running', {
        temperature: 40,
        feelsLike: 38,
        windSpeed: 20,
        windGusts: 30,
        precipitationProbability: 70,
        precipitation: 0.15,
        conditionLabel: 'Rain',
        cloudCover: 90,
      })

      const hasDuplicates = result.primary.some(
        (item, index) => result.primary.indexOf(item) !== index
      )
      expect(hasDuplicates).toBe(false)
    })
  })
})
