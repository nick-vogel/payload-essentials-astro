import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  defaultPopulate: {
    name: true,
    email: true,
  },
  admin: {
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      type: 'text',
      name: 'name',
      required: true,
    }
  ],
}
