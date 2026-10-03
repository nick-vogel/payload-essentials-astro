import { getPayload, PaginatedDocs } from 'payload'
import React from 'react'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { isDoc } from '@/utilities/isDoc'
import type { Post } from '@/payload-types'
import { Card } from '@/components/Card'
import { CardContainer } from '@/components/CardContainer'
import { RichText } from '@/components/RichText'
import classes from './page.module.css'
import { Section } from '@/components/Section'
import { Container } from '@/components/Container'
import { Header } from '@/components/Header'
import { PostPreview } from '@/components/PostPreview'
import { PostNavigation } from '@/components/PostNavigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Metadata } from 'next'
import { generateArticleMeta } from '@/utilities/generateArticleMeta'
import { unstable_cache } from 'next/cache'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getRelationID } from '@/utilities/getRelationID'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { docs } = await payload.find({
    collection: 'posts',
    limit: 0,
  })
  return docs.map((doc) => ({ slug: doc.slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayloadClient()
  const post = await payload
    .find({
      collection: 'posts',
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
  if (!post) {
    return { title: 'Post not found' }
  }
  const settings = await getCachedGlobal('settings')()
  return generateArticleMeta({ post, settings })
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const post = await queryPost({ slug })
  const [relatedPosts, nextPost, prevPost] = await Promise.all([
    queryRelatedPosts({ post }),
    queryNextPost({ post }),
    queryPreviousPost({ post }),
  ])

  if (!post) return notFound()

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ]

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <Section>
        <Container>
          <Header as={'h1'} align={'left'}>
            {post.title}
          </Header>
          {isDoc<Post>(post) && (
            <PostPreview
              post={post}
              variant={'header'}
              showLink={false}
              imageSize={'fullSize'}
            />
          )}
        </Container>
      </Section>
      <main>
        <article className={classes.article}>
          <RichText data={post.body} />
        </article>
      </main>
      <PostNavigation nextPost={nextPost} prevPost={prevPost} />
      <Section>
        <Container>
          <Header>Related Posts</Header>
          <CardContainer variant={'compact'}>
            {relatedPosts.docs.map((post) => (
              <Card {...post} key={post.id} />
            ))}
          </CardContainer>
        </Container>
      </Section>
    </>
  )
}

const queryPost = unstable_cache(
  async ({ slug }) => {
    const payload = await getPayloadClient()
    const post = await payload.find({
      collection: 'posts',
      limit: 1,
      where: {
        slug: {
          equals: slug,
        },
      },
      populate: {
        categories: {
          name: true,
        },
        media: {
          sizes: {
            fullSize: true,
          },
          height: true,
          width: true,
          blurDataUrl: true,
          url: true,
          filename: true,
        },
      },
      select: {
        updatedAt: false,
        generateSlug: false,
      },
    })
    return post.docs?.[0] || null
  },
  [],
  {
    tags: ['blog'],
  },
) as ({ slug }: { slug: string }) => Promise<Post | null>

const queryRelatedPosts = unstable_cache(
  async ({ post }: { post: Pick<Post, 'slug' | 'category'> }) => {
    const payload = await getPayloadClient()
    return await payload.find({
      collection: 'posts',
      limit: 4,
      where: {
        slug: {
          not_equals: post.slug,
        },
        category: {
          equals: getRelationID(post.category),
        },
      },
      populate: {
        categories: {
          name: true,
        },
        media: {
          sizes: {
            card: true,
          },
          height: true,
          width: true,
          blurDataUrl: true,
          url: true,
          filename: true,
        },
      },
      select: {
        createdAt: false,
        updated: false,
        generateSlug: false,
      },
      sort: '-date',
    })
  },
  [],
  {
    tags: ['blog'],
  },
) as ({
  post,
}: {
  post: Pick<Post, 'slug' | 'category'>
}) => Promise<PaginatedDocs<Post>>

const queryPreviousPost = unstable_cache(
  async ({
    post,
  }: {
    post: Pick<Post, 'slug' | 'category' | 'date' | 'createdAt'>
  }) => {
    const payload = await getPayloadClient()
    const prevPost = await payload.find({
      collection: 'posts',
      limit: 1,
      where: {
        slug: {
          not_equals: post.slug,
        },
        or: [
          {
            date: {
              less_than: post.date,
            },
          },
          {
            and: [
              {
                date: {
                  equals: post.date,
                },
              },
              {
                createdAt: {
                  less_than: post.createdAt,
                },
              },
            ],
          },
        ],
      },
      sort: ['-date', '-createdAt'],
      select: {
        slug: true,
        title: true,
      },
    })
    return prevPost.docs?.[0] || null
  },
  [],
  { tags: ['blog'] },
) as ({
  post,
}: {
  post: Pick<Post, 'slug' | 'category' | 'date' | 'createdAt'>
}) => Promise<Post | null>

const queryNextPost = unstable_cache(
  async ({
    post,
  }: {
    post: Pick<Post, 'slug' | 'category' | 'date' | 'createdAt'>
  }) => {
    const payload = await getPayloadClient()
    const nextPost = await payload.find({
      collection: 'posts',
      limit: 1,
      where: {
        slug: {
          not_equals: post.slug,
        },
        or: [
          {
            date: {
              greater_than: post.date,
            },
          },
          {
            and: [
              {
                date: {
                  equals: post.date,
                },
              },
              {
                createdAt: {
                  greater_than: post.createdAt,
                },
              },
            ],
          },
        ],
      },
      sort: ['date', 'createdAt'],
      select: {
        slug: true,
        title: true,
      },
    })
    return nextPost.docs?.[0] || null
  },
  [],
  { tags: ['blog'] },
) as ({
  post,
}: {
  post: Pick<Post, 'slug' | 'category' | 'date' | 'createdAt'>
}) => Promise<Post | null>
