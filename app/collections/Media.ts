// app/collections/Media.ts
import type { CollectionConfig } from 'payload'

const BYTES_1_MB = 1024 * 1024
const MAX_BYTES_WITH_BLOB = 15 * BYTES_1_MB   // when using Vercel Blob
const MAX_BYTES_NO_BLOB   = 3 * BYTES_1_MB    // keep under serverless body limit

export const Media: CollectionConfig = {
  slug: 'media', // must match the storage adapter config
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 320, height: 240, position: 'centre' },
      { name: 'card',  width: 800, height: 600, position: 'centre' },
    ],
    adminThumbnail: 'thumb',
  },
  hooks: {
    // Validate file size before Payload processes/saves it
    beforeValidate: [
      ({ req }) => {
        const maxBytes = process.env.BLOB_READ_WRITE_TOKEN
          ? MAX_BYTES_WITH_BLOB
          : MAX_BYTES_NO_BLOB

        // Payload attaches the uploaded file on req.file (or sometimes req.files.file[0])
        const anyReq = req as any
        const file =
          anyReq?.file ||
          anyReq?.files?.file?.[0] ||
          anyReq?.files?.[0] ||
          null

        const size = file?.size as number | undefined
        if (typeof size === 'number' && size > maxBytes) {
          const mb = (size / BYTES_1_MB).toFixed(2)
          const limitMb = (maxBytes / BYTES_1_MB).toFixed(0)
          throw new Error(`Image is ${mb}MB. Max allowed is ${limitMb}MB.`)
        }
      },
    ],
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'updatedAt'],
  },
  fields: [
    { name: 'alt', type: 'text' },
  ],
}

export default Media
