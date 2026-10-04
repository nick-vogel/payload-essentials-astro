import type {Block} from 'payload'

export const Cards: Block = {
  slug: 'cards',
  interfaceName: 'CardsBlockProps',
  admin: {
    images: {
      thumbnail: 'https://pub-f0b74d2447864df79c5a9ab97d288865.r2.dev/cards-block-480x320.webp'
    }
  },
  fields: [
    {
      name: 'header',
      type: 'text',
    },
    {
      name: 'backgroundColor',
      type: 'select',
      options: [
        {value: 'primary', label: 'Primary'},
        {value: 'secondary', label: 'Secondary'},
      ],
      defaultValue: 'primary',
    },
    {
      name: 'cardsArray',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      admin: {
        components: {
          RowLabel: '@/custom/label/Component.tsx#CardRowLabel'
        }
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'richText',
          required: true,
        }
      ]
    }
  ]
}