import type {
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import React from 'react'
import { isDoc } from '@/utilities/isDoc'
import type { Media } from '@/payload-types'
import { MediaImage } from '@/components/MediaImage'

export const uploadConverter = ({ uploadNode }: {
  uploadNode: SerializedUploadNode
}) => {
  const image = uploadNode.value
  if (isDoc<Media>(image)) {
    return <div style={{
      maxWidth: '640px',
      margin: '2rem auto',
      padding: '0 1.5rem',
    }}>
      <MediaImage image={image} size={'fullSize'} />
    </div>
  }
  return
}