import { type GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'nav',
  access: {
    // The Astro site reads this global without a user.
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'navItems',
      type: 'array',
      admin: {
        components: {
          RowLabel: {
            path: '@/custom/label/Component.tsx#ArrayRowLabel',
          },
        },
      },
      labels: {
        singular: 'Navigation Link',
        plural: 'Navigation Links',
      },
      fields: [
        {
          name: 'link',
          type: 'relationship',
          relationTo: 'pages',
          required: true,
          admin: {
            appearance: 'drawer',
          },
        },
      ],
    },
  ],
}
