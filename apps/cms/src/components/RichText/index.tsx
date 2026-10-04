import { RichText as RichTextConverter } from '@payloadcms/richtext-lexical/react'
import React, { JSX } from 'react'
import { SerializedEditorState } from 'lexical'
import { jsxConverters } from '@/components/RichText/converters'

type Props = {
  data: SerializedEditorState
} & React.HTMLAttributes<HTMLDivElement>

export function RichText(props: Props): JSX.Element {
  const { className, ...rest } = props
  return <RichTextConverter converters={jsxConverters} {...rest} className={className} disableContainer />
}
