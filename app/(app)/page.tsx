// app/(app)/page.tsx
import Hero from './components/Hero'
import ProductDeals from './components/ProductDeals'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

export default async function Home(
  props: { searchParams?: Promise<SearchParams> }
) {
  const searchParams = (await props.searchParams) ?? {}

  return (
    <main className="flex-1 p-0 m-0">
      <Hero />
      <div className="py-4">
        <ProductDeals searchParams={searchParams} />
      </div>
    </main>
  )
}
