// app/(app)/breakfastandlunch/[id]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import AddToCartButton from '../../components/product/add-to-cart-button'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const COLLECTION = 'breakfast-dinner'

export default async function BreakfastLunchDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params
  const payload = await getPayload({ config })

  let doc: any | null = null
  try {
    doc = await payload.findByID({
      collection: COLLECTION as any,
      id,
      depth: 2,
    })
  } catch {
    const res = await payload.find({
      collection: COLLECTION as any,
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

  const onSale = !!doc.onSale && typeof doc.salePrice === 'number'
  const displayPrice = onSale ? doc.salePrice : doc.price
  const originalPrice = onSale ? doc.price : null

  const productForCart: any = {
    id: doc.id,
    name: doc.name,
    price: displayPrice,
    images: doc.images,
    slug: doc.slug,
    addOns: doc.addOns,
    metadata: {
      source: 'breakfast-lunch',
      section: doc.section,
      subcategory: doc.subcategory,
      originalPrice: originalPrice ?? undefined,
    },
  }

  // Helper: stable HTML id for each checkbox and serialized value including item.id
  const makeHtmlId = (prefix: string, item: any, index: number) =>
    `${prefix}-${String(item?.id ?? index)}`

  // Helper: the JSON we put into the checkbox value (includes id + price or priceAdjustment)
  const serializeForValue = (item: any, priceKey: 'price' | 'priceAdjustment') => {
    const price =
      typeof item?.[priceKey] === 'number' ? Number(item[priceKey]) : undefined

    return JSON.stringify({
      id: item?.id ?? null,
      name: item?.name ?? '',
      price, // for portionSizes this will be priceAdjustment
      size: item?.size ?? null,
      category: item?.category ?? null,
      isDefault: !!item?.isDefault,
      isSpicy: !!item?.isSpicy,
      // keep raw too if you want on the server:
      _priceKey: priceKey,
    })
  }

  // Renders a checkbox section with IDs + JSON values that include the item's id
  const renderCheckboxSection = (
    title: string,
    items: any[] | undefined,
    namePrefix: string,
    priceKey: 'price' | 'priceAdjustment' = 'price'
  ) => {
    if (!items || items.length === 0) return null

    return (
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">{title}</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item, index) => {
            const htmlId = makeHtmlId(namePrefix, item, index)
            const raw = item?.[priceKey]
            const priceLabel =
              typeof raw === 'number'
                ? raw === 0
                  ? (priceKey === 'priceAdjustment' ? 'No extra' : 'Free')
                  : `+$${Number(raw).toFixed(2)}`
                : ''

            return (
              <label
                key={htmlId}
                htmlFor={htmlId}
                className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <input
                    id={htmlId}
                    type="checkbox"
                    name={`${namePrefix}[]`}
                    // IMPORTANT: value contains the item id + price info
                    value={serializeForValue(item, priceKey)}
                    data-id={item?.id ?? ''}
                    data-name={item?.name ?? ''}
                    data-price={typeof raw === 'number' ? Number(raw) : ''}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item?.name}
                    {item?.isSpicy && <span className="text-red-500 ml-1">🌶️</span>}
                    {item?.isDefault && <span className="text-blue-500 ml-1">(Default)</span>}
                    {item?.category && (
                      <span className="ml-1 text-gray-500 dark:text-gray-400">
                        • {String(item.category).replace(/-/g, ' ')}
                      </span>
                    )}
                    {item?.size && (
                      <span className="ml-1 text-gray-500 dark:text-gray-400">• {item.size}</span>
                    )}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {priceLabel}
                </span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/breakfastandlunch"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Breakfast/Lunch
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-8">
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

                {onSale && (
                  <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
                    <Tag className="h-3.5 w-3.5" />
                    Sale
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-6 md:p-8">
              <div className="mb-2">
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium capitalize">
                  {String(doc.subcategory || doc.section || '').replace(/-/g, ' ')}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {doc.name}
              </h1>

              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${Number(displayPrice || 0).toFixed(2)}
                  </span>
                  {originalPrice && (
                    <span className="text-xl text-gray-500 line-through">
                      ${Number(originalPrice).toFixed(2)}
                    </span>
                  )}
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

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {doc.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize"
                      >
                        {tag.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-Ons as CHECKBOXES */}
              {doc.addOns && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Choose Add-Ons
                  </h3>

                  {/* IMPORTANT: stable form id so client button can read selections */}
                  <form
                    id="customize-form"
                    className="space-y-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto"
                  >
                    {renderCheckboxSection('Extra Proteins',        doc.addOns.proteins,       'proteins')}
                    {renderCheckboxSection('Cheese Options',        doc.addOns.cheeses,        'cheeses')}
                    {renderCheckboxSection('Sauces & Condiments',   doc.addOns.sauces,         'sauces')}
                    {renderCheckboxSection('Vegetables & Toppings', doc.addOns.vegetables,     'vegetables')}
                    {renderCheckboxSection('Bread & Base Options',  doc.addOns.breadOptions,   'breadOptions')}
                    {renderCheckboxSection('Side Items & Extras',   doc.addOns.sides,          'sides')}
                    {renderCheckboxSection('Cooking Preferences',   doc.addOns.cookingOptions, 'cookingOptions')}
                    {renderCheckboxSection('Beverages',             doc.addOns.beverages,      'beverages')}
                    {renderCheckboxSection('Portion Sizes',         doc.addOns.portionSizes,   'portionSizes', 'priceAdjustment')}
                    {renderCheckboxSection('Dietary Options',       doc.addOns.dietaryOptions, 'dietaryOptions')}
                  </form>
                </div>
              )}

              {/* Your AddToCartButton should read #customize-form, parse JSON values, and
                  set selectedAddOns / addOnTotal / basePrice into the cart item */}
              <AddToCartButton product={productForCart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
