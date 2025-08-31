// collections/FAQs.ts
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

const FAQs: CollectionConfig = {
  slug: 'faqs',
  labels: { singular: 'FAQ', plural: 'FAQs' },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'isPublished', 'sortOrder', 'updatedAt'],
  },
  access: { read: () => true },
  fields: [
    { name: 'question', type: 'text', required: true },
    {
      name: 'answer',
      type: 'richText',
      // ✅ simplest: use defaults
      editor: lexicalEditor(),
      // ✅ or customize like this:
      // editor: lexicalEditor({
      //   features: ({ defaultFeatures /*, rootFeatures */ }) => [
      //     ...defaultFeatures,
      //     // add/remove feature providers here if you want
      //   ],
      // }),
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Ordering', value: 'ordering' },
        { label: 'Delivery', value: 'delivery' },
        { label: 'Payments', value: 'payments' },
        { label: 'Returns/Refunds', value: 'returns' },
      ],
      defaultValue: 'general',
    },
    { name: 'isPublished', type: 'checkbox', defaultValue: true },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'slug', type: 'text', unique: true },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data?.slug && data?.question) {
          data.slug = String(data.question)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
        }
        return data
      },
    ],
  },
}

export default FAQs
