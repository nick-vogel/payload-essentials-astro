import config from 'cms/config'
import {
  getPayload,
  type CollectionSlug,
  type FindOptions,
  type GlobalSlug,
  type Payload,
  type SelectType,
  type TypedCollectionSelect,
} from 'payload'

// The one door from the web app to the CMS. Routes and components call only these functions.
// Every call is anonymous on purpose: Astro has no Payload `req` to pass, and `overrideAccess: false`
// with no user applies the public read access, so the public site gets exactly what the collection
// and global read access allows a visitor to see. The public site never reads drafts.

// Payload's own find constrains TSelect to both of these.
type Select<TSlug extends CollectionSlug> = TypedCollectionSelect[TSlug] & SelectType

type FindArgs<TSlug extends CollectionSlug, TSelect extends Select<TSlug>> = Omit<
  FindOptions<TSlug, TSelect>,
  'collection' | 'overrideAccess' | 'user' | 'draft'
>

type FindGlobalArgs = Omit<Parameters<Payload['findGlobal']>[0], 'slug' | 'overrideAccess' | 'user' | 'select'>

export async function find<
  TSlug extends CollectionSlug,
  TSelect extends Select<TSlug> = Select<TSlug>,
>(collection: TSlug, options: FindArgs<TSlug, TSelect> = {}) {
  const payload = await getPayload({ config })
  return payload.find<TSlug, TSelect>({ ...options, collection, overrideAccess: false })
}

// The first document whose slug matches, or null.
export async function findBySlug<
  TSlug extends CollectionSlug,
  TSelect extends Select<TSlug> = Select<TSlug>,
>(collection: TSlug, slug: string, options: Omit<FindArgs<TSlug, TSelect>, 'where' | 'limit' | 'pagination'> = {}) {
  const { docs } = await find<TSlug, TSelect>(collection, {
    ...options,
    where: { slug: { equals: slug } },
    limit: 1,
    pagination: false,
  })
  return docs[0] ?? null
}

export async function findGlobal<TSlug extends GlobalSlug>(slug: TSlug, options: FindGlobalArgs = {}) {
  const payload = await getPayload({ config })
  return payload.findGlobal({ ...options, slug, overrideAccess: false })
}

// A page with every media field its blocks and metadata use: the hero and TextAndImage
// images at fullSize, the card images at card, and the featured image at og.
// Payload builds the original's url from its filename, and mediaFile falls back to the
// original for an image too small for the size, so the filename has to come along.
export function findPage(slug: string) {
  return findBySlug('pages', slug, {
    populate: {
      media: {
        filename: true,
        url: true,
        width: true,
        height: true,
        alt: true,
        sizes: { fullSize: true, card: true, og: true },
      },
    },
  })
}

// The fields a post preview card shows. The populatedAuthor hook reads author to fill in the
// author's name, so author has to come along too.
const postPreviewSelect = {
  slug: true,
  title: true,
  summary: true,
  date: true,
  date_tz: true,
  author: true,
  populatedAuthor: true,
  category: true,
  featuredImage: true,
} satisfies Select<'posts'>

// Posts with what a post preview card shows: the featured image at fullSize and card, and the
// category name. The blog list and the related posts both call this, with their own where, sort,
// page and limit.
export function findPostPreviews(
  options: Omit<FindArgs<'posts', typeof postPreviewSelect>, 'select' | 'populate'> = {},
) {
  return find('posts', {
    ...options,
    select: postPreviewSelect,
    populate: {
      media: {
        filename: true,
        url: true,
        width: true,
        height: true,
        alt: true,
        sizes: { fullSize: true, card: true },
      },
      categories: { name: true, slug: true },
    },
  })
}

export type PostPreviewData = Awaited<ReturnType<typeof findPostPreviews>>['docs'][number]

// The categories the blog filter offers, by name. As in the Next.js CategoryFilter, a category whose
// only post is the featured post stays out, because the grid never shows the featured post. The join
// brings back at most one other post, which is enough to tell.
export async function findFilterCategories() {
  const { docs } = await find('categories', {
    select: { name: true, slug: true, relatedPosts: true },
    joins: { relatedPosts: { where: { featured: { not_equals: true } }, limit: 1 } },
    sort: 'name',
    pagination: false,
  })
  return docs.filter((category) => category.relatedPosts?.docs?.length)
}

export type FilterCategory = Awaited<ReturnType<typeof findFilterCategories>>[number]
