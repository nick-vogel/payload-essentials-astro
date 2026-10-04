import {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from 'payload'
import { Post } from '@/payload-types'
import { revalidatePath, revalidateTag } from 'next/cache'

export const updatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  req: { payload },
}) => {
  const path = `/blog/${doc.slug}/`
  payload.logger.info(`Revalidating path: ${path}`)
  revalidatePath(path)
  revalidateTag('blog', 'max')
}

export const deletePost: CollectionAfterDeleteHook<Post> = ({
  doc,
}) => {
  const path = `/blog/${doc.slug}`
  revalidatePath(path)
  revalidateTag('blog', 'max')
}
