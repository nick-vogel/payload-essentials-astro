import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { Page } from '@/payload-types'
import { revalidatePath } from 'next/cache'

export const updatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  req: { payload },
}) => {
  const path = doc.slug === 'home' ? '/' : `/${doc.slug}/`
  payload.logger.info(`Revalidating path: ${path}`)
  revalidatePath(path)
}

export const deletePage: CollectionAfterDeleteHook<Page> = ({
  doc,
}) => {
  const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
  revalidatePath(path)
}
