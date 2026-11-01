import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { ArticleStatus } from '@/lib/prisma'
import { Clock, Calendar, ArrowLeft, FolderTree } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { nameEn: true, nameNe: true, description: true },
  })

  if (!category) {
    return { title: 'Category Not Found | SabaiChha.com' }
  }

  return {
    title: `${category.nameNe} (${category.nameEn}) | SabaiChha.com`,
    description: category.description || `Latest ${category.nameEn} news on SabaiChha.com`,
  }
}

export default async function CategoryArchivePage({ params }: PageProps) {
  const { slug } = await params

  const [category, allCategories] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          select: { id: true, nameEn: true, nameNe: true, slug: true },
        },
        articles: {
          where: { status: ArticleStatus.PUBLISHED },
          orderBy: { publishedAt: 'desc' },
          include: {
            author: { select: { fullName: true } },
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
  ])

  if (!category) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={allCategories} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Category Title Header with Red Accent */}
        <div className="pb-4 border-b-2 border-red-600 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
              <FolderTree className="w-4 h-4" />
              <span>समाचार विधा</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              {category.nameNe} <span className="text-xl sm:text-2xl font-bold text-slate-400 font-sans">({category.nameEn})</span>
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>

          <span className="text-xs font-bold text-slate-500 font-mono">
            {category.articles.length} समाचार फेला परे
          </span>
        </div>

        {/* Subcategories Pills if any */}
        {category.children && category.children.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">उपविधाहरू:</span>
            {category.children.map((sub) => (
              <Link
                key={sub.id}
                href={`/category/${sub.slug}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-600 hover:text-red-600 transition"
              >
                {sub.nameNe}
              </Link>
            ))}
          </div>
        )}

        {/* Article Grid */}
        {category.articles.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-3">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              यस विधामा हाल कुनै समाचार प्रकाशित गरिएको छैन।
            </p>
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline">
              <ArrowLeft className="w-4 h-4" />
              <span>मुख्य पृष्ठमा फर्कनुहोस्</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.articles.map((art) => (
              <div
                key={art.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col group"
              >
                {art.featuredImage ? (
                  <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full overflow-hidden">
                    <Image
                      src={art.featuredImage}
                      alt={art.title}
                      fill
                      className="object-cover group-hover:scale-103 transition duration-300"
                    />
                  </Link>
                ) : (
                  <div className="aspect-16/10 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <span className="text-xs font-mono">No Cover Photo</span>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link
                      href={`/news/${art.slug}`}
                      className="text-base font-bold text-slate-950 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition line-clamp-2 leading-snug"
                    >
                      {art.title}
                    </Link>
                    {art.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {art.subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span>{art.author.fullName}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" />
                      <span>{art.readTimeMinutes} min</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 SabaiChha.com. All rights reserved.</p>
      </footer>
    </div>
  )
}
