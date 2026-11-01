import prisma from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { Header } from '@/components/layout/header'
import { ArticleStatus } from '@/lib/prisma'
import { Search, Clock, ArrowLeft } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search results for "${q}" | SabaiChha.com` : 'Search News | SabaiChha.com',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      where: { showInMenu: true },
      orderBy: { orderIndex: 'asc' },
      select: { id: true, nameEn: true, nameNe: true, slug: true },
    }),
    query
      ? prisma.article.findMany({
          where: {
            status: ArticleStatus.PUBLISHED,
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { subtitle: { contains: query, mode: 'insensitive' } },
              { excerpt: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          orderBy: { publishedAt: 'desc' },
          include: {
            category: { select: { nameEn: true, nameNe: true, slug: true } },
            author: { select: { fullName: true } },
          },
        })
      : Promise.resolve([]),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header categories={categories} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12 space-y-8">
        {/* Search Header */}
        <div className="pb-4 border-b-2 border-red-600 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
              <Search className="w-4 h-4" />
              <span>समाचार खोजी परिणाम</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              {query ? `"${query}" को लागि नतिजाहरू` : 'समाचार खोजी'}
            </h1>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {articles.length} समाचार
          </span>
        </div>

        {/* Results */}
        {!query ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400">
            कृपया समाचार खोज्न माथिको सर्च बक्समा केही शब्द टाइप गर्नुहोस्।
          </div>
        ) : articles.length === 0 ? (
          <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-3">
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              "{query}" सँग सम्बन्धित कुनै समाचार फेला परेन।
            </p>
            <p className="text-xs text-slate-400">
              कृपया अन्य शब्द वा विधाको नाम प्रयोग गरी पुन: प्रयास गर्नुहोस्।
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((art) => (
              <div
                key={art.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-red-500/50 transition shadow-2xs hover:shadow-xs flex flex-col sm:flex-row gap-5 group"
              >
                {art.featuredImage && (
                  <Link href={`/news/${art.slug}`} className="relative aspect-16/10 w-full sm:w-48 rounded-xl overflow-hidden shrink-0">
                    <Image src={art.featuredImage} alt={art.title} fill className="object-cover group-hover:scale-103 transition" />
                  </Link>
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      {art.category.nameNe}
                    </span>
                    <Link
                      href={`/news/${art.slug}`}
                      className="block text-base font-bold text-slate-950 dark:text-white group-hover:text-red-600 transition leading-snug mt-0.5"
                    >
                      {art.title}
                    </Link>
                    {art.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {art.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{art.author.fullName}</span>
                    <span>•</span>
                    <span>{new Date(art.publishedAt || Date.now()).toLocaleDateString()}</span>
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
