import GraphicClient from './index.client'
import { Media } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'
import { getCachedGlobal } from '@/utilities/getGlobals'

export const Icon = async () => {
  const settings = await getCachedGlobal('settings', 1, {
    iconColor: true,
    iconWhite: true,
  })()
  if (!settings) return null
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
