// app/globals/Footer.ts
import { GlobalConfig } from 'payload'

const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  access: {
    read: () => true, // Allow public read access
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      label: 'Footer Text',
      required: false,
      admin: {
        placeholder: 'Enter footer description or copyright text...',
      },
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright Text',
      required: false,
      admin: {
        placeholder: '© 2024 Your Company Name. All rights reserved.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Social Media Links',
      fields: [
        {
          name: 'platform',
          type: 'select',
          label: 'Platform',
          required: true,
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'Twitter/X', value: 'twitter' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'LinkedIn', value: 'linkedin' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'TikTok', value: 'tiktok' },
            { label: 'GitHub', value: 'github' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          name: 'customPlatform',
          type: 'text',
          label: 'Custom Platform Name',
          admin: {
            condition: (data, siblingData) => siblingData?.platform === 'other',
            description: 'Enter platform name when "Other" is selected',
          },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.trim() === '') {
              return 'URL is required'
            }
            try {
              new URL(value)
              return true
            } catch {
              return 'Please enter a valid URL (e.g., https://example.com)'
            }
          },
        },
        {
          name: 'icon',
          type: 'upload',
          label: 'Custom Icon (Optional)',
          relationTo: 'media',
          required: false,
          admin: {
            description: 'Upload a custom icon for this social link',
          },
        },
      ],
    },
    {
      name: 'quickLinks',
      type: 'array',
      label: 'Quick Links',
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Link Label',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          label: 'URL',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value || value.trim() === '') {
              return 'URL is required'
            }
            // Allow relative URLs starting with / or full URLs
            if (value.startsWith('/') || value.startsWith('http')) {
              return true
            }
            return 'Please enter a valid URL (e.g., /about or https://example.com)'
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
          label: 'Open in New Tab',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'contactInfo',
      type: 'group',
      label: 'Contact Information',
      fields: [
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          validate: (value: string | null | undefined) => {
            if (!value) return true // Optional field
            // Basic phone validation - adjust regex as needed
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
            if (phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
              return true
            }
            return 'Please enter a valid phone number'
          },
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Address',
          admin: {
            rows: 3,
          },
        },
      ],
    },
  ],
}

export default Footer