import type { FieldHook } from 'payload'
import { getServerSideURL } from '@/utilities/getUrl'

export const generateCanonical: FieldHook = ({
  data,
  value,
  previousValue,
  collection,
  originalDoc,
}) => {
  const isHome = data?.slug === 'home'
  const url = getServerSideURL()
  const collectionSlug = collection?.slug !== 'pages' ? `/${collection.slug}` : ''
  const path = isHome ? '/' : `${collectionSlug}/${data.slug}`
  const defaultUrl = `${url}${path}`
  if (!value) {
    return defaultUrl
  }
  if (previousValue !== value) {
    return value
  }
  if (originalDoc?.slug !== data?.slug) {
    const previousPath = isHome ? '/' : `${collectionSlug}/${originalDoc?.slug}`
    const previousURL = `${url}${previousPath}`
    if (value !== previousURL) {
      return defaultUrl
    }
  }
  return value
}
