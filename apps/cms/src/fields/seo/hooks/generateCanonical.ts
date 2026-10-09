import type { FieldHook } from 'payload'
import { getDocPath, getServerSideURL } from '@/utilities/getUrl'

export const generateCanonical: FieldHook = ({
  data,
  value,
  previousValue,
  collection,
  originalDoc,
}) => {
  const url = getServerSideURL()
  const defaultUrl = `${url}${getDocPath(collection?.slug, data?.slug)}`
  if (!value) {
    return defaultUrl
  }
  if (previousValue !== value) {
    return value
  }
  // A generated URL follows a slug change. A custom one stays.
  if (originalDoc?.slug !== data?.slug) {
    const previousURL = `${url}${getDocPath(collection?.slug, originalDoc?.slug)}`
    if (value === previousURL) {
      return defaultUrl
    }
  }
  return value
}
