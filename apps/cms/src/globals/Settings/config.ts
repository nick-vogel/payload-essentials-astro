import { type GlobalConfig } from 'payload'
import { revalidateGlobal } from '@/globals/hooks/revalidateGlobal'

export const Settings: GlobalConfig = {
  slug: 'settings',
  hooks: {
    afterChange: [revalidateGlobal],
  },
  fields: [
    {
      type: 'text',
      name: 'gtmCode',
      label: 'Google Tag Manager',
      admin: {
        description: 'Add your Google Tag Manager Code (GTM-XXXXXX)',
      },
    },
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Payload Essentials',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue:
        'Learn everything you need to get started with Payload.',
    },
    {
      name: 'iconColor',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'iconWhite',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoColor',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'logoWhite',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
