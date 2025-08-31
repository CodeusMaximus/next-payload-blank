// collections/BreakfastDinner.ts
import type { CollectionConfig } from 'payload'

const BreakfastDinner: CollectionConfig = {
  slug: 'breakfast-dinner',
  labels: { singular: 'Breakfast/Dinner Item', plural: 'Breakfast/Dinner' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'section', 'price', 'visible', 'updatedAt'],
    description:
      'Items for the Breakfast & Dinner page. Use the "section" to group items on the page.',
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
      name: 'section',
      label: 'Section',
      type: 'select',
      required: true,
      options: [
        { label: 'Breakfast', value: 'breakfast' },
        { label: 'Dinner', value: 'dinner' },
      ],
      defaultValue: 'breakfast',
    },
    {
      name: 'subcategory',
      type: 'select',
      admin: { description: 'Optional grouping (e.g., Omelettes, Platters, Burgers, Pastas).' },
      options: [
        { label: 'Omelettes', value: 'omelettes' },
        { label: 'Platters', value: 'platters' },
        { label: 'Sandwiches', value: 'sandwiches' },
        { label: 'Burgers', value: 'burgers' },
        { label: 'Pastas', value: 'pastas' },
        { label: 'Sides', value: 'sides' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'price', type: 'number', required: true },
    {
      name: 'onSale',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'salePrice',
      type: 'number',
      admin: { condition: (data) => !!data?.onSale },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Uncheck to hide this item from the menu page.' },
    },
    {
      name: 'tags',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Popular', value: 'popular' },
        { label: 'Spicy', value: 'spicy' },
        { label: 'Vegetarian', value: 'vegetarian' },
      ],
    },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.slug && data?.name) {
          data.slug = String(data.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }
        // ensure salePrice is valid
        if (data?.onSale && data?.salePrice && data?.price && data.salePrice > data.price) {
          data.salePrice = data.price
        }
        return data
      },
    ],
  },
}

export default BreakfastDinner
