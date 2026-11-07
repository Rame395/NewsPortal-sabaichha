// Romanized English to Nepali Devanagari Unicode Transliteration Engine

const SPECIAL_CONJUNCTS: { [key: string]: string } = {
  ksha: 'क्ष',
  chhya: 'क्ष',
  tra: 'त्र',
  gya: 'ज्ञ',
  shra: 'श्र',
  dya: 'द्य',
  dha: 'ध',
  dwa: 'द्व',
  ddha: 'द्ध',
  shha: 'ष',
  nga: 'ङ',
  nya: 'ञ',
  chha: 'छ',
  tha: 'थ',
  pha: 'फ',
  bha: 'भ',
  jha: 'झ',
  ghha: 'घ्',
  khha: 'ख्',
}

const CONSONANTS: { [key: string]: string } = {
  k: 'क्',
  kh: 'ख्',
  g: 'ग्',
  gh: 'घ्',
  ng: 'ङ्',
  ch: 'च्',
  chh: 'छ्',
  j: 'ज्',
  jh: 'झ्',
  ny: 'ञ्',
  t: 'त्',
  th: 'थ्',
  d: 'द्',
  dh: 'ध्',
  n: 'न्',
  p: 'प्',
  ph: 'फ्',
  f: 'फ्',
  b: 'ब्',
  bh: 'भ्',
  m: 'म्',
  y: 'य्',
  r: 'र्',
  l: 'ल्',
  w: 'व्',
  v: 'व्',
  sh: 'श्',
  s: 'स्',
  h: 'ह्',
  T: 'ट्',
  Th: 'ठ्',
  D: 'ड्',
  Dh: 'ढ्',
  N: 'ण्',
  Sh: 'ष्',
}

const INDEPENDENT_VOWELS: { [key: string]: string } = {
  a: 'अ',
  aa: 'आ',
  A: 'आ',
  i: 'इ',
  ee: 'ई',
  I: 'ई',
  u: 'उ',
  oo: 'ऊ',
  U: 'ऊ',
  e: 'ए',
  ai: 'ऐ',
  o: 'ओ',
  au: 'औ',
  am: 'अं',
  ah: 'अः',
  ri: 'ऋ',
}

const DEPENDENT_MATRAS: { [key: string]: string } = {
  a: '', // Inherent vowel removes halant
  aa: 'ा',
  A: 'ा',
  i: 'ि',
  ee: 'ी',
  I: 'ी',
  u: 'ु',
  oo: 'ू',
  U: 'ू',
  e: 'े',
  ai: 'ै',
  o: 'ो',
  au: 'ौ',
  am: 'ं',
  ah: 'ः',
  ri: 'ृ',
}

const DIGITS: { [key: string]: string } = {
  '0': '०',
  '1': '१',
  '2': '२',
  '3': '३',
  '4': '४',
  '5': '५',
  '6': '६',
  '7': '७',
  '8': '८',
  '9': '९',
}

/**
 * Transliterates a single romanized word to Nepali Devanagari
 */
export function transliterateWord(input: string): string {
  let result = ''
  let i = 0

  while (i < input.length) {
    const char = input[i]

    // Handle numbers
    if (DIGITS[char]) {
      result += DIGITS[char]
      i++
      continue
    }

    // Check special multi-character conjuncts (4, 3, 2 chars)
    const four = input.slice(i, i + 4).toLowerCase()
    const three = input.slice(i, i + 3).toLowerCase()
    const two = input.slice(i, i + 2).toLowerCase()

    if (SPECIAL_CONJUNCTS[four]) {
      result += SPECIAL_CONJUNCTS[four]
      i += 4
      continue
    }

    if (SPECIAL_CONJUNCTS[three]) {
      result += SPECIAL_CONJUNCTS[three]
      i += 3
      continue
    }

    // Check 2 or 1 character consonants
    let matchedConsonantKey = ''
    if (CONSONANTS[two]) {
      matchedConsonantKey = two
    } else if (CONSONANTS[input.slice(i, i + 2)]) {
      matchedConsonantKey = input.slice(i, i + 2)
    } else if (CONSONANTS[char]) {
      matchedConsonantKey = char
    }

    if (matchedConsonantKey) {
      const devanagariConsonant = CONSONANTS[matchedConsonantKey]
      i += matchedConsonantKey.length

      // Lookahead for following vowel matra
      const nextTwo = input.slice(i, i + 2).toLowerCase()
      const nextOne = input.slice(i, i + 1).toLowerCase()

      if (DEPENDENT_MATRAS[nextTwo] !== undefined) {
        // Strip halant and append matra
        const base = devanagariConsonant.replace('्', '')
        result += base + DEPENDENT_MATRAS[nextTwo]
        i += 2
      } else if (DEPENDENT_MATRAS[nextOne] !== undefined) {
        const base = devanagariConsonant.replace('्', '')
        result += base + DEPENDENT_MATRAS[nextOne]
        i += 1
      } else {
        // Standalone half letter with halant
        result += devanagariConsonant
      }
      continue
    }

    // Check standalone independent vowels
    if (INDEPENDENT_VOWELS[two]) {
      result += INDEPENDENT_VOWELS[two]
      i += 2
      continue
    }

    if (INDEPENDENT_VOWELS[char]) {
      result += INDEPENDENT_VOWELS[char]
      i++
      continue
    }

    // Any punctuation, space, or unhandled character passes through
    result += char
    i++
  }

  return result
}

/**
 * Full text transliterator preserving lines and spaces
 */
export function transliterateRomanToNepali(text: string): string {
  if (!text) return ''

  return text
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token
      return transliterateWord(token)
    })
    .join('')
}
