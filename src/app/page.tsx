import { Suspense } from 'react'
import { getCategories } from '@/lib/data/categories'
import { PhaseOneDashboard } from '@/components/home/phase-one-dashboard'

async function CategoriesLoader() {
  const categories = await getCategories()
  return <PhaseOneDashboard categories={categories} />
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 text-slate-500 font-medium">
          Loading SabaiChha.com...
        </div>
      }
    >
      <CategoriesLoader />
    </Suspense>
  )
}
