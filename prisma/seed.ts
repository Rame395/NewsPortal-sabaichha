import { PrismaClient, Role, ArticleStatus } from './generated/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export const ALL_PERMISSIONS = [
  'articles:create',
  'articles:edit_own',
  'articles:edit_all',
  'articles:publish',
  'articles:delete',
  'breaking:manage',
  'categories:manage',
  'comments:moderate',
  'media:upload',
  'users:manage',
  'audit:view',
]

async function main() {
  console.log('Seeding initial categories...')

  const defaultCategories = [
    {
      nameEn: 'Politics',
      nameNe: 'राजनीति',
      slug: 'politics',
      description: 'National and international political developments, policy debates, and governance.',
      orderIndex: 1,
      showInMenu: true,
    },
    {
      nameEn: 'Society',
      nameNe: 'समाज',
      slug: 'society',
      description: 'Community affairs, social issues, civic events, and human interest stories.',
      orderIndex: 2,
      showInMenu: true,
    },
    {
      nameEn: 'Economy',
      nameNe: 'अर्थ',
      slug: 'economy',
      description: 'Business, markets, banking, trade, and economic analysis.',
      orderIndex: 3,
      showInMenu: true,
    },
    {
      nameEn: 'Opinion',
      nameNe: 'विचार',
      slug: 'opinion',
      description: 'Editorials, guest columns, and analytical commentary from thought leaders.',
      orderIndex: 4,
      showInMenu: true,
    },
    {
      nameEn: 'Sports',
      nameNe: 'खेलकुद',
      slug: 'sports',
      description: 'Cricket, football, athletics, tournament updates, and player profiles.',
      orderIndex: 5,
      showInMenu: true,
    },
    {
      nameEn: 'Video',
      nameNe: 'भिडियो',
      slug: 'video',
      description: 'Visual journalism, video reports, and multimedia coverage.',
      orderIndex: 6,
      showInMenu: true,
    },
  ]

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
  }

  console.log('Seeding root Super Admin account...')
  const salt = await bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash('Admin@123456', salt)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sabaichha.com' },
    update: {
      role: Role.SUPER_ADMIN,
      permissions: ALL_PERMISSIONS,
      passwordHash,
      mustChangePassword: false,
    },
    create: {
      fullName: 'Super Administrator',
      email: 'admin@sabaichha.com',
      passwordHash,
      role: Role.SUPER_ADMIN,
      permissions: ALL_PERMISSIONS,
      mustChangePassword: false,
      bio: 'Principal administrator with full platform authorization at SabaiChha.com.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      isActive: true,
    },
  })

  console.log('Seeding sample published articles...')
  const politicsCat = await prisma.category.findUnique({ where: { slug: 'politics' } })
  const economyCat = await prisma.category.findUnique({ where: { slug: 'economy' } })
  const sportsCat = await prisma.category.findUnique({ where: { slug: 'sports' } })

  if (politicsCat) {
    await prisma.article.upsert({
      where: { slug: 'national-economic-reform-plan-passed' },
      update: {},
      create: {
        title: 'मन्त्रिपरिषद्द्वारा नयाँ राष्ट्रिय आर्थिक सुधार कार्ययोजना पारित',
        slug: 'national-economic-reform-plan-passed',
        subtitle: 'रोजगारी सिर्जना तथा डिजिटल अर्थतन्त्र प्रवर्द्धनलाई उच्च प्राथमिकता',
        content: `काठमाडौं । सरकारले आगामी दशकको आर्थिक विकासलाई तीव्र बनाउने लक्ष्यसहित विस्तृत राष्ट्रिय आर्थिक सुधार कार्ययोजना पारित गरेको छ । प्रधानमन्त्री कार्यालयमा आइतबार बसेको मन्त्रिपरिषद्को विशेष बैठकले नीतिगत, कानुनी तथा संरचनात्मक सुधारका प्रस्तावहरू समेटिएको कार्ययोजना अनुमोदन गरेको हो ।\n\nकार्ययोजनामा युवाहरूलाई स्वदेशमै रोजगारीका अवसरहरू प्रदान गर्न नवीनतम सूचना प्रविधि (आईटी), पर्यटन, कृषि प्रशोधन र जलविद्युत् क्षेत्रमा लगानीमैत्री वातावरण बनाउने निर्णय गरिएको छ ।\n\nअर्थमन्त्रीका अनुसार साना तथा मझौला उद्योगीहरूलाई सहुलियतपूर्ण कर्जा र प्रविधि हस्तान्तरणमा थप सहुलियत दिइनेछ ।`,
        excerpt: '• आगामी आर्थिक वर्षमा २ लाख नयाँ रोजगारी सिर्जना गर्ने लक्ष्य\n• डिजिटल अर्थतन्त्र र आईटी क्षेत्रका लागि कर छुटको व्यवस्था\n• निर्यात व्यापार प्रवर्द्धनमा नयाँ सहुलियत घोषणा',
        featuredImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'सिंहदरबारमा आयोजित पत्रकार सम्मेलनमा मन्त्रिपरिषद्का निर्णय सार्वजनिक गरिँदै । तस्बिर: रासस',
        status: ArticleStatus.PUBLISHED,
        isBreaking: true,
        isFeatured: true,
        viewCount: 1420,
        readTimeMinutes: 4,
        authorId: admin.id,
        categoryId: politicsCat.id,
        publishedAt: new Date(),
      },
    })
  }

  if (economyCat) {
    await prisma.article.upsert({
      where: { slug: 'hydropower-export-record-growth' },
      update: {},
      create: {
        title: 'नेपालमा जलविद्युत् निर्यातबाट ऐतिहासिक आम्दानी, विदेशी मुद्रा सञ्चिति बलियो',
        slug: 'hydropower-export-record-growth',
        subtitle: 'छिमेकी राष्ट्रहरूसँगको ऊर्जा सम्झौता कार्यान्वयनमा तीव्रता',
        content: `नेपाल विद्युत् प्राधिकरणले चालु आर्थिक वर्षमा छिमेकी राष्ट्रतर्फ जलविद्युत् निर्यात गरी ऐतिहासिक विदेशी मुद्रा आर्जन गरेको जनाएको छ । हालै सम्पन्न अन्तरदेशीय प्रसारण लाइन सम्झौतापछि विद्युत् व्यापार उल्लेख्य रूपमा बढेको हो ।\n\nप्राधिकरणका अनुसार आगामी हिउँदसम्ममा आन्तरिक माग धान्दै थप ऊर्जा निर्यात गर्न जलाशययुक्त आयोजनाहरूको कामलाई तीव्रता दिइएको छ ।`,
        excerpt: '• चालु आर्थिक वर्षमा २५ अर्ब बढीको विद्युत् निर्यात\n• विदेशी विनिमय सञ्चिति उत्साहजनक स्तरमा पुग्यो\n• थप तीनवटा अन्तरदेशीय प्रसारण लाइनको निर्माण सुरु',
        featuredImage: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'नेपालको एक प्रमुख जलविद्युत् आयोजना । फाइल तस्बिर',
        status: ArticleStatus.PUBLISHED,
        isBreaking: false,
        isFeatured: true,
        viewCount: 980,
        readTimeMinutes: 3,
        authorId: admin.id,
        categoryId: economyCat.id,
        publishedAt: new Date(Date.now() - 3600000 * 4),
      },
    })
  }

  if (sportsCat) {
    await prisma.article.upsert({
      where: { slug: 'nepal-cricket-historic-series-win' },
      update: {},
      create: {
        title: 'नेपाली राष्ट्रिय क्रिकेट टोलीद्वारा अन्तर्राष्ट्रिय शृङ्खलामा उत्कृष्ट जित',
        slug: 'nepal-cricket-historic-series-win',
        subtitle: 'अन्तिम ओभरको रोमाञ्चक खेलमा ऐतिहासिक सफलता',
        content: `कीर्तिपुरस्थित त्रिवि अन्तर्राष्ट्रिय क्रिकेट मैदानमा भएको रोमाञ्चक अन्तिम खेलमा नेपालले प्रतिस्पर्धी टोलीलाई पराजित गर्दै ऐतिहासिक शृङ्खला आफ्नो नाममा गरेको छ । हजारौं नेपाली समर्थकहरूको उपस्थितिमा खेलाडीहरूले उत्कृष्ट बलिङ र ब्याटिङ प्रदर्शन गरेका थिए ।`,
        excerpt: '• अन्तिम ओभरमा जित हात पार्दै शृङ्खला नेपालको पक्षमा\n• बलरहरूको सन्तुलित र कसिलो प्रदर्शन\n• हजारौं दर्शकद्वारा मैदानमै भव्य विजयोत्सव',
        featuredImage: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?auto=format&fit=crop&w=1200&q=80',
        imageCaption: 'कीर्तिपुर मैदानमा जितपछि उत्सव मनाउँदै नेपाली क्रिकेट खेलाडीहरू ।',
        status: ArticleStatus.PUBLISHED,
        isBreaking: false,
        isFeatured: false,
        viewCount: 2150,
        readTimeMinutes: 2,
        authorId: admin.id,
        categoryId: sportsCat.id,
        publishedAt: new Date(Date.now() - 3600000 * 12),
      },
    })
  }

  console.log('Database seeding successfully finished!')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
