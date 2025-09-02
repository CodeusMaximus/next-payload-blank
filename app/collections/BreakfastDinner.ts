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
        { label: 'Soups', value: 'soups' },
        { label: 'Salads', value: 'salads' },
        { label: 'Pancakes & Waffles', value: 'pancakes-waffles' },
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
        { label: 'Gluten-Free', value: 'gluten-free' },
        { label: 'Dairy-Free', value: 'dairy-free' },
      ],
    },

    // ADD-ONS SECTION
    {
      name: 'addOns',
      type: 'group',
      label: 'Add-Ons & Customizations',
      admin: {
        description: 'Select which add-ons customers can choose from for this item'
      },
      fields: [
        // PROTEINS
        {
          name: 'proteins',
          type: 'array',
          label: 'Extra Proteins',
          admin: {
            description: 'Additional proteins customers can add'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', required: true },
          ],
          defaultValue: [],
        },

        // CHEESE OPTIONS
        {
          name: 'cheeses',
          type: 'array',
          label: 'Cheese Options',
          admin: {
            description: 'Different cheese types customers can select'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'isDefault', type: 'checkbox', defaultValue: false },
          ],
          defaultValue: [],
        },

        // SAUCES & CONDIMENTS
        {
          name: 'sauces',
          type: 'array',
          label: 'Sauces & Condiments',
          admin: {
            description: 'Sauces, dressings, and condiments'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'isSpicy', type: 'checkbox', defaultValue: false },
          ],
          defaultValue: [
            { name: 'Mayonnaise', price: 0 },
            { name: 'Ketchup', price: 0 },
            { name: 'Mustard', price: 0 },
            { name: 'Dijon Mustard', price: 0 },
            { name: 'Honey Mustard', price: 0 },
            { name: 'Hot Sauce', price: 0, isSpicy: true },
            { name: 'Sriracha', price: 0, isSpicy: true },
            { name: 'Chipotle Mayo', price: 0.50, isSpicy: true },
            { name: 'BBQ Sauce', price: 0 },
            { name: 'Ranch Dressing', price: 0 },
            { name: 'Blue Cheese', price: 0 },
            { name: 'Caesar Dressing', price: 0 },
            { name: 'Italian Dressing', price: 0 },
            { name: 'Balsamic Vinaigrette', price: 0 },
            { name: 'Oil & Vinegar', price: 0 },
            { name: 'Buffalo Sauce', price: 0, isSpicy: true },
            { name: 'Teriyaki Sauce', price: 0 },
            { name: 'Thousand Island', price: 0 },
            { name: 'Tartar Sauce', price: 0 },
            { name: 'Cocktail Sauce', price: 0 },
            { name: 'Hollandaise', price: 1.00 },
            { name: 'Gravy', price: 0.50 },
            { name: 'Salsa', price: 0 },
            { name: 'Guacamole', price: 1.50 },
            { name: 'Sour Cream', price: 0.50 },
            { name: 'Pesto', price: 1.00 },
            { name: 'Aioli', price: 0.75 },
            { name: 'Horseradish', price: 0 },
          ],
        },

        // VEGETABLES & TOPPINGS
        {
          name: 'vegetables',
          type: 'array',
          label: 'Vegetables & Toppings',
          admin: {
            description: 'Fresh vegetables, herbs, and toppings'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'category', type: 'select', options: [
              { label: 'Fresh Vegetables', value: 'fresh' },
              { label: 'Grilled/Cooked', value: 'cooked' },
              { label: 'Pickled', value: 'pickled' },
              { label: 'Herbs', value: 'herbs' },
            ]},
          ],
          defaultValue: [
            { name: 'Lettuce', price: 0, category: 'fresh' },
            { name: 'Tomato', price: 0, category: 'fresh' },
            { name: 'Onion', price: 0, category: 'fresh' },
            { name: 'Red Onion', price: 0, category: 'fresh' },
            { name: 'Avocado', price: 1.50, category: 'fresh' },
            { name: 'Cucumber', price: 0, category: 'fresh' },
            { name: 'Spinach', price: 0, category: 'fresh' },
            { name: 'Arugula', price: 0.50, category: 'fresh' },
            { name: 'Sprouts', price: 0, category: 'fresh' },
            { name: 'Bell Peppers', price: 0, category: 'fresh' },
            { name: 'Jalapeños', price: 0, category: 'fresh' },
            { name: 'Grilled Onions', price: 0.50, category: 'cooked' },
            { name: 'Grilled Mushrooms', price: 0.75, category: 'cooked' },
            { name: 'Roasted Red Peppers', price: 0.75, category: 'cooked' },
            { name: 'Pickles', price: 0, category: 'pickled' },
            { name: 'Pickled Jalapeños', price: 0, category: 'pickled' },
            { name: 'Pickled Onions', price: 0.25, category: 'pickled' },
            { name: 'Sauerkraut', price: 0, category: 'pickled' },
            { name: 'Fresh Basil', price: 0.25, category: 'herbs' },
            { name: 'Cilantro', price: 0, category: 'herbs' },
            { name: 'Parsley', price: 0, category: 'herbs' },
          ],
        },

        // BREAD & BASE OPTIONS
        {
          name: 'breadOptions',
          type: 'array',
          label: 'Bread & Base Options',
          admin: {
            description: 'Different bread types, buns, or base options'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'isDefault', type: 'checkbox', defaultValue: false },
          ],
          defaultValue: [
            // Regular Breads
            { name: 'White Bread', price: 0, isDefault: true },
            { name: 'Wheat Bread', price: 0 },
            { name: 'Sourdough', price: 0.50 },
            { name: 'Rye Bread', price: 0.50 },
            { name: 'Pumpernickel', price: 0.50 },
            { name: 'Multi-Grain', price: 0.75 },
            { name: 'Gluten-Free Bread', price: 1.50 },
            
            // Rolls & Buns
            { name: 'Kaiser Roll', price: 0 },
            { name: 'Brioche Bun', price: 1.00 },
            { name: 'Sesame Bun', price: 0 },
            { name: 'Pretzel Bun', price: 1.25 },
            { name: 'Ciabatta Roll', price: 0.75 },
            { name: 'French Roll', price: 0.50 },
            
            // Heroes & Subs
            { name: 'Hero/Sub Roll', price: 0.75 },
            { name: 'Italian Hero', price: 1.00 },
            { name: 'French Baguette', price: 1.00 },
            
            // Bagels
            { name: 'Plain Bagel', price: 0.50 },
            { name: 'Everything Bagel', price: 0.75 },
            { name: 'Sesame Bagel', price: 0.50 },
            { name: 'Poppy Seed Bagel', price: 0.50 },
            { name: 'Onion Bagel', price: 0.50 },
            { name: 'Garlic Bagel', price: 0.50 },
            { name: 'Salt Bagel', price: 0.50 },
            { name: 'Raisin Bagel', price: 0.75 },
            { name: 'Cinnamon Raisin Bagel', price: 0.75 },
            { name: 'Blueberry Bagel', price: 0.75 },
            { name: 'Whole Wheat Bagel', price: 0.75 },
            { name: 'Asiago Cheese Bagel', price: 1.00 },
            { name: 'Jalapeño Cheddar Bagel', price: 1.00 },
            
            // Wraps & Others
            { name: 'Flour Tortilla', price: 0 },
            { name: 'Spinach Wrap', price: 0.50 },
            { name: 'Tomato Wrap', price: 0.50 },
            { name: 'Whole Wheat Wrap', price: 0.25 },
            { name: 'English Muffin', price: 0 },
            { name: 'Croissant', price: 1.50 },
            { name: 'Pita Bread', price: 0.50 },
            { name: 'Naan', price: 1.00 },
          ],
        },

        // SIDES & EXTRAS
        {
          name: 'sides',
          type: 'array',
          label: 'Side Items & Extras',
          admin: {
            description: 'Side dishes, extras, and add-on items'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', required: true },
            { name: 'category', type: 'select', options: [
              { label: 'Sides', value: 'sides' },
              { label: 'Breakfast Extras', value: 'breakfast-extras' },
              { label: 'Appetizers', value: 'appetizers' },
            ]},
          ],
          defaultValue: [],
        },

        // COOKING PREFERENCES
        {
          name: 'cookingOptions',
          type: 'array',
          label: 'Cooking Preferences',
          admin: {
            description: 'How items should be prepared (e.g., egg doneness, meat temperature)'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'category', type: 'select', options: [
              { label: 'Egg Preparation', value: 'eggs' },
              { label: 'Meat Temperature', value: 'meat' },
              { label: 'Toast Level', value: 'toast' },
              { label: 'Spice Level', value: 'spice' },
            ]},
          ],
          defaultValue: [],
        },

        // BEVERAGES
        {
          name: 'beverages',
          type: 'array',
          label: 'Beverage Add-ons',
          admin: {
            description: 'Drinks that can be added to the order'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', required: true },
            { name: 'size', type: 'select', options: [
              { label: 'Small', value: 'small' },
              { label: 'Medium', value: 'medium' },
              { label: 'Large', value: 'large' },
            ]},
            { name: 'category', type: 'select', options: [
              { label: 'Coffee', value: 'coffee' },
              { label: 'Tea', value: 'tea' },
              { label: 'Juice', value: 'juice' },
              { label: 'Soda', value: 'soda' },
              { label: 'Other', value: 'other' },
            ]},
          ],
          defaultValue: [],
        },

        // SPECIAL DIETARY
        {
          name: 'dietaryOptions',
          type: 'array',
          label: 'Special Dietary Options',
          admin: {
            description: 'Substitutions for dietary restrictions'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'price', type: 'number', defaultValue: 0 },
            { name: 'type', type: 'select', options: [
              { label: 'Gluten-Free Substitute', value: 'gluten-free' },
              { label: 'Dairy-Free Substitute', value: 'dairy-free' },
              { label: 'Vegan Option', value: 'vegan' },
              { label: 'Low-Carb Option', value: 'low-carb' },
            ]},
          ],
          defaultValue: [],
        },

        // PORTION SIZES
        {
          name: 'portionSizes',
          type: 'array',
          label: 'Portion Size Options',
          admin: {
            description: 'Different portion sizes available'
          },
          fields: [
            { name: 'name', type: 'text', required: true },
            { name: 'priceAdjustment', type: 'number', defaultValue: 0 },
            { name: 'isDefault', type: 'checkbox', defaultValue: false },
          ],
          defaultValue: [],
        },
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