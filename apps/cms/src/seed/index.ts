import { randomBytes } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  buildEditorState,
  type DefaultNodeTypes,
  type SerializedBlockNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedLexicalNode } from '@payloadcms/richtext-lexical/lexical'
import {
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type CollectionSlug,
  type Payload,
  type PayloadRequest,
} from 'payload'
import type { Media, Page, Post } from '@/payload-types'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const cmsRoot = path.resolve(dirname, '../..')

type RichText = Post['body']
type BodyNode = DefaultNodeTypes | SerializedBlockNode

// Lexical nodes with sub-fields need their own unique id.
const nodeID = () => randomBytes(12).toString('hex')

const text = (value: string) =>
  ({ type: 'text', text: value, detail: 0, format: 0, mode: 'normal', style: '', version: 1 }) as const

const paragraph = (...children: BodyNode[]): BodyNode => ({
  type: 'paragraph',
  children,
  direction: 'ltr',
  format: '',
  indent: 0,
  textFormat: 0,
  textStyle: '',
  version: 1,
})

const heading = (value: string): BodyNode => ({
  type: 'heading',
  tag: 'h2',
  children: [text(value)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
})

const internalLink = (relationTo: 'pages' | 'posts', id: string, label: string): BodyNode => ({
  type: 'link',
  id: nodeID(),
  fields: { linkType: 'internal', newTab: false, doc: { relationTo, value: id } },
  children: [text(label)],
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 3,
})

const upload = (media: Media): BodyNode => ({
  type: 'upload',
  id: nodeID(),
  relationTo: 'media',
  value: media.id,
  fields: {},
  format: '',
  version: 3,
})

const block = (fields: { blockType: string } & Record<string, string | RichText | object[]>): BodyNode => ({
  type: 'block',
  fields: { id: nodeID(), blockName: '', ...fields },
  format: '',
  version: 2,
})

const richText = (...nodes: BodyNode[]): RichText => buildEditorState<SerializedLexicalNode>({ nodes })
const plainText = (value: string): RichText => buildEditorState<SerializedLexicalNode>({ text: value })

const images = {
  meadow: { file: 'images/1080.webp', alt: 'Tall grass in a meadow, backlit by a low golden sun' },
  desk: {
    file: 'images/320.webp',
    alt: 'A wooden desk laid out with a vintage camera, letterpress type and a Back to School pennant',
  },
  mountain: { file: 'images/360-picsum-photos.webp', alt: 'A forested mountain ridge wrapped in low cloud' },
  logoColor: { file: 'public/pe-icon.png', alt: 'Payload Essentials logo' },
  logoWhite: { file: 'public/pe-icon-reverse.png', alt: 'Payload Essentials logo, reversed' },
}

const categories = [
  { name: 'Guides', slug: 'guides' },
  { name: 'Releases', slug: 'releases' },
  { name: 'Community', slug: 'community' },
] as const

type CategorySlug = (typeof categories)[number]['slug']

const posts: { title: string; slug: string; summary: string; category: CategorySlug }[] = [
  {
    title: 'Model your content with collections',
    slug: 'model-your-content-with-collections',
    summary: 'Collections are the backbone of a Payload project. Here is how to plan them.',
    category: 'guides',
  },
  {
    title: 'Reuse layouts with blocks',
    slug: 'reuse-layouts-with-blocks',
    summary: 'Blocks let editors build pages from parts you design once.',
    category: 'guides',
  },
  {
    title: 'Lock down data with access control',
    slug: 'lock-down-data-with-access-control',
    summary: 'Access functions decide who can read and change each document.',
    category: 'guides',
  },
  {
    title: 'Run side effects with hooks',
    slug: 'run-side-effects-with-hooks',
    summary: 'Hooks run your code at each step of a document lifecycle.',
    category: 'guides',
  },
  {
    title: 'Image sizes for every screen',
    slug: 'image-sizes-for-every-screen',
    summary: 'Each upload now comes with thumbnail, card, full size and social sharing versions.',
    category: 'releases',
  },
  {
    title: 'Blur placeholders while images load',
    slug: 'blur-placeholders-while-images-load',
    summary: 'Every image gets a tiny blurred preview so pages never jump while they load.',
    category: 'releases',
  },
  {
    title: 'Canonical URLs out of the box',
    slug: 'canonical-urls-out-of-the-box',
    summary: 'Pages and posts now fill in their own canonical URL when you save them.',
    category: 'releases',
  },
  {
    title: 'A sitemap you can control',
    slug: 'a-sitemap-you-can-control',
    summary: 'Pick which pages and posts appear in the sitemap with one checkbox.',
    category: 'releases',
  },
  {
    title: 'Questions from the first cohort',
    slug: 'questions-from-the-first-cohort',
    summary: 'The most common questions from the first group of students, with answers.',
    category: 'community',
  },
  {
    title: 'Projects built by students',
    slug: 'projects-built-by-students',
    summary: 'A tour of sites that students shipped after finishing the course.',
    category: 'community',
  },
  {
    title: 'How to ask for help',
    slug: 'how-to-ask-for-help',
    summary: 'Get a faster answer by sharing the right details up front.',
    category: 'community',
  },
  {
    title: 'Office hours recap',
    slug: 'office-hours-recap',
    summary: 'Notes from the latest live session, from schema design to deployment.',
    category: 'community',
  },
]

// The collections a fresh database leaves empty. The seed refuses to run if any has documents.
const seededCollections: CollectionSlug[] = ['users', 'media', 'categories', 'pages', 'posts']

export type SeedArgs = {
  payload: Payload
  // The first user, so a new site has a login and an author for the posts.
  admin: { email: string; password: string }
}

export async function seed({ payload, admin }: SeedArgs): Promise<void> {
  // The context stops the revalidate hooks, which need a Next.js request.
  const req = await createLocalReq({ context: { disableRevalidate: true } }, payload)

  for (const collection of seededCollections) {
    const { totalDocs } = await payload.count({ collection, req })
    if (totalDocs > 0) {
      throw new Error(
        `The database is not empty: ${collection} has ${totalDocs} documents. Run the seed on a fresh, migrated database.`,
      )
    }
  }

  // One transaction, so a failed seed leaves the database empty and the seed can run again.
  const shouldCommit = await initTransaction(req)
  try {
    await createContent(payload, req, admin)
    if (shouldCommit) await commitTransaction(req)
  } catch (error) {
    await killTransaction(req)
    throw error
  }
}

async function createContent(payload: Payload, req: PayloadRequest, admin: SeedArgs['admin']) {
  payload.logger.info('Seeding the admin user')
  const author = await payload.create({
    collection: 'users',
    data: { name: 'Admin', email: admin.email, password: admin.password },
    req,
  })

  payload.logger.info('Seeding media')
  const media = {} as Record<keyof typeof images, Media>
  for (const [key, { file, alt }] of Object.entries(images)) {
    media[key as keyof typeof images] = await payload.create({
      collection: 'media',
      data: { alt },
      filePath: path.join(cmsRoot, file),
      req,
    })
  }

  payload.logger.info('Seeding categories')
  const categoryIDs = {} as Record<CategorySlug, string>
  for (const category of categories) {
    const doc = await payload.create({ collection: 'categories', data: category, req })
    categoryIDs[category.slug] = doc.id
  }

  payload.logger.info('Seeding pages')
  const createPage = (data: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) =>
    payload.create({ collection: 'pages', data, req })

  const blog = await createPage({ slug: 'blog', title: 'Blog', featuredImage: media.desk.id })

  const about = await createPage({
    slug: 'about',
    title: 'About',
    featuredImage: media.mountain.id,
    blocks: [
      { blockType: 'hero', title: 'About the course' },
      {
        blockType: 'text',
        header: 'Why Payload Essentials',
        body: plainText(
          'Payload Essentials teaches you to build a content managed site from an empty folder to a live deployment.',
        ),
      },
      {
        blockType: 'textAndImage',
        header: 'Learn by building',
        layout: 'left',
        backgroundColor: 'secondary',
        image: media.mountain.id,
        body: plainText('Each lesson adds one feature to this site, so you always have something that works.'),
      },
    ],
  })

  const contact = await createPage({
    slug: 'contact',
    title: 'Contact',
    featuredImage: media.meadow.id,
    blocks: [
      { blockType: 'hero', title: 'Get in touch' },
      {
        blockType: 'text',
        body: plainText('Send a question about the course and we will get back to you within two working days.'),
      },
    ],
  })

  await createPage({
    slug: 'home',
    title: 'Home',
    featuredImage: media.meadow.id,
    blocks: [
      {
        blockType: 'hero',
        title: 'Build a real site with Payload',
        primaryCTA: blog.id,
        secondaryCTA: about.id,
        showHeroImage: true,
        heroImage: media.meadow.id,
      },
      {
        blockType: 'textAndImage',
        header: 'Everything in one admin panel',
        layout: 'right',
        image: media.desk.id,
        body: plainText('Pages, posts, media and settings all live in one place that editors can learn in an afternoon.'),
      },
      {
        blockType: 'cards',
        header: 'What you will learn',
        backgroundColor: 'secondary',
        cardsArray: [
          { image: media.desk.id, title: 'Content modeling', body: plainText('Collections, fields and blocks.') },
          { image: media.mountain.id, title: 'Access control', body: plainText('Who can read and change what.') },
          { image: media.meadow.id, title: 'Deployment', body: plainText('Ship the site and keep it running.') },
        ],
      },
      {
        blockType: 'text',
        header: 'Start reading',
        body: richText(paragraph(text('New posts land on '), internalLink('pages', blog.id, 'the blog'), text(' every week.'))),
      },
    ],
  })

  payload.logger.info('Seeding posts')
  // A week apart, so the previous and next links on each post have a fixed order.
  const firstDate = Date.parse('2026-01-05T14:00:00.000Z')
  const week = 7 * 24 * 60 * 60 * 1000
  for (const [index, post] of posts.entries()) {
    const body: BodyNode[] = [
      paragraph(text(post.summary)),
      heading('Where to go next'),
      paragraph(
        text('Read more '),
        internalLink('pages', about.id, 'about the course'),
        text(', or '),
        internalLink('pages', contact.id, 'ask us a question'),
        text('.'),
      ),
      upload(index % 2 === 0 ? media.meadow : media.mountain),
    ]
    // The first post holds every rich text node the front end renders.
    if (index === 0) {
      body.push(
        block({
          blockType: 'textAndImage',
          header: 'Collections at a glance',
          layout: 'left',
          backgroundColor: 'primary',
          image: media.desk.id,
          body: plainText('A collection is a set of documents that share the same fields.'),
        }),
        block({
          blockType: 'cards',
          header: 'Collections in this site',
          backgroundColor: 'secondary',
          cardsArray: [
            { id: nodeID(), image: media.meadow.id, title: 'Pages', body: plainText('Built from blocks.') },
            { id: nodeID(), image: media.desk.id, title: 'Posts', body: plainText('Written in rich text.') },
            { id: nodeID(), image: media.mountain.id, title: 'Media', body: plainText('Uploaded once, used everywhere.') },
          ],
        }),
      )
    }

    await payload.create({
      collection: 'posts',
      data: {
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        featured: index === 0,
        author: author.id,
        category: categoryIDs[post.category],
        date: new Date(firstDate + index * week).toISOString(),
        featuredImage: [media.meadow, media.desk, media.mountain][index % 3].id,
        body: richText(...body),
      },
      req,
    })
  }

  payload.logger.info('Seeding globals')
  await payload.updateGlobal({
    slug: 'settings',
    data: {
      siteName: 'Payload Essentials',
      // A placeholder in the GTM format, so the tag manager snippet renders.
      gtmCode: 'GTM-XXXXXXX',
      iconColor: media.logoColor.id,
      iconWhite: media.logoWhite.id,
      logoColor: media.logoColor.id,
      logoWhite: media.logoWhite.id,
    },
    req,
  })
  await payload.updateGlobal({
    slug: 'nav',
    data: { navItems: [{ link: blog.id }, { link: about.id }, { link: contact.id }] },
    req,
  })
}
