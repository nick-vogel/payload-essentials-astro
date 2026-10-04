import type {Block} from 'payload'

export const TextAndImage: Block = {
  slug: 'textAndImage',
  interfaceName: 'TextAndImageBlockProps',
  admin: {
    images: {
      thumbnail: 'https://pub-f0b74d2447864df79c5a9ab97d288865.r2.dev/textandmedia-block-480x320.webp'
    }
  },
  fields: [
    {
      name: 'header',
      type: 'text',
    },
    {
      type: 'select',
      name: 'backgroundColor',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
      ],
      defaultValue: 'primary',
    },
    {
      name: 'layout',
      type: 'radio',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
      ],
      defaultValue: 'right',
    },
    {
      type: 'upload',
      name: 'image',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
    },
  ],
}