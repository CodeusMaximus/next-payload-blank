import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media', // MUST be 'media' to match the Blob adapter config
  upload: {
    mimeTypes: ['image/*'], // tell Payload these are images
    imageSizes: [
      { name: 'thumb', width: 320, height: 240, position: 'centre' },
      { name: 'card',  width: 800, height: 600, position: 'centre' },
      // add more sizes if you want
    ],
    adminThumbnail: 'thumb', // admin uses this size for previews
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  fields: [
    { name: 'alt', type: 'text' }, // alt text for accessibility
    // any other fields you want on media docs
  ],
}

export default Media
