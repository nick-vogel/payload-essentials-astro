import { type CollectionConfig, slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      type: 'text',
      name: 'name',
    },
    slugField({
      useAsSlug: 'name',
    }),
    {
      type: 'join',
      collection: 'posts',
      on: 'category',
      name: 'relatedPosts'
    }
  ]
}