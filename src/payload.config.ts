import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import {s3Storage} from '@payloadcms/storage-s3'
import {getServerSideURL} from '@/utilities/getUrl'

import { Users } from './collections/Users/config'
import { Media } from './collections/Media/config'
import { Pages } from '@/collections/Pages/config'
import { Posts } from '@/collections/Posts/config'
import { Settings } from '@/globals/Settings/config'
import { Navigation } from '@/globals/Navigation/config'
import { Categories } from '@/collections/Categories/config'
import { Hero } from '@/blocks/Hero/config'
import { TextAndImage } from '@/blocks/TextAndImage/config'
import { Cards } from '@/blocks/Cards/config'
import { Text } from '@/blocks/Text/config'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { resendAdapter } from '@payloadcms/email-resend'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Icon: '@/custom/Components/Admin/Icon.tsx',
        Logo: '@/custom/Components/Admin/Logo.tsx'
      }
    },
    meta: {
      titleSuffix: ' - Payload Essentials Course',
      description: 'This is the CMS of the Payload Essentials Course by Nick Vogel',
      openGraph: {
        description: 'This is the CMS of the Payload Essentials Course by Nick Vogel',
        images: [
          {
            url: '/default-og.png',
          },
        ],
        siteName: 'Payload Essentials by Nick Vogel'
      },
      icons: [
        {
          url: '/pe-icon.png',
          type: 'image/png',
          sizes: '64x64',
        },
        {
          url: '/pe-icon-reverse.png',
          type: 'image/png',
          sizes: '64x64',
          media: '(prefers-color-scheme: dark)',
        },
      ],
    },
  },
  email: resendAdapter({
    apiKey: process.env.RESEND_API_KEY!,
    defaultFromAddress: 'nick@messages.nlvogel.com',
    defaultFromName: 'Payload Essentials Course',
  }),
  collections: [Users, Media, Pages, Posts, Categories],
  globals: [Navigation, Settings],
  blocks: [Hero, TextAndImage, Cards, Text],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    idType: 'uuid',
  }),
  sharp,
  plugins: [
    seoPlugin({
      generateTitle: ({ doc }) => doc.title,
      generateDescription: ({ doc, collectionSlug }) => {
        if (collectionSlug === 'posts') return doc?.summary
        if (collectionSlug === 'pages') return doc?.title
        return 'Payload Essentials Course by Nick Vogel'
      },
      generateURL: ({ doc, collectionSlug }) => {
        const isHome = doc.slug === 'home'
        return `${getServerSideURL()}${collectionSlug === 'pages' ? '' : `/${collectionSlug}`}/${isHome ? '' : doc.slug}`
      },
      generateImage: ({ doc }) => doc.featuredImage,
    }),
    s3Storage({
      collections: {
        media: {
          generateFileURL: ({ filename }) =>
            `https://pub-f0b74d2447864df79c5a9ab97d288865.r2.dev/${filename}`,
        },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        endpoint: process.env.S3_API,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
        region: 'auto',
      },
    }),
  ],
})
