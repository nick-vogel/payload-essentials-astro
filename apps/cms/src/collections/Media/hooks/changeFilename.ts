import type { CollectionBeforeOperationHook } from 'payload'

export const changeFilename: CollectionBeforeOperationHook = ({ req: { file }, operation }) => {
  const slugify = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  if (operation === 'create' && file) {
    file.name = slugify(file.name)
  }
}
