import { type CollectionConfig, slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    // The Astro site reads categories without a user, for the post cards and the blog filter.
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
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