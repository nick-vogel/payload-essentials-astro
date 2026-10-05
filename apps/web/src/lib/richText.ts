import { getImage } from 'astro:assets'
import type { Media } from 'cms/types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { SerializedLinkNode, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
  LinkHTMLConverterAsync,
} from '@payloadcms/richtext-lexical/html-async'
import { pageHref, postHref } from './links'
import { mediaFile } from './media'

// An internal link holds the linked document, populated by the query's depth.
function internalDocToHref({ linkNode }: { linkNode: SerializedLinkNode }): string {
  const { value, relationTo } = linkNode.fields.doc!
  // Pages and posts both require a slug, so a missing one means the depth did not reach the link.
  if (typeof value !== 'object' || typeof value.slug !== 'string') {
    throw new Error(`Internal link to ${relationTo} is not populated`)
  }

  const { slug } = value
  switch (relationTo) {
    case 'posts':
      return postHref(slug)
    case 'pages':
      return pageHref(slug)
    default:
      return `/${relationTo}/${slug}`
  }
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// An upload holds the media document, populated by the query's depth. Its URLs are relative to the
// CMS, so this resolves them against it and optimizes the image as MediaImage does.
async function uploadToHTML({ node }: { node: SerializedUploadNode }): Promise<string> {
  const file = mediaFile(node.value as Media | string, 'fullSize')
  if (!file) return ''

  const { src, attributes } = await getImage({ src: file.url, width: file.width, height: file.height })
  const attrs = Object.entries({ ...attributes, alt: file.alt })
    .map(([name, value]) => `${name}="${escapeAttribute(String(value))}"`)
    .join(' ')
  return `<div class="upload"><img src="${escapeAttribute(src)}" ${attrs} /></div>`
}

const converters: HTMLConvertersFunctionAsync = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkHTMLConverterAsync({ internalDocToHref }),
  upload: uploadToHTML,
  // A post body can hold these blocks. They render nothing until they have converters of their own.
  blocks: {
    cards: () => '',
    textAndImage: () => '',
  },
})

export function richTextToHTML(data: SerializedEditorState): Promise<string> {
  return convertLexicalToHTMLAsync({ data, converters, disableContainer: true })
}
