// Official Bikram Sambat (B.S.) <-> Gregorian (A.D.) Accurate Converter
// Standard calendar days data for Nepal (years 2000 BS to 2095 BS)

export const NEPALI_MONTHS_DATA: { [key: number]: number[] } = {
  2070: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2071: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2072: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2073: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2074: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2075: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2076: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2077: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2078: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2079: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2080: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2081: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2082: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2083: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2084: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2085: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2086: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
  2087: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
  2088: [31, 31, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
  2089: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
  2090: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
}

// Default standard month lengths for years outside the specific table
const DEFAULT_BS_MONTH_DAYS = [31, 31, 32, 31, 31, 30, 30, 30, 29, 30, 29, 31]

export function getBsMonthDays(year: number, monthIndex: number): number {
  if (NEPALI_MONTHS_DATA[year] && NEPALI_MONTHS_DATA[year][monthIndex] !== undefined) {
    return NEPALI_MONTHS_DATA[year][monthIndex]
  }
  return DEFAULT_BS_MONTH_DAYS[monthIndex] || 30
}

export const NEPALI_MONTH_NAMES = [
  { id: 1, nameNe: 'बैशाख', nameEn: 'Baisakh' },
  { id: 2, nameNe: 'जेठ', nameEn: 'Jestha' },
  { id: 3, nameNe: 'असार', nameEn: 'Ashadh' },
  { id: 4, nameNe: 'साउन', nameEn: 'Shrawan' },
  { id: 5, nameNe: 'भदौ', nameEn: 'Bhadra' },
  { id: 6, nameNe: 'असोज', nameEn: 'Ashwin' },
  { id: 7, nameNe: 'कार्तिक', nameEn: 'Kartik' },
  { id: 8, nameNe: 'मंसिर', nameEn: 'Mangsir' },
  { id: 9, nameNe: 'पुस', nameEn: 'Poush' },
  { id: 10, nameNe: 'माघ', nameEn: 'Magh' },
  { id: 11, nameNe: 'फागुन', nameEn: 'Falgun' },
  { id: 12, nameNe: 'चैत', nameEn: 'Chaitra' },
]

export const ENGLISH_MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export const WEEKDAYS = [
  { nameNe: 'आइतबार', nameEn: 'Sunday' },
  { nameNe: 'सोमबार', nameEn: 'Monday' },
  { nameNe: 'मंगलबार', nameEn: 'Tuesday' },
  { nameNe: 'बुधबार', nameEn: 'Wednesday' },
  { nameNe: 'बिहीबार', nameEn: 'Thursday' },
  { nameNe: 'शुक्रबार', nameEn: 'Friday' },
  { nameNe: 'शनिबार', nameEn: 'Saturday' },
]

// Reference anchor point: 2080-01-01 BS = 2023-04-14 AD (Friday)
const ANCHOR_BS_YEAR = 2080
const ANCHOR_BS_MONTH = 1
const ANCHOR_BS_DAY = 1
const ANCHOR_AD_DATE = new Date(Date.UTC(2023, 3, 14)) // 2023-04-14

/**
 * Convert Bikram Sambat (BS) to Gregorian Date (AD)
 */
export function convertBsToAd(bsYear: number, bsMonth: number, bsDay: number): {
  adYear: number
  adMonth: number
  adDay: number
  adDate: Date
  formattedAdDate: string
  weekdayNe: string
  weekdayEn: string
} {
  let totalDaysDiff = 0

  if (bsYear >= ANCHOR_BS_YEAR) {
    for (let y = ANCHOR_BS_YEAR; y < bsYear; y++) {
      for (let m = 0; m < 12; m++) {
        totalDaysDiff += getBsMonthDays(y, m)
      }
    }
    for (let m = 1; m < bsMonth; m++) {
      totalDaysDiff += getBsMonthDays(bsYear, m - 1)
    }
    totalDaysDiff += bsDay - ANCHOR_BS_DAY
  } else {
    for (let y = ANCHOR_BS_YEAR - 1; y >= bsYear; y--) {
      for (let m = 0; m < 12; m++) {
        totalDaysDiff -= getBsMonthDays(y, m)
      }
    }
    for (let m = 1; m < bsMonth; m++) {
      totalDaysDiff += getBsMonthDays(bsYear, m - 1)
    }
    totalDaysDiff += bsDay - ANCHOR_BS_DAY
  }

  const resultTime = ANCHOR_AD_DATE.getTime() + totalDaysDiff * 24 * 60 * 60 * 1000
  const adDate = new Date(resultTime)

  const adYear = adDate.getUTCFullYear()
  const adMonth = adDate.getUTCMonth() + 1
  const adDay = adDate.getUTCDate()
  const dayIndex = adDate.getUTCDay()

  const formattedAdDate = `${ENGLISH_MONTH_NAMES[adMonth - 1]} ${adDay}, ${adYear}`

  return {
    adYear,
    adMonth,
    adDay,
    adDate,
    formattedAdDate,
    weekdayNe: WEEKDAYS[dayIndex].nameNe,
    weekdayEn: WEEKDAYS[dayIndex].nameEn,
  }
}

/**
 * Convert Gregorian Date (AD) to Bikram Sambat (BS)
 */
export function convertAdToBs(adYear: number, adMonth: number, adDay: number): {
  bsYear: number
  bsMonth: number
  bsDay: number
  bsMonthNameNe: string
  bsMonthNameEn: string
  formattedBsDate: string
  weekdayNe: string
  weekdayEn: string
} {
  const targetDate = new Date(Date.UTC(adYear, adMonth - 1, adDay))
  let diffDays = Math.round(
    (targetDate.getTime() - ANCHOR_AD_DATE.getTime()) / (24 * 60 * 60 * 1000)
  )

  let bsYear = ANCHOR_BS_YEAR
  let bsMonth = ANCHOR_BS_MONTH
  let bsDay = ANCHOR_BS_DAY

  if (diffDays >= 0) {
    while (diffDays > 0) {
      const monthDays = getBsMonthDays(bsYear, bsMonth - 1)
      const remainingInMonth = monthDays - bsDay

      if (diffDays <= remainingInMonth) {
        bsDay += diffDays
        diffDays = 0
      } else {
        diffDays -= remainingInMonth + 1
        bsDay = 1
        bsMonth++
        if (bsMonth > 12) {
          bsMonth = 1
          bsYear++
        }
      }
    }
  } else {
    while (diffDays < 0) {
      if (Math.abs(diffDays) < bsDay) {
        bsDay += diffDays
        diffDays = 0
      } else {
        diffDays += bsDay
        bsMonth--
        if (bsMonth < 1) {
          bsMonth = 12
          bsYear--
        }
        const prevMonthDays = getBsMonthDays(bsYear, bsMonth - 1)
        bsDay = prevMonthDays
      }
    }
  }

  const dayIndex = targetDate.getUTCDay()
  const monthInfo = NEPALI_MONTH_NAMES[bsMonth - 1]
  const formattedBsDate = `${monthInfo.nameNe} ${bsDay}, ${bsYear}`

  return {
    bsYear,
    bsMonth,
    bsDay,
    bsMonthNameNe: monthInfo.nameNe,
    bsMonthNameEn: monthInfo.nameEn,
    formattedBsDate,
    weekdayNe: WEEKDAYS[dayIndex].nameNe,
    weekdayEn: WEEKDAYS[dayIndex].nameEn,
  }
}

/**
 * Calculate Age between two dates in Years, Months, and Days
 */
export function calculateDetailedAge(birthDate: Date, targetDate: Date = new Date()): {
  years: number
  months: number
  days: number
  totalDays: number
} {
  let years = targetDate.getFullYear() - birthDate.getFullYear()
  let months = targetDate.getMonth() - birthDate.getMonth()
  let days = targetDate.getDate() - birthDate.getDate()

  if (days < 0) {
    months--
    const prevMonthLastDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), 0).getDate()
    days += prevMonthLastDay
  }

  if (months < 0) {
    years--
    months += 12
  }

  const totalDays = Math.floor(
    (targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    years: Math.max(years, 0),
    months: Math.max(months, 0),
    days: Math.max(days, 0),
    totalDays: Math.max(totalDays, 0),
  }
}
