import { PrismaClient, Role } from './generated/client'
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

  await prisma.user.upsert({
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
