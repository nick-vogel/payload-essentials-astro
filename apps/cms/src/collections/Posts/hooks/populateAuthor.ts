import type { CollectionAfterReadHook } from 'payload'

export const populateAuthor: CollectionAfterReadHook = async ({doc, req, req: {payload}}) => {
  if (doc?.author) {
    try {
      const authorDoc = await payload.findByID({
        id: typeof doc.author === 'object' ? doc.author?.id : doc.author,
        collection: 'users',
        depth: 0,
        req,
      })

      if (authorDoc) {
        doc.populatedAuthor = {
          id: authorDoc.id,
          name: authorDoc.name,
        }
      }
    } catch {}
  }
  return doc
}

