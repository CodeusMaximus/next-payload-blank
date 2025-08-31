// app/(app)/search/page.tsx
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

type SearchPageProps = {
  searchParams?: { q?: string }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const q = (searchParams?.q ?? '').trim()
  if (!q) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Search
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Type something in the search box to find products.
          </p>
        </div>
      </div>
    )
  }

  const payload = await getPayload({ config })

  // Basic "LIKE" search across common fields.
  // (Payload supports 'like' for partial matches; adjust as your schema evolves.)
  const res = await payload.find({
    collection: 'products' as any,
    depth: 1,
    limit: 48,
    where: {
      or: [
        { name: { like: q } },
        { description: { like: q } },
        { tags: { like: q } },       // works if your tags are strings
        { slug: { like: q } },
        { category: { equals: q.toLowerCase() } },
      ],
    },
    sort: 'name',
  })

  const items = res?.docs ?? []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Results for “{q}”
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {items.length} {items.length === 1 ? 'item' : 'items'} found
        </p>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 dark:border-white/10 p-8 text-center text-gray-500 dark:text-gray-400">
            No products matched your search.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((p: any) => {
              const mainImage = Array.isArray(p.images) ? p.images[0] : p.images
              const imgUrl = mainImage?.url ?? null
              const href = `/product/${encodeURIComponent(p.slug || p.id)}`
              return (
                <Link
                  key={p.id}
                  href={href}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 hover:shadow-lg transition"
                >
                  <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
                    {imgUrl && (
                      <Image
                        src={imgUrl}
                        alt={p.name || 'Product image'}
                        fill
                        className="object-cover"
                        sizes="(max-width:768px) 100vw, 25vw"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {p.name}
                    </h3>
                    {typeof p.price === 'number' && (
                      <div className="text-sm text-gray-700 dark:text-gray-200">
                        ${p.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
