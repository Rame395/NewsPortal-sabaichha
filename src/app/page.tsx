import { getHomepageData } from '@/lib/data/homepage'
import { PublicHomepage } from '@/components/home/public-homepage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getHomepageData()

  return (
    <PublicHomepage
      categories={data.categories}
      breakingArticles={data.breakingArticles}
      featuredLead={data.featuredLead}
      topHighlights={data.topHighlights}
      trendingArticles={data.trendingArticles}
      politicsArticles={data.politicsArticles}
      economyArticles={data.economyArticles}
      sportsArticles={data.sportsArticles}
    />
  )
}
