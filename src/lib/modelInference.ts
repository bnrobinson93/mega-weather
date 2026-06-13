export interface ModelInfo {
  name: string
  source: string
}

export function inferModel(lat: number, lon: number): ModelInfo {
  // Contiguous US
  if (lat >= 24 && lat <= 49 && lon >= -125 && lon <= -66) {
    return { name: 'NOAA HRRR + GFS', source: 'National Weather Service' }
  }
  // Alaska
  if (lat >= 51 && lat <= 71 && lon >= -180 && lon <= -130) {
    return { name: 'NOAA HRRR + GFS', source: 'National Weather Service' }
  }
  // Hawaii
  if (lat >= 18 && lat <= 23 && lon >= -161 && lon <= -154) {
    return { name: 'NOAA GFS', source: 'National Weather Service' }
  }
  // Canada (north of 49th parallel; southern border cities get HRRR/GFS which covers them well)
  if (lat > 49 && lat <= 83 && lon >= -141 && lon <= -52) {
    return { name: 'Environment Canada GEM', source: 'Environment Canada' }
  }
  // Europe
  if (lat >= 35 && lat <= 72 && lon >= -25 && lon <= 45) {
    return {
      name: 'DWD ICON-EU + ECMWF',
      source: 'Deutscher Wetterdienst / ECMWF',
    }
  }
  // Japan / Korea
  if (lat >= 20 && lat <= 50 && lon >= 120 && lon <= 150) {
    return { name: 'JMA MSM', source: 'Japan Meteorological Agency' }
  }
  // Australia
  if (lat >= -45 && lat <= -10 && lon >= 110 && lon <= 160) {
    return { name: 'BOM ACCESS-G', source: 'Bureau of Meteorology' }
  }
  return {
    name: 'ECMWF IFS',
    source: 'European Centre for Medium-Range Weather Forecasts',
  }
}
