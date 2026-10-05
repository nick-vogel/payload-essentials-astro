import type { ServerProps } from 'payload'
import GraphicClient from './index.client'
import { Media } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'

// The login page shows the graphics before anyone signs in, so the read keeps
// the Local API's default access override.
export const Icon = async ({ payload }: ServerProps) => {
  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1,
    select: { iconColor: true, iconWhite: true },
  })
  if (
    !isDoc<Media>(settings.iconColor) ||
    !isDoc<Media>(settings.iconWhite)
  )
    return null

  return (
    <GraphicClient
      graphicColor={settings.iconColor}
      graphicWhite={settings.iconWhite}
    />
  )
}

export default Icon
