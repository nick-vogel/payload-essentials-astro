'use client'
import { useTheme } from '@payloadcms/ui'
import Image from 'next/image'
import type { Media } from '@/payload-types'

export default function Graphic({
  graphicColor,
  graphicWhite,
}: {
  graphicColor: Media
  graphicWhite: Media
}) {
  const { theme } = useTheme()
  const selectedGraphic = theme === 'light' ? graphicColor : graphicWhite
  if (!selectedGraphic) return null
  const { width, alt, url, height } = selectedGraphic as Media
  return <Image src={url!} alt={alt || ''} width={width} height={height} />
}
