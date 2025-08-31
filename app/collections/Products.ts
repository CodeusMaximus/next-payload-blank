 // collections/Products.ts
import type { CollectionConfig } from 'payload'

// Categories we know are SNAP-ineligible (tweak as needed)
const SNAP_AUTO_INELIGIBLE = new Set<string>([
  'alcohol',
  'household',
  'personal',
  'pharmacy',
  'pet',
  'flowers',
  'paper-plastic',
  'hot-food',
])

const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: 'Product', plural: 'Products' },
  access: { read: () => true },
  admin: {
    // ⬇️ show SNAP eligibility in the list view
    defaultColumns: ['name', 'category', 'price', 'stock', 'dealOfWeek', 'snapEligible'],
    useAsTitle: 'name',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    { name: 'price', type: 'number', required: true },

    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
    },

    { name: 'sku', type: 'text' },
    { name: 'stock', type: 'number' },

    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        // Core Grocery Sections
        { label: 'Dairy', value: 'dairy' },
        { label: 'Drinks', value: 'drinks' },
        { label: 'Frozen', value: 'frozen' },
        { label: 'Deli', value: 'deli' },
        { label: 'Produce', value: 'produce' },
        { label: 'Meat', value: 'meat' },
        { label: 'Bakery', value: 'bakery' },
        { label: 'Alcohol', value: 'alcohol' },
        { label: 'Seafood', value: 'seafood' },

        // Fresh & Specialty
        { label: 'Bread', value: 'bread' },
        { label: 'Coffee', value: 'coffee' },
        { label: 'Vegetables', value: 'vegetables' },
        { label: 'Fruits', value: 'fruits' },
        { label: 'Cheese', value: 'cheese' },
        { label: 'Breakfast', value: 'breakfast' },

        // Prepared Foods
        { label: 'Hot Food', value: 'hot-food' },
        { label: 'Cold Food', value: 'cold-food' },
        { label: 'Sandwiches', value: 'sandwiches' },
        { label: 'Salads', value: 'salads' },
        { label: 'Soups', value: 'soups' },
        { label: 'Pizza', value: 'pizza' },

        // Packaged & Snacks
        { label: 'Snacks', value: 'snacks' },
        { label: 'Candy', value: 'candy' },
        { label: 'Desserts', value: 'desserts' },
        { label: 'Energy', value: 'energy' },

        // Health & Personal
        { label: 'Health Foods', value: 'health' },
        { label: 'Organic', value: 'organic' },
        { label: 'Personal Care', value: 'personal' },
        { label: 'Pharmacy', value: 'pharmacy' },

        // Other
        { label: 'Baby Items', value: 'baby' },
        { label: 'Pet Supplies', value: 'pet' },
        { label: 'Household', value: 'household' },
        { label: 'Flowers', value: 'flowers' },

        // Legacy categories (keeping for existing data)
        { label: 'Ice Cream', value: 'ice-cream' },
        { label: 'Soda', value: 'soda' },
        { label: 'Chips', value: 'chips' },
        { label: 'Paper & Plastic', value: 'paper-plastic' },
      ],
    },

    { name: 'dealOfWeek', type: 'checkbox', defaultValue: false },

    // 🔹 SNAP eligibility
    {
      name: 'snapEligible',
      type: 'checkbox',
      label: 'SNAP eligible',
      defaultValue: false,
      admin: {
        description:
          'Check if this product can be purchased with SNAP/EBT. (Alcohol, Household, Pharmacy, Pet, Flowers, Paper/Plastic, Hot Food are auto-marked ineligible.)',
        // Optional: hide the checkbox when it’s auto ineligible (prevents confusion)
        condition: (data) => !SNAP_AUTO_INELIGIBLE.has(data?.category as string),
      },
    },
    // Optional: quick note for edge cases (e.g., cold prepared foods)
    {
      name: 'snapNote',
      type: 'text',
      admin: {
        description: 'Optional note about SNAP eligibility (e.g., package labeling or store policy).',
        condition: (data) => !!data, // always visible
      },
    },

    // Additional useful fields
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Feature this product on category pages',
      },
    },

    {
      name: 'onSale',
      type: 'checkbox',
      defaultValue: false,
    },

    {
      name: 'salePrice',
      type: 'number',
      admin: {
        condition: (data) => data?.onSale,
        description: 'Sale price (if on sale)',
      },
    },

    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Limited Time', value: 'limited-time' },
        { label: 'Best Seller', value: 'best-seller' },
        { label: 'Organic', value: 'organic' },
        { label: 'Gluten Free', value: 'gluten-free' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Local', value: 'local' },
      ],
    },
  ],

  hooks: {
    beforeValidate: [
      ({ data }) => {
        // auto-generate slug
        if (!data?.slug && data?.name) {
          data.slug = String(data.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }

        // enforce SNAP auto-ineligible categories
        if (data?.category && SNAP_AUTO_INELIGIBLE.has(data.category)) {
          data.snapEligible = false
        }

        return data
      },
    ],
  },
}

export default Products
