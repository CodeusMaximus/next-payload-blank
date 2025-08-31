// collections/HeroSlides.ts
import type { CollectionConfig } from 'payload';

const HeroSlides: CollectionConfig = {
  slug: 'hero-slides',
  labels: { singular: 'Hero Slide', plural: 'Hero Slides' },
  access: { read: () => true },
  admin: { defaultColumns: ['title', 'mediaType', 'image', 'updatedAt'] },
  fields: [
    { name: 'title', type: 'text' },
    { name: 'subtitle', type: 'text' },

    // NEW: choose image or video
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      defaultValue: 'image',
      options: [
        { label: 'Image', value: 'image' },
        { label: 'Video', value: 'video' },
      ],
    },

    // Image path (kept from your schema)
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data.mediaType === 'image' },
    },

    // Video options (upload OR external URL), optional poster
    {
      name: 'video',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data.mediaType === 'video' },
      filterOptions: { mimeType: { contains: 'video' } },
    },
    {
      name: 'videoUrl',
      type: 'text',
      admin: {
        description: 'Optional external video (MP4/HLS). Overrides uploaded video.',
        condition: (data) => data.mediaType === 'video',
      },
    },
    {
      name: 'poster',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data.mediaType === 'video' },
    },
    // Playback flags
    {
      name: 'autoplay',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: (data) => data.mediaType === 'video' },
    },
    {
      name: 'loop',
      type: 'checkbox',
      defaultValue: true,
      admin: { condition: (data) => data.mediaType === 'video' },
    },
    {
      name: 'muted',
      type: 'checkbox',
      defaultValue: true, // iOS autoplay requires muted
      admin: { condition: (data) => data.mediaType === 'video' },
    },
    {
      name: 'controls',
      type: 'checkbox',
      defaultValue: false,
      admin: { condition: (data) => data.mediaType === 'video' },
    },

    // CTAs (kept from your schema)
    { name: 'ctaLabel', type: 'text' },
    { name: 'ctaLink', type: 'text' },
  ],
};

export default HeroSlides;
