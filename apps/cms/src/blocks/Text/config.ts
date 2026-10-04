import type {Block} from 'payload'

export const Text: Block = {
  slug: 'text',
  interfaceName: 'TextBlockProps',
  admin: {
    images: {
      thumbnail: 'https://pub-f0b74d2447864df79c5a9ab97d288865.r2.dev/text-block-480x320.webp',
    },
  },
  fields: [
    {
      name: 'header',
      type: 'text',
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
    {
      name: 'backgroundColor',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
      defaultValue: 'primary',
    },
  ],
}