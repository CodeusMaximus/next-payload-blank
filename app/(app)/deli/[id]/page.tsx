 // app/(app)/deli/[id]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Scale } from 'lucide-react'
import DeliPurchase from './purchase-client'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { id: string }

export default async function DeliDetailPage(
  props: { params: Promise<Params> }
) {
  const { id } = await props.params

  const payload = await getPayload({ config })

  let doc: any | null = null
  try {
    doc = await payload.findByID({
      collection: 'deli' as any,
      id,
      depth: 2,
    })
  } catch {
    const res = await payload.find({
      collection: 'deli' as any,
      where: { slug: { equals: id } },
      depth: 2,
      limit: 1,
    })
    doc = res?.docs?.[0] ?? null
  }

  if (!doc) notFound()

  const mainImage = Array.isArray(doc.images) ? doc.images[0] : doc.images
  const imageUrl = mainImage?.url ?? null
  const imageAlt = mainImage?.alt ?? doc.name

  const isWeight = !!doc.soldByWeight
  const priceText = isWeight
    ? `$${Number(doc.pricePerLb || 0).toFixed(2)}/lb`
    : `$${Number(doc.price || 0).toFixed(2)}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/deli"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deli
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative">
              <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}

                {isWeight && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-900/85 text-white">
                    <Scale className="h-3.5 w-3.5" />
                    Priced by lb
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 md:p-8">
              <div className="mb-2">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize">
                  {String(doc.category || '').replace(/-/g, ' ')}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {doc.name}
              </h1>

              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    {priceText}
                  </span>
                </div>
              </div>

              {doc.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              )}

              <DeliPurchase doc={doc} imageUrl={imageUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
