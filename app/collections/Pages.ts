// collections/Pages.ts
import type { CollectionConfig, FieldHook } from 'payload';

const slugify = (input: string) =>
  input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // non-alphanumerics -> dash
    .replace(/^-+|-+$/g, '');        // trim leading/trailing dashes

// Auto-fill/normalize slug before validate
const normalizeSlug: FieldHook = ({ value, data }) => {
  const base = value ?? data?.title ?? '';
  const slug = slugify(base);
  return slug;
};

const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: 'Page', plural: 'Pages' },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
  },

  access: {
    read: () => true, // public pages
  },

  fields: [
    { name: 'title', type: 'text', required: true },

    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [normalizeSlug],
        beforeChange: [normalizeSlug],
      },
      validate: (val: unknown) => {
        const v = String(val ?? '');
        if (!v) return 'Slug is required';
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)) {
          return 'Use lowercase letters, numbers, and dashes only';
        }
        return true;
      },
      admin: {
        description: 'Auto-generated from title; lowercase + dashes.',
      },
    },

    {
      name: 'content',
      type: 'richText', // using Lexical editor is fine
      required: true,
    },

    // Optional: SEO/meta fields here...
  ],
};

export default Pages;
