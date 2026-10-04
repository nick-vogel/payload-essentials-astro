import {internalDocToHref} from '@/components/RichText/converters/internalLink'
import {
  type JSXConvertersFunction,
  LinkJSXConverter
} from '@payloadcms/richtext-lexical/react'
import type { DefaultNodeTypes, SerializedBlockNode } from '@payloadcms/richtext-lexical'
import {uploadConverter} from './uploadConverter'
import type { CardsBlockProps, TextAndImageBlockProps } from '@/payload-types'
import { CardBlock } from '@/blocks/Cards/Component'
import { TextAndImage } from '@/blocks/TextAndImage/Component'

type NodeTypes = DefaultNodeTypes |
  SerializedBlockNode<TextAndImageBlockProps | CardsBlockProps>

export const jsxConverters: JSXConvertersFunction<NodeTypes> = ({defaultConverters}) => ({
  ...defaultConverters,
  ...LinkJSXConverter({internalDocToHref}),
  upload: ({node}) => {
    return uploadConverter({uploadNode: node})
  },
  blocks: {
    cards: ({node}) => {
      return <CardBlock {...node.fields} />
    },
    textAndImage: ({node}) => {
      return <TextAndImage {...node.fields} />
    }
  }
})