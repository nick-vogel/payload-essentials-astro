import type { ServerProps } from 'payload'
import GraphicClient from './index.client'
import { Media } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'

// The login page shows the graphics before anyone signs in, so the read keeps
// the Local API's default access override.
export const Logo = async ({ payload }: ServerProps) => {
  const settings = await payload.findGlobal({
    slug: 'settings',
    depth: 1,
    select: { logoColor: true, logoWhite: true },
  })
  if (
    !isDoc<Media>(settings.logoColor) ||
    !isDoc<Media>(settings.logoWhite)
  )
    return null

  return (
    <GraphicClient
      graphicColor={settings.logoColor}
      graphicWhite={settings.logoWhite}
    />
  )
}

export default Logo
