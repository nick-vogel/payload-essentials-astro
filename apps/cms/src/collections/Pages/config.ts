import { type CollectionConfig, slugField } from 'payload'
import { SEOField } from '@/fields/seo/config'
import { deletePage, updatePage } from './hooks/revalidatePage'

export const Pages: CollectionConfig = {
  slug: 'pages',
  defaultPopulate: {
    slug: true,
    title: true,
  },
  admin: {
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [updatePage],
    afterDelete: [deletePage],
  },
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    slugField(),
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Information',
          fields: [
            {
              type: 'text',
              name: 'title',
              required: true,
            },
            {
              type: 'upload',
              name: 'featuredImage',
              relationTo: 'media',
              required: true,
            },
          ],
        },
        {
          label: 'Layout',
          fields: [
            {
              name: 'blocks',
              type: 'blocks',
              blockReferences: [
                'hero',
                'textAndImage',
                'cards',
                'text',
              ],
              blocks: [],
            },
          ],
        },
        {
          label: 'SEO',
          fields: [SEOField],
        },
      ],
    },
  ],
}
