import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/settings'

// In-memory weather cache to prevent rate issues (5 minute TTL)
let cachedWeather: { temp: string; conditionNe: string; conditionEn: string; icon: string; timestamp: number } | null = null

function interpretWmoCode(code: number) {
  if (code === 0) return { ne: 'सफा आकाश', en: 'Clear sky', icon: 'sun' }
  if ([1, 2].includes(code)) return { ne: 'पारिलो घाम', en: 'Mainly sunny', icon: 'sun-cloud' }
  if (code === 3) return { ne: 'बादल लागेको', en: 'Overcast', icon: 'cloud' }
  if ([45, 48].includes(code)) return { ne: 'कुहिरो', en: 'Fog', icon: 'fog' }
  if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) return { ne: 'हल्का वर्षा', en: 'Rain', icon: 'rain' }
  if ([95, 96, 99].includes(code)) return { ne: 'चट्याङसहित वर्षा', en: 'Thunderstorm', icon: 'thunder' }
  return { ne: 'सामान्य', en: 'Mild', icon: 'sun' }
}

async function fetchKathmanduWeather() {
  const now = Date.now()
  if (cachedWeather && now - cachedWeather.timestamp < 1000 * 60 * 5) {
    return cachedWeather
  }

  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weather_code&timezone=Asia%2FKathmandu',
      { next: { revalidate: 300 } }
    )
    if (res.ok) {
      const data = await res.json()
      const tempNum = Math.round(data?.current?.temperature_2m ?? 21.5)
      const code = data?.current?.weather_code ?? 0
      const interpreted = interpretWmoCode(code)

      cachedWeather = {
        temp: `${tempNum}°C`,
        conditionNe: interpreted.ne,
        conditionEn: interpreted.en,
        icon: interpreted.icon,
        timestamp: now,
      }
      return cachedWeather
    }
  } catch (err) {
    console.error('Failed to fetch Open-Meteo weather:', err)
  }

  // Graceful fallback if offline
  return {
    temp: '22°C',
    conditionNe: 'पारिलो घाम',
    conditionEn: 'Sunny',
    icon: 'sun',
    timestamp: now,
  }
}

export async function GET() {
  try {
    const [weather, settings] = await Promise.all([
      fetchKathmanduWeather(),
      getSiteSettings(),
    ])

    const { liveTickers } = settings

    return NextResponse.json({
      weather: {
        cityNe: liveTickers.weatherCity || 'काठमाडौँ',
        cityEn: liveTickers.weatherCityEn || 'Kathmandu',
        temp: weather.temp,
        conditionNe: weather.conditionNe,
        conditionEn: weather.conditionEn,
        icon: weather.icon,
        enabled: liveTickers.showWeather,
      },
      market: {
        gold: liveTickers.goldRate,
        silver: liveTickers.silverRate,
        showGold: liveTickers.showGold,
        nepse: liveTickers.nepseIndex,
        nepseChange: liveTickers.nepseChange,
        nepsePositive: liveTickers.nepsePositive,
        showNepse: liveTickers.showNepse,
        usd: liveTickers.forexUsd,
        showForex: liveTickers.showForex,
      },
      social: settings.socialLinks,
    })
  } catch (error) {
    console.error('Market-weather route error:', error)
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 })
  }
}
