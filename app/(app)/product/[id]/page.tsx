// app/(app)/product/[id]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RefreshCw, CreditCard, CircleSlash } from 'lucide-react'
import AddToCartButton from '../../components/product/add-to-cart-button'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Params = { id: string }

export default async function ProductPage(
  props: { params: Promise<Params> }
) {
  const { id } = await props.params
  const payload = await getPayload({ config })

  try {
    let product: any

    // Try by ID first
    try {
      product = await payload.findByID({
        collection: 'products' as any,
        id,
        depth: 2,
      })
    } catch {
      // Fallback to slug
      const results = await payload.find({
        collection: 'products' as any,
        where: { slug: { equals: id } },
        depth: 2,
        limit: 1,
      })
      product = results.docs?.[0]
    }

    if (!product) notFound()

    const snapEligible: boolean = !!product.snapEligible
    const snapNote: string | undefined = product.snapNote

    const mainImage = Array.isArray(product.images) ? product.images[0] : product.images
    const imageUrl = typeof mainImage === 'object' && mainImage?.url ? mainImage.url : null
    const imageAlt = typeof mainImage === 'object' && mainImage?.alt ? mainImage.alt : product.name

    const isOnSale = !!(product.onSale && product.salePrice)
    const displayPrice: number = isOnSale ? product.salePrice : product.price
    const originalPrice: number | null = isOnSale ? product.price : null

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative">
                {imageUrl ? (
                  <div className="aspect-square relative bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={imageUrl}
                      alt={imageAlt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    {isOnSale && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        SALE
                      </div>
                    )}
                    {product.dealOfWeek && (
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Deal of the Week
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <div className="text-gray-400 text-center">
                      <div className="h-16 w-16 mx-auto mb-2 opacity-50" />
                      <p>No image available</p>
                    </div>
                  </div>
                )}

                {/* Thumbnails */}
                {Array.isArray(product.images) && product.images.length > 1 && (
                  <div className="flex gap-2 mt-4 px-6">
                    {product.images.slice(0, 4).map((img: any, i: number) => {
                      const thumbUrl = typeof img === 'object' && img?.url ? img.url : null
                      return thumbUrl ? (
                        <div key={i} className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <Image src={thumbUrl} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="64px" />
                        </div>
                      ) : null
                    })}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize">
                    {product.category?.replace('-', ' ')}
                  </span>
                  {product.sku && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                    </>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {product.name}
                </h1>

                {/* SNAP */}
                <div className="mb-5">
                  {snapEligible ? (
                    <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 border-orange-500 text-orange-400 ring-2 ring-orange-500/20 uppercase tracking-wide text-sm md:text-base font-semibold">
                      <CreditCard className="h-5 w-5" />
                      SNAP • EBT ELIGIBLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 border-gray-500 text-gray-300 ring-2 ring-gray-500/15 uppercase tracking-wide text-sm md:text-base font-semibold" title={snapNote || undefined}>
                      <CircleSlash className="h-5 w-5" />
                      NOT SNAP ELIGIBLE
                    </span>
                  )}
                  {snapNote && <p className="mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">{snapNote}</p>}
                </div>

                {/* Rating (placeholder) */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">(4.8) • 127 reviews</span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${displayPrice?.toFixed(2)}</span>
                    {originalPrice && (
                      <span className="text-xl text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                    )}
                  </div>
                  {isOnSale && originalPrice && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Save ${(originalPrice - displayPrice!).toFixed(2)} ({(((originalPrice - displayPrice!) / originalPrice) * 100).toFixed(0)}% off)
                    </p>
                  )}
                </div>

                {/* Tags */}
                {product.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {product.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full capitalize">
                        {tag.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stock */}
                {product.stock !== undefined && (
                  <div className="mb-6">
                    {product.stock > 0 ? (
                      <p className="text-green-600 dark:text-green-400 text-sm">✓ In Stock ({product.stock} available)</p>
                    ) : (
                      <p className="text-red-600 dark:text-red-400 text-sm">✗ Out of Stock</p>
                    )}
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <AddToCartButton product={product} />
                  <div className="flex gap-3">
                    <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Heart className="h-4 w-4" />
                      Wishlist
                    </button>
                    <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="text-center">
                      <Truck className="h-6 w-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Free Delivery</p>
                    </div>
                    <div className="text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Secure Payment</p>
                    </div>
                    <div className="text-center">
                      <RefreshCw className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">Easy Returns</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (err) {
    console.error('Error fetching product:', err)
    notFound()
  }
}
