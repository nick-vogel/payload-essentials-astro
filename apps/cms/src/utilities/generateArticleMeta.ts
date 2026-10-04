import { Category, Post, Setting, User } from '@/payload-types'
import { Metadata } from 'next'
import { getServerSideURL } from '@/utilities/getUrl'
import { generateMeta } from '@/utilities/generateMeta'
import { isDoc } from '@/utilities/isDoc'

export const generateArticleMeta = async (args: {
  post: Post
  settings: Setting
}): Promise<Metadata> => {
  const { post, settings } = args
  const serverUrl = getServerSideURL()

  const baseMeta = await generateMeta({
    doc: post,
    settings,
  })
  const authorName = isDoc<User>(post.populatedAuthor)
    ? post.populatedAuthor.name
    : undefined

  const categoryName =
    isDoc<Category>(post.category) && post.category
      ? post.category.name
      : undefined

  return {
    ...baseMeta,
    openGraph: {
      ...baseMeta.openGraph,
      type: 'article',
      url: `${serverUrl}/blog/${post.slug}`,
      ...(post.date && { publishedTime: post.date }),
      ...(post.updatedAt && { modifiedTime: post.updatedAt }),
      ...(authorName && { authors: [authorName] }),
      ...(categoryName && { section: categoryName }),
    },
  }
}
