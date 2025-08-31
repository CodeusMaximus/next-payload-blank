 // collections/Deli.ts
import type { CollectionConfig } from 'payload'

type AnyData = Record<string, any>

const WEIGHT_OPTIONS: { label: string; value: string }[] = Array.from(
  { length: 12 },
  (_, i) => {
    const val = 0.25 * (i + 1) // 0.25..3.0
    return {
      label: `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2)} lb`,
      value: val.toString(),
    }
  }
)

const DELI_WEIGHT_CATS = new Set<string>(['cold-cuts', 'cheese'])

const Deli: CollectionConfig = {
  slug: 'deli',
  labels: { singular: 'Deli Item', plural: 'Deli' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: [
      'name',
      'category',
      'soldByWeight',
      'price',
      'pricePerLb',
      'visible',
      'updatedAt',
    ],
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true },
    { name: 'description', type: 'textarea' },

    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Sandwiches', value: 'sandwiches' },
        { label: 'Wraps', value: 'wraps' },
        { label: 'Salads', value: 'salads' },
        { label: 'Cold Cuts', value: 'cold-cuts' },
        { label: 'Cheese', value: 'cheese' },
        { label: 'Sides', value: 'sides' },
        { label: 'Other', value: 'other' },
      ],
      defaultValue: 'sandwiches',
    },

    {
      name: 'soldByWeight',
      label: 'Sold by Weight (per lb)',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Enable for items priced per pound (e.g., cold cuts, cheese).',
      },
    },

    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        condition: (data?: AnyData) => !data?.soldByWeight,
        description: 'Unit price (hidden if item is sold by weight).',
      },
    },

    {
      name: 'pricePerLb',
      type: 'number',
      admin: {
        condition: (data?: AnyData) => !!data?.soldByWeight,
        description: 'Required when sold by weight. Example: 11.99',
      },
      validate: (val: unknown, { data }: { data?: AnyData }) => {
        if (data?.soldByWeight) {
          if (typeof val !== 'number' || !isFinite(val) || val <= 0) {
            return 'Price per lb is required and must be > 0.'
          }
        }
        return true
      },
    },

    {
      name: 'allowedWeights',
      label: 'Allowed Weights (lbs)',
      type: 'select',
      hasMany: true,
      options: WEIGHT_OPTIONS,
      defaultValue: ['0.25', '0.5', '1'],
      admin: {
        condition: (data?: AnyData) => !!data?.soldByWeight,
        description:
          'Quarter-pound increments customers can choose. Default: 0.25, 0.5, 1 lb.',
      },
    },

    {
      name: 'madeToOrder',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'If true, customers can customize (bread, toppings, etc.).' },
    },

    {
      name: 'optionsNote',
      type: 'text',
      admin: {
        description:
          'Optional: brief list of choices (e.g., breads: hero/roll/wheat; cheese: American/Swiss/Provolone).',
      },
    },

    { name: 'visible', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },

    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Spicy', value: 'spicy' },
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Halal', value: 'halal' },
        { label: 'Kosher-Style', value: 'kosher-style' },
      ],
    },
  ],

  hooks: {
    beforeValidate: [
      ({ data }: { data?: AnyData }) => {
        if (data?.name && !data.slug) {
          data.slug = String(data.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }

        if (data?.category) {
          if (DELI_WEIGHT_CATS.has(data.category)) {
            if (typeof data.soldByWeight === 'undefined') data.soldByWeight = true
          } else {
            if (typeof data.soldByWeight === 'undefined') data.soldByWeight = false
          }
        }

        if (!data?.soldByWeight) {
          delete data.pricePerLb
          delete data.allowedWeights
        }

        return data
      },
    ],
  },
}

export default Deli
