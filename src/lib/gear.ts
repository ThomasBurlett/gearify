import type { SportType } from './weather'

export type GearSuggestion = {
  wear: string[]
  pack: string[]
}

type WeatherInputs = {
  temperature: number
  feelsLike: number
  windSpeed: number
  windGusts: number
  precipitationProbability: number
  precipitation: number
  conditionLabel: string
}

function commonPackList(weather: WeatherInputs) {
  const pack = ['Hydration', 'Snacks']

  if (weather.precipitationProbability >= 40) {
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

export function getGearSuggestions(sport: SportType, weather: WeatherInputs): GearSuggestion {
  const wear: string[] = []
  const pack = commonPackList(weather)
  const temp = weather.temperature
  const isWet = weather.precipitationProbability >= 40 || weather.precipitation > 0.05
  const isWindy = weather.windSpeed >= 15 || weather.windGusts >= 25

  if (sport === 'running') {
    wear.push('Moisture-wicking base layer')
    if (temp <= 20) {
      wear.push('Thermal mid layer', 'Insulated running jacket', 'Thermal tights')
      wear.push('Wool socks', 'Insulated gloves', 'Beanie or ear band')
    } else if (temp <= 35) {
      wear.push('Long-sleeve mid layer', 'Wind-resistant jacket', 'Tights')
      wear.push('Light gloves', 'Beanie')
    } else if (temp <= 50) {
      wear.push('Long-sleeve top', 'Light shell if breezy', 'Tights or knee sleeves')
    } else if (temp <= 65) {
      wear.push('Short-sleeve top', 'Shorts', 'Cap or visor')
    } else {
      wear.push('Ultralight top', 'Shorts', 'Sun cap')
    }

    if (isWet) {
      wear.push('Water-resistant shell', 'Bill cap')
    }
    if (isWindy) {
      wear.push('Wind shell')
    }
  }

  if (sport === 'skiing') {
    wear.push('Moisture-wicking base layer', 'Ski socks')
    if (temp <= 10) {
      wear.push('Heavy mid layer', 'Insulated jacket', 'Insulated pants')
      wear.push('Mittens', 'Neck gaiter', 'Balaclava')
    } else if (temp <= 25) {
      wear.push('Warm mid layer', 'Shell jacket', 'Insulated pants')
      wear.push('Gloves', 'Neck gaiter')
    } else if (temp <= 40) {
      wear.push('Mid layer', 'Shell jacket', 'Shell pants')
      wear.push('Gloves', 'Helmet liner')
    } else {
      wear.push('Light mid layer', 'Shell jacket', 'Shell pants')
      wear.push('Light gloves')
    }

    wear.push('Helmet', 'Goggles')
    if (isWet || isWindy) {
      wear.push('Storm shell', 'Goggle cover')
    }
  }

  return { wear: Array.from(new Set(wear)), pack: Array.from(new Set(pack)) }
}
