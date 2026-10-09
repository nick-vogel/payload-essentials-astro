import { getImage } from 'astro:assets'
import type { CardsBlockProps, Media, TextAndImageBlockProps } from 'cms/types'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import {
  convertLexicalToHTMLAsync,
  type HTMLConvertersFunctionAsync,
  LinkHTMLConverterAsync,
} from '@payloadcms/richtext-lexical/html-async'
import { pageHref, postHref } from './links'
import { mediaFile, type MediaSize } from './media'

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

function escapeHTML(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// A media document as MediaImage renders it. Its URLs are relative to the CMS, so this resolves them
// against it and optimizes the image as Astro's Image does. The imageWrapper class is global, so it
// frames this markup the same way.
async function imageHTML(
  media: Media | string | null | undefined,
  size: MediaSize,
  className?: string,
): Promise<string> {
  const file = mediaFile(media, size)
  if (!file) return ''

  const { src, srcSet, attributes } = await getImage({ src: file.url, width: file.width, height: file.height })
  // Astro's Image adds a srcset when the transform yields one, so this does too.
  const srcset = srcSet.values.length > 0 ? { srcset: srcSet.attribute } : {}
  const attrs = Object.entries({ ...srcset, ...attributes, alt: file.alt })
    .map(([name, value]) => `${name}="${escapeHTML(String(value))}"`)
    .join(' ')
  const classes = className ? `imageWrapper ${className}` : 'imageWrapper'
  return `<div class="${classes}"><img src="${escapeHTML(src)}" ${attrs} /></div>`
}

// An upload holds the media document, populated by the query's depth.
async function uploadToHTML({ node }: { node: SerializedUploadNode }): Promise<string> {
  const image = await imageHTML(node.value as Media | string, 'fullSize')
  return image && `<div class="upload">${image}</div>`
}

// The blocks below repeat the markup of Section, Container, Header and Body, and of the block
// components in src/blocks. That markup only gets its scoped styles from an Astro component, so the
// richTextBlock class marks it for the copies of those styles in global.css. Both blocks share these
// two fields, so each passes its own fields in.
function sectionHTML(fields: Pick<CardsBlockProps, 'header' | 'backgroundColor'>, content: string): string {
  const { header, backgroundColor } = fields
  const heading = header ? `<h2 class="h2 center">${escapeHTML(header)}</h2>` : ''
  return (
    `<section class="container richTextBlock" data-background="${backgroundColor || 'primary'}">` +
    `<div class="container">${heading}${content}</div>` +
    `</section>`
  )
}

async function textAndImageToHTML({ node }: { node: SerializedBlockNode<TextAndImageBlockProps> }): Promise<string> {
  const { layout, image, body } = node.fields
  const [html, imageMarkup] = await Promise.all([richTextToHTML(body), imageHTML(image, 'fullSize', 'image')])
  const content =
    `<div class="layout" data-layout="${layout || 'left'}">` +
    `<div class="textContent"><div class="body">${html}</div></div>${imageMarkup}` +
    `</div>`
  return sectionHTML(node.fields, content)
}

async function cardToHTML(card: NonNullable<CardsBlockProps['cardsArray']>[number]): Promise<string> {
  const [html, imageMarkup] = await Promise.all([richTextToHTML(card.body), imageHTML(card.image, 'card', 'image')])
  return (
    `<article class="card">${imageMarkup}<div class="content">` +
    `<h3 class="h3 left title">${escapeHTML(card.title)}</h3><div class="body">${html}</div>` +
    `</div></article>`
  )
}

async function cardsToHTML({ node }: { node: SerializedBlockNode<CardsBlockProps> }): Promise<string> {
  const cards = await Promise.all((node.fields.cardsArray ?? []).map(cardToHTML))
  const grid = cards.length > 0 ? `<div class="grid" data-cards="${cards.length}">${cards.join('')}</div>` : ''
  return sectionHTML(node.fields, grid)
}

const converters: HTMLConvertersFunctionAsync<
  DefaultNodeTypes | SerializedBlockNode<CardsBlockProps> | SerializedBlockNode<TextAndImageBlockProps>
> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkHTMLConverterAsync({ internalDocToHref }),
  upload: uploadToHTML,
  blocks: {
    cards: cardsToHTML,
    textAndImage: textAndImageToHTML,
  },
})

export function richTextToHTML(data: SerializedEditorState): Promise<string> {
  return convertLexicalToHTMLAsync({ data, converters, disableContainer: true })
}
