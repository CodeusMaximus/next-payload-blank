// app/(app)/page.tsx
import Hero from './components/Hero'
import ProductDeals from './components/ProductDeals'

export const dynamic = 'force-dynamic'

type SearchParams = { [key: string]: string | string[] | undefined }

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams
}) {
  return (
    <main className="flex-1 p-0 m-0">
      <Hero />

      {/* ProductDeals handles its own category scroller + row pagination */}
      <div className="py-4">
        <ProductDeals searchParams={searchParams} />
      </div>
    </main>
  )
}
