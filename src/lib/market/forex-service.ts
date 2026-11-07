// Nepal Rastra Bank (NRB) Multi-Currency Forex Service & Calculator Data

export interface CurrencyRateItem {
  code: string
  nameNe: string
  nameEn: string
  flag: string
  unit: number
  buyRate: number
  sellRate: number
}

// Multipliers relative to USD/NPR
const CURRENCY_RELATIVE_WEIGHTS: {
  [code: string]: {
    nameNe: string
    nameEn: string
    flag: string
    unit: number
    usdMultiplier: number
    spreadPct: number
  }
} = {
  USD: {
    nameNe: 'अमेरिकी डलर',
    nameEn: 'U.S. Dollar',
    flag: '🇺🇸',
    unit: 1,
    usdMultiplier: 1.0,
    spreadPct: 0.004,
  },
  EUR: {
    nameNe: 'युरोपियन युरो',
    nameEn: 'European Euro',
    flag: '🇪🇺',
    unit: 1,
    usdMultiplier: 1.085,
    spreadPct: 0.005,
  },
  GBP: {
    nameNe: 'युके पाउन्ड स्टर्लिङ',
    nameEn: 'UK Pound Sterling',
    flag: '🇬🇧',
    unit: 1,
    usdMultiplier: 1.295,
    spreadPct: 0.005,
  },
  AUD: {
    nameNe: 'अस्ट्रेलियन डलर',
    nameEn: 'Australian Dollar',
    flag: '🇦🇺',
    unit: 1,
    usdMultiplier: 0.658,
    spreadPct: 0.006,
  },
  CAD: {
    nameNe: 'क्यानेडियन डलर',
    nameEn: 'Canadian Dollar',
    flag: '🇨🇦',
    unit: 1,
    usdMultiplier: 0.722,
    spreadPct: 0.006,
  },
  QAR: {
    nameNe: 'कतारी रियाल',
    nameEn: 'Qatari Riyal',
    flag: '🇶🇦',
    unit: 1,
    usdMultiplier: 0.2745,
    spreadPct: 0.005,
  },
  SAR: {
    nameNe: 'साउदी रियाल',
    nameEn: 'Saudi Riyal',
    flag: '🇸🇦',
    unit: 1,
    usdMultiplier: 0.2664,
    spreadPct: 0.005,
  },
  AED: {
    nameNe: 'युएई दिर्हाम',
    nameEn: 'UAE Dirham',
    flag: '🇦🇪',
    unit: 1,
    usdMultiplier: 0.2723,
    spreadPct: 0.005,
  },
  MYR: {
    nameNe: 'मलेसियन रिंगिट',
    nameEn: 'Malaysian Ringgit',
    flag: '🇲🇾',
    unit: 1,
    usdMultiplier: 0.232,
    spreadPct: 0.007,
  },
  KWD: {
    nameNe: 'कुवेती दिनार',
    nameEn: 'Kuwaiti Dinar',
    flag: '🇰🇼',
    unit: 1,
    usdMultiplier: 3.255,
    spreadPct: 0.006,
  },
  BHD: {
    nameNe: 'बहराइन दिनार',
    nameEn: 'Bahraini Dinar',
    flag: '🇧🇭',
    unit: 1,
    usdMultiplier: 2.652,
    spreadPct: 0.006,
  },
  JPY: {
    nameNe: 'जापानी येन (१०)',
    nameEn: 'Japanese Yen (10)',
    flag: '🇯🇵',
    unit: 10,
    usdMultiplier: 0.0655,
    spreadPct: 0.006,
  },
  KRW: {
    nameNe: 'द. कोरियाली वन (१००)',
    nameEn: 'South Korean Won (100)',
    flag: '🇰🇷',
    unit: 100,
    usdMultiplier: 0.0725,
    spreadPct: 0.006,
  },
  INR: {
    nameNe: 'भारतीय रुपैयाँ (१००)',
    nameEn: 'Indian Rupee (100)',
    flag: '🇮🇳',
    unit: 100,
    usdMultiplier: 1.055, // Fixed peg 160.00 buy / 160.15 sell
    spreadPct: 0.0009,
  },
}

export function computeAllForexRates(usdNprRate: number): CurrencyRateItem[] {
  const baseUsd = usdNprRate > 50 && usdNprRate < 300 ? usdNprRate : 152.03

  return Object.entries(CURRENCY_RELATIVE_WEIGHTS).map(([code, meta]) => {
    let midRate: number
    let buyRate: number
    let sellRate: number

    if (code === 'INR') {
      buyRate = 160.0
      sellRate = 160.15
    } else {
      midRate = baseUsd * meta.usdMultiplier
      buyRate = Number((midRate * (1 - meta.spreadPct)).toFixed(2))
      sellRate = Number((midRate * (1 + meta.spreadPct)).toFixed(2))
    }

    return {
      code,
      nameNe: meta.nameNe,
      nameEn: meta.nameEn,
      flag: meta.flag,
      unit: meta.unit,
      buyRate,
      sellRate,
    }
  })
}
