import path from 'path'
import type { CollectionConfig } from 'payload'
import { changeFilename } from './hooks/changeFilename'
import { generateBlurData } from '@/collections/Media/hooks/generateBlurData'

export const Media: CollectionConfig = {
  slug: 'media',
  defaultPopulate: {
    url: true,
    filename: true,
    width: true,
    height: true,
    alt: true,
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeOperation: [
      changeFilename
    ],
    beforeChange: [
      generateBlurData
    ]
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'blurDataUrl',
      type: 'text',
      label: 'Blur Data URL',
      admin: {
        description: 'Placeholder blurred image. Automatically generated.',
        readOnly: true,
      }
    }
  ],
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*'],
    formatOptions: {
      format: 'webp'
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: 180,
        formatOptions: {
          format: 'webp',
        },
        admin: {
          disableListFilter: true,
          disableGroupBy: true,
          disableListColumn: true,
        }
      },
      {
        name: 'card',
        width: 640,
        height: 360,
        formatOptions: {
          format: 'webp',
        },
        admin: {
          disableListFilter: true,
          disableGroupBy: true,
          disableListColumn: true,
        }
      },
      {
        name: 'fullSize',
        width: 1280,
        height: 720,
        formatOptions: {
          format: 'webp',
        },
        admin: {
          disableListFilter: true,
          disableGroupBy: true,
          disableListColumn: true,
        }
      },
      {
        name: 'og',
        width: 1920,
        height: 1080,
        formatOptions: {
          format: 'png',
          options: {
            quality: 80,
          }
        },
        admin: {
          disableListFilter: true,
          disableGroupBy: true,
          disableListColumn: true,
        }
      }
    ],
    adminThumbnail: 'thumbnail',
  },
}
