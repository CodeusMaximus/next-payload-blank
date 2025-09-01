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
    // tell Payload this is an image collection; Blob adapter is wired via the plugin
    mimeTypes: ['image/*'],
    // generate smaller renditions automatically (keeps file sizes reasonable)
    imageSizes: [
      { name: 'thumb', width: 320, height: 240, position: 'centre' },
      { name: 'card',  width: 800, height: 600, position: 'centre' },
    ],
    disableLocalStorage: true, // critical on Vercel
    // (do NOT add maxFileSize here—Payload v3 UploadConfig doesn’t have that prop)
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}
