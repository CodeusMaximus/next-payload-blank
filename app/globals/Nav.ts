import type { GlobalConfig } from 'payload'

type AutoChildrenFrom = 'none' | 'products' | 'deli' | 'breakfastandlunch'

/** Product category keys (match your CategoryScroller + Products collection) */
const PRODUCT_CATEGORY_KEYS = [
  'milk', 'drinks', 'frozen', 'deli', 'produce', 'meat', 'bakery',
  'alcohol', 'salads', 'soups', 'seafood', 'pizza', 'baby', 'candy',
  'bread', 'household', 'personal', 'coffee', 'hot-food', 'cold-food',
  'vegetables', 'dairy', 'breakfast', 'snacks', 'flowers', 'pet',
  'pharmacy', 'desserts', 'health', 'fruits', 'cheese', 'sandwiches',
  'energy', 'organic',
] as const

/** Deli categories (match your Deli collection) */
const DELI_CATEGORY_KEYS = [
  'sandwiches', 'wraps', 'salads', 'cold-cuts', 'cheese', 'sides', 'other',
] as const

/** Breakfast/Lunch categories */
const BL_CATEGORY_KEYS = [
  'breakfast', 'sandwiches', 'wraps', 'salads', 'hot-food', 'cold-food', 'sides', 'drinks',
] as const

function toLabel(slug: string) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Compute the app route for a given target/categoryKey */
function routeFor(target: 'products' | 'deli' | 'breakfastandlunch', key: string) {
  if (target === 'products') return `/category/${encodeURIComponent(key)}`
  if (target === 'deli') return `/deli?cat=${encodeURIComponent(key)}`
  return `/breakfastandlunch?cat=${encodeURIComponent(key)}`
}

/** Build submenu children according to the selected auto source (now with href precomputed) */
function buildChildren(source: AutoChildrenFrom) {
  if (source === 'products') {
    return PRODUCT_CATEGORY_KEYS.map(key => ({
      label: toLabel(key),
      target: 'products' as const,
      categoryKey: key,
      href: routeFor('products', key),           // precompute URL
      openInNewTab: false,
    }))
  }
  if (source === 'deli') {
    return DELI_CATEGORY_KEYS.map(key => ({
      label: toLabel(key),
      target: 'deli' as const,
      categoryKey: key,
      href: routeFor('deli', key),
      openInNewTab: false,
    }))
  }
  if (source === 'breakfastandlunch') {
    return BL_CATEGORY_KEYS.map(key => ({
      label: toLabel(key),
      target: 'breakfastandlunch' as const,
      categoryKey: key,
      href: routeFor('breakfastandlunch', key),
      openInNewTab: false,
    }))
  }
  return []
}

const Nav: GlobalConfig = {
  slug: 'nav',
  label: 'Navigation',
  access: { read: () => true },

  fields: [
    {
      name: 'logo',
      label: 'Logo',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },

    {
      name: 'links',
      type: 'array',
      label: 'Navigation Links',
      labels: { singular: 'Link', plural: 'Links' },
      fields: [
        { name: 'label', type: 'text', required: true },

        {
          name: 'href',
          type: 'text',
          admin: {
            description:
              'Optional. If empty and children exist, this item becomes a dropdown.',
          },
        },

        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },

        /**
         * Auto-populate submenu children from a known source.
         * If set, we generate the full list (with hrefs) on save.
         */
        {
          name: 'autoChildrenFrom',
          type: 'select',
          label: 'Auto-populate children from',
          defaultValue: 'none',
          options: [
            { label: 'None (manual)', value: 'none' },
            { label: 'Products (all categories)', value: 'products' },
            { label: 'Deli (all categories)', value: 'deli' },
            { label: 'Breakfast/Lunch (all categories)', value: 'breakfastandlunch' },
          ],
        },

        // Manual children (only used when autoChildrenFrom = none)
        {
          name: 'children',
          label: 'Sub Links',
          type: 'array',
          admin: {
            description:
              'Add manual submenu links. If you set a URL, that exact URL will be used and overrides target/category.',
            condition: (data) => (data?.autoChildrenFrom ?? 'none') === 'none',
          },
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'href',
              type: 'text',
              admin: {
                description:
                  'Optional. If set, this URL is used directly (overrides target & category).',
              },
            },
            {
              name: 'target',
              type: 'select',
              defaultValue: 'custom',
              options: [
                { label: 'Custom (use URL above)', value: 'custom' },
                { label: 'Products Category', value: 'products' },
                { label: 'Deli Category', value: 'deli' },
                { label: 'Breakfast/Lunch Category', value: 'breakfastandlunch' },
              ],
            },
            {
              name: 'categoryKey',
              type: 'text',
              admin: {
                description:
                  'Used when target ≠ Custom. Example keys:\n' +
                  '• Products: ' + PRODUCT_CATEGORY_KEYS.join(', ') + '\n' +
                  '• Deli: ' + DELI_CATEGORY_KEYS.join(', ') + '\n' +
                  '• Breakfast/Lunch: ' + BL_CATEGORY_KEYS.join(', '),
              },
            },
            { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],

  hooks: {
    /** When saving the Nav, normalize links and auto-generate children if requested. */
    beforeValidate: [
      ({ data }) => {
        if (!data?.links) return data

        data.links = data.links.map((link: any) => {
          const source = (link?.autoChildrenFrom ?? 'none') as AutoChildrenFrom

          // If auto source chosen, regenerate children with precomputed hrefs
          if (source !== 'none') {
            return {
              ...link,
              href: link.href || '', // keep parent clickable only if provided
              children: buildChildren(source),
            }
          }

          // Manual children: if a child has href, force custom; else derive href from target/category
          if (Array.isArray(link.children)) {
            link.children = link.children.map((child: any) => {
              const hasHref = typeof child?.href === 'string' && child.href.trim().length > 0
              if (hasHref) {
                return {
                  ...child,
                  target: 'custom',     // ensure front-end treats it as direct URL
                  categoryKey: undefined,
                }
              }
              // No href → try to compute from target/categoryKey (if provided)
              if (child?.target && child?.categoryKey) {
                return {
                  ...child,
                  href: routeFor(child.target, child.categoryKey),
                }
              }
              return child
            })
          }

          return link
        })

        return data
      },
    ],
  },
}

export default Nav
