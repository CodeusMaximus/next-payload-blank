import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  access: { read: () => true },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  upload: {
    mimeTypes: ['image/*', 'video/*'], // ✅ Now allows both images and videos
    imageSizes: [
      { name: 'thumb', width: 320, height: 240, position: 'centre' },
      { name: 'card',  width: 800, height: 600, position: 'centre' },
    ],
    disableLocalStorage: true,
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}