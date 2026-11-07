import { getHomepageData } from '@/lib/data/homepage'
import { PublicHomepage } from '@/components/home/public-homepage'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getHomepageData()

  return (
    <PublicHomepage
      trendingTopics={data.trendingTopics}
      categories={data.categories}
      categorySections={data.categorySections}
      breakingArticles={data.breakingArticles}
      featuredArticles={data.featuredArticles}
      featuredLead={data.featuredLead}
      topHighlights={data.topHighlights}
      trendingArticles={data.trendingArticles}
    />
  )
}
