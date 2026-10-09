import type {Field} from 'payload'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField
} from '@payloadcms/plugin-seo/fields'
import { generateCanonical } from './hooks/generateCanonical'

export const SEOField: Field = {
  type: 'group',
  name: 'meta',
  fields: [
    MetaTitleField({
      hasGenerateFn: true,
    }),
    MetaDescriptionField({
      hasGenerateFn: true,
    }),
    MetaImageField({
      relationTo: 'media',
      hasGenerateFn: true,
    }),
    PreviewField({
      hasGenerateFn: true,
    }),
    OverviewField({
      titlePath: 'meta.title',
      descriptionPath: 'meta.description',
      imagePath: 'meta.image',
    }),
    {
      type: 'text',
      name: 'canonicalUrl',
      label: 'Canonical URL',
      hooks: {
        beforeChange: [generateCanonical]
      }
    },
    {
      type: 'checkbox',
      name: 'addToSitemap',
      defaultValue: true,
      admin: {
        description: 'Add this page to the sitemap.'
      }
    }
  ]
}