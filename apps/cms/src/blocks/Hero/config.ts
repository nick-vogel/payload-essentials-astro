import type {Block} from 'payload'

export const Hero: Block = {
  slug: 'hero',
  interfaceName: 'HeroBlockProps',
  admin: {
    images: {
      thumbnail: 'https://pub-f0b74d2447864df79c5a9ab97d288865.r2.dev/hero-block-480x320.webp'
    }
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'primaryCTA',
          label: 'Primary CTA',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            width: '50%',
          },
        },
        {
          name: 'secondaryCTA',
          label: 'Secondary CTA',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'showHeroImage',
      defaultValue: false,
    },
    {
      type: 'upload',
      name: 'heroImage',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData.showHeroImage,
      },
    },
  ],
}