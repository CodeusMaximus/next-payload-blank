// app/components/ProductDeals.tsx (SERVER)
import Link from 'next/link'
import CategoryScroller from './CategoryScroller'
import ProductRow from './ProductRow'

type Props = {
  // If you render this from a page, pass searchParams down: <ProductDeals searchParams={searchParams} />
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function ProductDeals({ searchParams }: Props) {
  // ----- CATEGORY SCROLLER DATA -----
  const categories = [
    { label: 'Dairy', href: '/category/dairy', iconKey: 'milk' as const },
    { label: 'Drinks', href: '/category/drinks', iconKey: 'drinks' as const },
    { label: 'Frozen', href: '/category/frozen', iconKey: 'frozen' as const },
    { label: 'Deli', href: '/category/deli', iconKey: 'deli' as const },
    { label: 'Produce', href: '/category/produce', iconKey: 'produce' as const },
    { label: 'Meat', href: '/category/meat', iconKey: 'meat' as const },
    { label: 'Bakery', href: '/category/bakery', iconKey: 'bakery' as const },
    { label: 'Alcohol', href: '/category/alcohol', iconKey: 'alcohol' as const },
    { label: 'Seafood', href: '/category/seafood', iconKey: 'seafood' as const },

    { label: 'Bread', href: '/category/bread', iconKey: 'bread' as const },
    { label: 'Coffee', href: '/category/coffee', iconKey: 'coffee' as const },
    { label: 'Vegetables', href: '/category/vegetables', iconKey: 'vegetables' as const },
    { label: 'Fruits', href: '/category/fruits', iconKey: 'fruits' as const },
    { label: 'Cheese', href: '/category/cheese', iconKey: 'cheese' as const },
    { label: 'Breakfast', href: '/category/breakfast', iconKey: 'breakfast' as const },

    { label: 'Hot Food', href: '/category/hot-food', iconKey: 'hot-food' as const },
    { label: 'Cold Food', href: '/category/cold-food', iconKey: 'cold-food' as const },
    { label: 'Sandwiches', href: '/category/sandwiches', iconKey: 'sandwiches' as const },
    { label: 'Salads', href: '/category/salads', iconKey: 'salads' as const },
    { label: 'Soups', href: '/category/soups', iconKey: 'soups' as const },
    { label: 'Pizza', href: '/category/pizza', iconKey: 'pizza' as const },

    { label: 'Snacks', href: '/category/snacks', iconKey: 'snacks' as const },
    { label: 'Candy', href: '/category/candy', iconKey: 'candy' as const },
    { label: 'Desserts', href: '/category/desserts', iconKey: 'desserts' as const },
    { label: 'Energy', href: '/category/energy', iconKey: 'energy' as const },

    { label: 'Health Foods', href: '/category/health', iconKey: 'health' as const },
    { label: 'Organic', href: '/category/organic', iconKey: 'organic' as const },
    { label: 'Personal Care', href: '/category/personal', iconKey: 'personal' as const },
    { label: 'Pharmacy', href: '/category/pharmacy', iconKey: 'pharmacy' as const },

    { label: 'Baby Items', href: '/category/baby', iconKey: 'baby' as const },
    { label: 'Pet Supplies', href: '/category/pet', iconKey: 'pet' as const },
    { label: 'Household', href: '/category/household', iconKey: 'household' as const },
    { label: 'Flowers', href: '/category/flowers', iconKey: 'flowers' as const },
  ]

  // ----- ROW DEFINITIONS (WHAT YOU ALREADY HAD) -----
  const ROWS: Array<
    | { type: 'deal'; title: string; ctaLabel: string; ctaHref: string; dealOfWeek: true }
    | { type: 'cat'; title: string; ctaLabel: string; ctaHref: string; category: string }
  > = [
    { type: 'deal', title: 'Deals of the Week', ctaLabel: 'See all deals', ctaHref: '/deals', dealOfWeek: true },
    { type: 'cat', title: 'Ice Cream', category: 'ice-cream', ctaLabel: 'Shop Ice Cream', ctaHref: '/category/ice-cream' },
    { type: 'cat', title: 'Soda', category: 'soda', ctaLabel: 'Shop Soda', ctaHref: '/category/soda' },
    { type: 'cat', title: 'Fruits', category: 'fruits', ctaLabel: 'Shop Fruits', ctaHref: '/category/fruits' },
    { type: 'cat', title: 'Alcohol', category: 'alcohol', ctaLabel: 'Shop Alcohol', ctaHref: '/category/alcohol' },
    { type: 'cat', title: 'Chips', category: 'chips', ctaLabel: 'Shop Chips', ctaHref: '/category/chips' },
    { type: 'cat', title: 'Desserts', category: 'desserts', ctaLabel: 'Shop Desserts', ctaHref: '/category/desserts' },
    { type: 'cat', title: 'Paper & Plastic', category: 'paper-plastic', ctaLabel: 'Shop Paper & Plastic', ctaHref: '/category/paper-plastic' },
  ]

  // ----- SIMPLE PAGINATION OVER ROWS -----
  const pageSize = 4 // how many rows to show per page (tweak to taste)
  const pageParam = Array.isArray(searchParams?.dealsPage)
    ? searchParams?.dealsPage[0]
    : searchParams?.dealsPage
  const currentPage = Math.max(1, Number(pageParam || 1))
  const totalPages = Math.max(1, Math.ceil(ROWS.length / pageSize))
  const page = Math.min(currentPage, totalPages)

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const visibleRows = ROWS.slice(start, end)

  // helper to build relative links that keep you on the same route
  const pageHref = (p: number) => `?dealsPage=${p}#deals`

  return (
    <section id="deals" className="w-full scroll-mt-28 md:scroll-mt-32">
      {/* Top scroller */}
      <div className="py-4">
        <CategoryScroller items={categories} />
      </div>

      {/* Paged rows */}
      <div className="space-y-8">
        {visibleRows.map((row, i) =>
          row.type === 'deal' ? (
            <ProductRow
              key={`deal-${i}`}
              title={row.title}
              dealOfWeek
              ctaLabel={row.ctaLabel}
              ctaHref={row.ctaHref}
            />
          ) : (
            <ProductRow
              key={`cat-${row.category}-${i}`}
              title={row.title}
              category={row.category}
              ctaLabel={row.ctaLabel}
              ctaHref={row.ctaHref}
            />
          )
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {/* Prev */}
          <Link
            aria-disabled={page <= 1}
            href={page > 1 ? pageHref(page - 1) : pageHref(1)}
            className={`px-3 py-2 rounded-lg border ${
              page > 1
                ? 'border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                : 'border-gray-200 dark:border-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            Prev
          </Link>

          {/* Page numbers (compact) */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => {
              const p = idx + 1
              const active = p === page
              return (
                <Link
                  key={p}
                  href={pageHref(p)}
                  className={`h-9 min-w-9 px-2 inline-flex items-center justify-center rounded-md border text-sm ${
                    active
                      ? 'border-red-500 text-red-600 font-semibold bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-300 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </div>

          {/* Next */}
          <Link
            aria-disabled={page >= totalPages}
            href={page < totalPages ? pageHref(page + 1) : pageHref(totalPages)}
            className={`px-3 py-2 rounded-lg border ${
              page < totalPages
                ? 'border-gray-300 dark:border-white/10 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/70'
                : 'border-gray-200 dark:border-white/10 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
          </Link>
        </div>
      )}
    </section>
  )
}
