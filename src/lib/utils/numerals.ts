// Pure utility for numeral conversions (safe for both Client and Server Components)

export const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'] as const

const NEPALI_TO_ENG: Record<string, string> = {
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

export function toNepaliNumerals(num: string | number | null | undefined): string {
  if (num === null || num === undefined) return ''
  return String(num).replace(/[0-9]/g, (digit) => NEPALI_DIGITS[parseInt(digit, 10)])
}

export function toEnglishNumerals(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return ''
  return String(str).replace(/[०-९]/g, (ch) => NEPALI_TO_ENG[ch] ?? ch)
}
