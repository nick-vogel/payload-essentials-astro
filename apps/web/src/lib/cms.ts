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
