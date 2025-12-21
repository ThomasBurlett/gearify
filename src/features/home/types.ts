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
