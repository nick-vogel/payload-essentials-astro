import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { SerializedLinkNode } from '@payloadcms/richtext-lexical'
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
  LinkHTMLConverterAsync,
} from '@payloadcms/richtext-lexical/html-async'
import { pageHref } from './links'

// An internal link holds the linked document, populated by the query's depth.
function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }): string {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') throw new Error(`Internal link to ${relationTo} is not populated`)

  const slug = value.slug as string
  switch (relationTo) {
    case 'posts':
      return `/blog/${slug}`
    case 'pages':
      return pageHref(slug)
    default:
      return `/${relationTo}/${slug}`
  }
}

const converters: HTMLConvertersFunctionAsync = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkHTMLConverterAsync({ internalDocToHref }),
})

export function richTextToHTML(data: SerializedEditorState): Promise<string> {
  return convertLexicalToHTMLAsync({ data, converters, disableContainer: true })
}
