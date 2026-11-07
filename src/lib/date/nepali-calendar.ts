// Native Nepali Bikram Sambat (वि.सं.) & Date/Time Utility for SabaiChha.com

const NEPALI_NUMERALS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

const NEPALI_MONTHS = [
  'बैशाख',
  'जेठ',
  'असार',
  'साउन',
  'भदौ',
  'असोज',
  'कार्तिक',
  'मंसिर',
  'पुस',
  'माघ',
  'फागुन',
  'चैत',
]

const NEPALI_DAYS = [
  'आइतबार',
  'सोमबार',
  'मंगलबार',
  'बुधबार',
  'बिहीबार',
  'शुक्रबार',
  'शनिबार',
]

export function toNepaliNumerals(num: number | string): string {
  return String(num)
    .split('')
    .map((char) => {
      const digit = parseInt(char, 10)
      return isNaN(digit) ? char : NEPALI_NUMERALS[digit]
    })
    .join('')
}

/**
 * Lightweight Bikram Sambat Date Formatter
 * B.S. is approximately 56 years, 8 months, and 15–17 days ahead of Gregorian (A.D.).
 */
export function formatBikramSambat(date: Date = new Date()): {
  year: string
  month: string
  day: string
  weekday: string
  fullNepaliDate: string
  shortNepaliDate: string
  fullEnglishDate: string
  shortEnglishDate: string
} {
  const gYear = date.getFullYear()
  const gMonth = date.getMonth() // 0-indexed
  const gDate = date.getDate()
  const gDay = date.getDay()

  // Approximate BS year & month mapping
  let bsYear = gYear + 56
  let bsMonthIndex = (gMonth + 8) % 12
  if (gMonth >= 3) {
    bsYear = gYear + 57
  }

  // Nepali day calculation (e.g. Nov 1 -> Kartik 16)
  let bsDay = (gDate + 15) % 30 || 30

  const weekday = NEPALI_DAYS[gDay]
  const month = NEPALI_MONTHS[bsMonthIndex]
  const yearStr = toNepaliNumerals(bsYear)
  const dayStr = toNepaliNumerals(bsDay)

  // Matches exact format: आइतबार, कार्तिक १६, २०८३
  const fullNepaliDate = `${weekday}, ${month} ${dayStr}, ${yearStr}`
  const shortNepaliDate = `${month} ${dayStr}, ${yearStr}`

  const fullEnglishDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const shortEnglishDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return {
    year: yearStr,
    month,
    day: dayStr,
    weekday,
    fullNepaliDate,
    shortNepaliDate,
    fullEnglishDate,
    shortEnglishDate,
  }
}

/**
 * Format live 24-hour time in Nepali and English numerals (HH:MM:SS)
 */
export function formatNepaliTime(date: Date = new Date()): {
  nepali: string
  english: string
} {
  const pad = (n: number) => String(n).padStart(2, '0')
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return {
    nepali: toNepaliNumerals(`${h}:${m}:${s}`),
    english: `${h}:${m}:${s}`,
  }
}
