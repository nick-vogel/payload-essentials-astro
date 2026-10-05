import type { Payload } from 'payload'
import GraphicClient from './index.client'
import type { Media, Setting } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'

// Settings fields that hold an upload of the media collection.
type GraphicField = {
  [K in keyof Setting]-?: Media extends Setting[K] ? K : never
}[keyof Setting]

// Payload renders the login page Logo without `req` in its server props, so
// this read runs without one. The default access override lets it read
// settings before anyone signs in.
export const SettingsGraphic = async ({
  payload,
  colorField,
  whiteField,
}: {
  payload: Payload
  colorField: GraphicField
  whiteField: GraphicField
}) => {
  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1,
    select: { [colorField]: true, [whiteField]: true },
  })
  const graphicColor = settings[colorField]
  const graphicWhite = settings[whiteField]
  if (!isDoc<Media>(graphicColor) || !isDoc<Media>(graphicWhite))
    return null

  return (
    <GraphicClient
      graphicColor={graphicColor}
      graphicWhite={graphicWhite}
    />
  )
}
