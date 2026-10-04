import { getPayload } from 'payload'
import React from 'react'
import config from '@/payload.config'
import { Media } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'
import { notFound } from 'next/navigation'
import { Blocks } from '@/blocks'
import { Metadata } from 'next'
import { generateMeta } from '@/utilities/generateMeta'
import { unstable_cache } from 'next/cache'
import { Page as PageType } from '@/payload-types'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayloadClient } from '@/utilities/getPayloadClient'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs } = await payload.find({
    collection: 'pages',
    where: {
      slug: {
        not_equals: 'blog',
      },
    },
    limit: 0,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug = 'home' } = await params
  const payload = await getPayloadClient()
  const doc = await payload
    .find({
      collection: 'pages',
      limit: 1,
      where: { slug: { equals: slug } },
      populate: {
        media: {
          sizes: {
            og: true,
          },
        },
      },
    })
    .then((res) => res.docs[0])

  if (!doc) return { title: 'Page not found' }
  const settings = await getCachedGlobal('settings')()
  return generateMeta({ doc, settings })
}

export default async function Page({ params }: PageProps) {
  const { slug = 'home' } = await params

  const page = await queryPageBySlug({ slug })

  if (!page) {
    return notFound()
  }

  return (
    <div>
      <Blocks blocks={page.blocks} />
    </div>
  )
}

const queryPageBySlug = unstable_cache(
  async ({ slug }: { slug: string }) => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const page = await payload.find({
      collection: 'pages',
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
      populate: {
        media: {
          filename: true,
          width: true,
          height: true,
          url: true,
          alt: true,
          blurDataUrl: true,
          sizes: {
            fullSize: true,
            card: true,
            og: true,
          },
        },
      },
      select: {
        createdAt: false,
        updatedAt: false,
        generateSlug: false,
      },
    })
    return page.docs?.[0] || null
  },
) as ({ slug }: { slug: string }) => Promise<PageType | null>
