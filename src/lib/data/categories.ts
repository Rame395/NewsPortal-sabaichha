import prisma from '@/lib/prisma'

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: {
        id: true,
        nameEn: true,
        nameNe: true,
        slug: true,
      },
    })
    return categories
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return []
  }
}
