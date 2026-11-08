export interface ProvinceInfo {
  slug: string
  nameNe: string
  nameEn: string
  shortNe: string
  keyword: string
  descriptionNe: string
  descriptionEn: string
}

export const PROVINCES: ProvinceInfo[] = [
  {
    slug: 'koshi',
    nameNe: 'कोशी प्रदेश',
    nameEn: 'Koshi Province',
    shortNe: 'कोशी',
    keyword: 'कोशी',
    descriptionNe: 'कोशी प्रदेशका मुख्य तथा ताजा समाचार, गतिविधि र विशेष विश्लेषण।',
    descriptionEn: 'Breaking news, updates and special reports from Koshi Province.',
  },
  {
    slug: 'madhesh',
    nameNe: 'मधेश प्रदेश',
    nameEn: 'Madhesh Province',
    shortNe: 'मधेश',
    keyword: 'मधेश',
    descriptionNe: 'मधेश प्रदेशका राजनीतिक, सामाजिक तथा आर्थिक समाचार र समसामयिक विषय।',
    descriptionEn: 'Political, social and economic news and current affairs from Madhesh Province.',
  },
  {
    slug: 'bagmati',
    nameNe: 'बागमती प्रदेश',
    nameEn: 'Bagmati Province',
    shortNe: 'बागमती',
    keyword: 'बागमती',
    descriptionNe: 'बागमती प्रदेश तथा काठमाडौँ उपत्यकाका ताजा गतिविधि, विकास र समाचार।',
    descriptionEn: 'Latest news, developments and reports from Bagmati Province and Kathmandu Valley.',
  },
  {
    slug: 'gandaki',
    nameNe: 'गण्डकी प्रदेश',
    nameEn: 'Gandaki Province',
    shortNe: 'गण्डकी',
    keyword: 'गण्डकी',
    descriptionNe: 'गण्डकी प्रदेशका पर्यटन, संस्कृति, विकास तथा समसामयिक ताजा समाचार।',
    descriptionEn: 'Tourism, culture, development and current news from Gandaki Province.',
  },
  {
    slug: 'lumbini',
    nameNe: 'लुम्बिनी प्रदेश',
    nameEn: 'Lumbini Province',
    shortNe: 'लुम्बिनी',
    keyword: 'लुम्बिनी',
    descriptionNe: 'लुम्बिनी प्रदेशका धार्मिक, सांस्कृतिक, आर्थिक तथा समग्र समाचार गतिविधि।',
    descriptionEn: 'Cultural, economic and overall news coverage from Lumbini Province.',
  },
  {
    slug: 'karnali',
    nameNe: 'कर्णाली प्रदेश',
    nameEn: 'Karnali Province',
    shortNe: 'कर्णाली',
    keyword: 'कर्णाली',
    descriptionNe: 'कर्णाली प्रदेशका भौगोलिक, पर्यटकीय, जनजीवन र विकाससम्बन्धी समाचार।',
    descriptionEn: 'News on lifestyle, geography, tourism and development from Karnali Province.',
  },
  {
    slug: 'sudurpashchim',
    nameNe: 'सुदूरपश्चिम प्रदेश',
    nameEn: 'Sudurpashchim Province',
    shortNe: 'सुदूरपश्चिम',
    keyword: 'सुदूरपश्चिम',
    descriptionNe: 'सुदूरपश्चिम प्रदेशका सीमा, विकास, समाज तथा ताजा समाचार अपडेट।',
    descriptionEn: 'Latest news, development and social updates from Sudurpashchim Province.',
  },
]

export function getProvinceBySlug(slug: string): ProvinceInfo | undefined {
  if (!slug) return undefined
  const clean = slug.toLowerCase().trim()
  return PROVINCES.find((p) => p.slug === clean)
}
