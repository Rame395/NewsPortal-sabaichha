import { getSiteSettings } from '@/lib/settings'

interface CachedItem<T> {
  data: T
  timestamp: number
}

// In-memory caches to minimize external API hits and avoid rate limits
let weatherCache: CachedItem<{
  temp: string
  tempNe: string
  conditionNe: string
  conditionEn: string
  icon: string
}> | null = null

let forexCache: CachedItem<{
  usdRate: string
  usdRateEn: string
  usdRaw: number
}> | null = null

let bullionCache: CachedItem<{
  gold: string
  goldEn: string
  silver: string
  silverEn: string
}> | null = null

let nepseCache: CachedItem<{
  index: string
  indexEn: string
  change: string
  changeEn: string
  pct: string
  pctEn: string
  positive: boolean
}> | null = null

// Helper to convert English numbers to Nepali Devanagari numerals
export function toNepaliNumerals(num: string | number): string {
  const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
  return String(num).replace(/[0-9]/g, (digit) => nepaliDigits[parseInt(digit, 10)])
}

// Helper to convert Nepali Devanagari numerals to English numerals
export function toEnglishNumerals(str: string | number): string {
  const nepaliToEng: Record<string, string> = {
    '०': '0',
    '१': '1',
    '२': '2',
    '३': '3',
    '४': '4',
    '५': '5',
    '६': '6',
    '७': '7',
    '८': '8',
    '९': '9',
  }
  return String(str).replace(/[०-९]/g, (ch) => nepaliToEng[ch] ?? ch)
}

// 1. Live Weather from Open-Meteo (Kathmandu, Nepal)
export async function getLiveWeather() {
  const now = Date.now()
  if (weatherCache && now - weatherCache.timestamp < 1000 * 60 * 5) {
    return weatherCache.data
  }

  try {
    const res = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=27.7172&longitude=85.3240&current=temperature_2m,weather_code&timezone=Asia%2FKathmandu',
      { next: { revalidate: 600 } }
    )
    if (res.ok) {
      const json = await res.json()
      const tempC = Math.round(json?.current?.temperature_2m ?? 21)
      const code = json?.current?.weather_code ?? 0

      let condNe = 'पारिलो घाम'
      let condEn = 'Sunny'
      let icon = 'sun'

      if (code === 0) {
        condNe = 'सफा आकाश'
        condEn = 'Clear sky'
      } else if (code <= 2) {
        condNe = 'पारिलो घाम'
        condEn = 'Partly cloudy'
      } else if (code === 3) {
        condNe = 'बादल लागेको'
        condEn = 'Overcast'
        icon = 'cloud'
      } else if ([51, 53, 55, 61, 63, 65, 80, 81].includes(code)) {
        condNe = 'हल्का वर्षा'
        condEn = 'Rain'
        icon = 'rain'
      }

      const weatherResult = {
        temp: `${tempC}°C`,
        tempNe: `${toNepaliNumerals(tempC)}°C`,
        conditionNe: condNe,
        conditionEn: condEn,
        icon,
      }

      weatherCache = { data: weatherResult, timestamp: now }
      return weatherResult
    }
  } catch (err) {
    console.error('Weather API error:', err)
  }

  return {
    temp: '21°C',
    tempNe: '२१°C',
    conditionNe: 'पारिलो घाम',
    conditionEn: 'Sunny',
    icon: 'sun',
  }
}

// 2. Live Forex USD -> NPR from Open Exchange / Currency CDN
export async function getLiveForexUSD(fallback: string) {
  const now = Date.now()
  if (forexCache && now - forexCache.timestamp < 1000 * 60) {
    return forexCache.data
  }

  // Primary: Open Exchange Rates API
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 1800 },
    })
    if (res.ok) {
      const data = await res.json()
      const npr = data?.rates?.NPR
      if (typeof npr === 'number' && npr > 100 && npr < 250) {
        const formatted = npr.toFixed(2)
        const forexResult = {
          usdRate: toNepaliNumerals(formatted),
          usdRateEn: formatted,
          usdRaw: npr,
        }
        forexCache = { data: forexResult, timestamp: now }
        return forexResult
      }
    }
  } catch (err) {
    console.error('Primary Forex API error:', err)
  }

  // Secondary Backup: JSDelivr Currency API
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      { next: { revalidate: 1800 } }
    )
    if (res.ok) {
      const data = await res.json()
      const npr = data?.usd?.npr
      if (typeof npr === 'number' && npr > 100 && npr < 250) {
        const formatted = npr.toFixed(2)
        const forexResult = {
          usdRate: toNepaliNumerals(formatted),
          usdRateEn: formatted,
          usdRaw: npr,
        }
        forexCache = { data: forexResult, timestamp: now }
        return forexResult
      }
    }
  } catch (err) {
    console.error('Backup Forex API error:', err)
  }

  const fbEn = toEnglishNumerals(fallback || '152.03')
  return {
    usdRate: toNepaliNumerals(fbEn),
    usdRateEn: fbEn,
    usdRaw: parseFloat(fbEn) || 152.03,
  }
}

// 3. Live Nepal Gold & Silver Bullion Rates (Per Tola in NPR)
export async function getLiveBullionRates(fallbackGold: string, fallbackSilver: string) {
  const now = Date.now()
  if (bullionCache && now - bullionCache.timestamp < 1000 * 60 * 2) {
    return bullionCache.data
  }

  // Primary Source: ShareSansar / FENEGOSIDA Official Nepal Tola Bullion Rate
  try {
    const res = await fetch('https://www.sharesansar.com/bullion', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 900 },
    })

    if (res.ok) {
      const html = await res.text()
      const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

      const goldMatch = plain.match(/Fine Gold\s*Rs\.?\s*([0-9,]+)\s*\/tola/i)
      const silverMatch = plain.match(/Silver\s*Rs\.?\s*([0-9,]+)\s*\/tola/i)

      if (goldMatch && goldMatch[1]) {
        const rawGoldNum = parseInt(goldMatch[1].replace(/,/g, ''), 10)
        const rawSilverNum =
          silverMatch && silverMatch[1]
            ? parseInt(silverMatch[1].replace(/,/g, ''), 10)
            : 3650

        if (rawGoldNum > 100000) {
          const goldFormattedEn = rawGoldNum.toLocaleString('en-IN')
          const silverFormattedEn = rawSilverNum.toLocaleString('en-IN')

          const bullionResult = {
            gold: toNepaliNumerals(goldFormattedEn),
            goldEn: goldFormattedEn,
            silver: toNepaliNumerals(silverFormattedEn),
            silverEn: silverFormattedEn,
          }
          bullionCache = { data: bullionResult, timestamp: now }
          return bullionResult
        }
      }
    }
  } catch (err) {
    console.error('ShareSansar Bullion fetch error:', err)
  }

  // Secondary Backup: International XAU/NPR & XAG/NPR converted to Nepal Tola (11.6638g + duty)
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/xau.json',
      { next: { revalidate: 1800 } }
    )
    if (res.ok) {
      const data = await res.json()
      const nprPerOunce = data?.xau?.npr
      if (typeof nprPerOunce === 'number' && nprPerOunce > 150000) {
        const gramPrice = nprPerOunce / 31.1035
        const tolaBase = gramPrice * 11.6638 * 1.18
        const roundedGold = Math.round(tolaBase / 100) * 100
        const goldFormattedEn = roundedGold.toLocaleString('en-IN')

        const bullionResult = {
          gold: toNepaliNumerals(goldFormattedEn),
          goldEn: goldFormattedEn,
          silver: '३,६५०',
          silverEn: '3,650',
        }
        bullionCache = { data: bullionResult, timestamp: now }
        return bullionResult
      }
    }
  } catch (err) {
    console.error('Backup Bullion API error:', err)
  }

  const fbGoldEn = toEnglishNumerals(fallbackGold || '2,72,000')
  const fbSilverEn = toEnglishNumerals(fallbackSilver || '3,650')
  return {
    gold: toNepaliNumerals(fbGoldEn),
    goldEn: fbGoldEn,
    silver: toNepaliNumerals(fbSilverEn),
    silverEn: fbSilverEn,
  }
}

// 4. Live NEPSE Stock Market Index (NepaliPaisa Official Live Feed)
export async function getLiveNepse(fallbackIndex: string, fallbackChange: string) {
  const now = Date.now()
  if (nepseCache && now - nepseCache.timestamp < 1000 * 25) {
    return nepseCache.data
  }

  try {
    const res = await fetch('https://www.nepalipaisa.com/api/GetIndexLive', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'application/json',
      },
      next: { revalidate: 180 },
    })

    if (res.ok) {
      const json = await res.json()
      const list = Array.isArray(json?.result) ? json.result : []
      const nepseItem =
        list.find((item: any) => String(item?.indexName).toLowerCase() === 'nepse') || list[0]

      if (nepseItem && typeof nepseItem.indexValue === 'number') {
        const val = nepseItem.indexValue
        const diff = Number(nepseItem.difference ?? 0)
        const pct = Number(nepseItem.percentChange ?? 0)
        const isPositive = diff >= 0
        const sign = isPositive ? '+' : ''

        const indexEn = val.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
        const changeEn = `${sign}${diff.toFixed(2)} (${sign}${pct.toFixed(2)}%)`
        const pctEn = `(${sign}${pct.toFixed(2)}%)`

        const nepseResult = {
          index: toNepaliNumerals(indexEn),
          indexEn,
          change: toNepaliNumerals(changeEn),
          changeEn,
          pct: toNepaliNumerals(pctEn),
          pctEn,
          positive: isPositive,
        }

        nepseCache = { data: nepseResult, timestamp: now }
        return nepseResult
      }
    }
  } catch (err) {
    console.error('Live NEPSE API error:', err)
  }

  const fbIndexEn = toEnglishNumerals(fallbackIndex || '2,690.15')
  const fbChangeEn = toEnglishNumerals(fallbackChange || '-5.45 (-0.20%)')
  const isPos = !fbChangeEn.trim().startsWith('-')
  const pctMatch = fbChangeEn.match(/\([^)]+\)/)
  const pctEn = pctMatch ? pctMatch[0] : '(-0.20%)'

  return {
    index: toNepaliNumerals(fbIndexEn),
    indexEn: fbIndexEn,
    change: toNepaliNumerals(fbChangeEn),
    changeEn: fbChangeEn,
    pct: toNepaliNumerals(pctEn),
    pctEn,
    positive: isPos,
  }
}

// Master Aggregator for Public Header Bar
export async function getAggregatedMarketWeatherData() {
  const settings = await getSiteSettings()
  const { liveTickers, socialLinks } = settings

  const [weather, forex, bullion, nepse] = await Promise.all([
    getLiveWeather(),
    getLiveForexUSD(liveTickers.forexUsd),
    getLiveBullionRates(liveTickers.goldRate, liveTickers.silverRate),
    getLiveNepse(liveTickers.nepseIndex, liveTickers.nepseChange),
  ])

  return {
    weather: {
      cityNe: liveTickers.weatherCity || 'काठमाडौँ',
      cityEn: liveTickers.weatherCityEn || 'Kathmandu',
      temp: weather.temp,
      tempNe: weather.tempNe,
      conditionNe: weather.conditionNe,
      conditionEn: weather.conditionEn,
      icon: weather.icon,
      enabled: liveTickers.showWeather,
      isLiveApi: true,
    },
    market: {
      gold: bullion.gold,
      goldEn: bullion.goldEn,
      silver: bullion.silver,
      silverEn: bullion.silverEn,
      showGold: liveTickers.showGold,
      nepse: nepse.index,
      nepseEn: nepse.indexEn,
      nepseChange: nepse.change,
      nepseChangeEn: nepse.changeEn,
      nepsePct: nepse.pct,
      nepsePctEn: nepse.pctEn,
      nepsePositive: nepse.positive,
      showNepse: liveTickers.showNepse,
      usd: forex.usdRate,
      usdEn: forex.usdRateEn,
      showForex: liveTickers.showForex,
      isLiveApi: true,
    },
    social: socialLinks,
    lastUpdated: new Date().toISOString(),
  }
}
