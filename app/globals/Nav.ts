 // app/globals/Nav.ts
import type { GlobalConfig } from 'payload'

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
        { name: 'href', type: 'text', admin: { description: 'Optional. If empty and children exist, this item becomes a dropdown.' } },
        { name: 'openInNewTab', type: 'checkbox', defaultValue: false },

        // Subnav items
        {
          name: 'children',
          label: 'Sub Links',
          type: 'array',
          admin: { description: 'Add submenu links. Choose a target to auto-build hrefs like the category scroller.' },
          fields: [
            { name: 'label', type: 'text', required: true },
            {
              name: 'target',
              type: 'select',
              required: true,
              defaultValue: 'custom',
              options: [
                { label: 'Custom URL', value: 'custom' },
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
                  '• Products: milk, drinks, frozen, deli, produce, meat, bakery, alcohol, salads, soups, seafood, pizza, baby, candy, bread, household, personal, coffee, hot-food, cold-food, vegetables, dairy, breakfast, snacks, flowers, pet, pharmacy, desserts, health, fruits, cheese, sandwiches, energy, organic\n' +
                  '• Deli: sandwiches, wraps, salads, cold-cuts, cheese, sides, other\n' +
                  '• Breakfast/Lunch: (use the keys you support, e.g. breakfast, lunch, sandwiches, wraps, sides, etc.)',
                condition: (data) => data?.target && data.target !== 'custom',
              },
            },
            {
              name: 'href',
              type: 'text',
              admin: {
                description: 'Only used when target = Custom URL',
                condition: (data) => data?.target === 'custom',
              },
            },
            { name: 'openInNewTab', type: 'checkbox', defaultValue: false },
          ],
        },
      ],
    },
  ],
}

export default Nav
