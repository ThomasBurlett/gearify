export type SelectedHour = {
  temperature: number
  feelsLike: number
  humidity: number
  dewPoint: number
  windSpeed: number
  windGusts: number
  precipitationChance: number
  precipitation: number
  pressure: number
  cloudCover: number
  visibility: number
  conditionCode: number
}

export type LoadStatus = 'idle' | 'loading' | 'error'

export type HomeSearchParams = {
  lat?: string
  lon?: string
  name?: string
  elev?: string
  time?: string
}
