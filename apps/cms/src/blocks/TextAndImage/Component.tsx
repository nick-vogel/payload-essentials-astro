import type { Media, TextAndImageBlockProps } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { isDoc } from '@/utilities/isDoc'
import Image from 'next/image'
import { getMediaSize } from '@/utilities/getMediaSize'
import classes from './Component.module.css'
import { Section } from '@/components/Section'
import { Header } from '@/components/Header'
import { Body } from '@/components/Body'
import { Container } from '@/components/Container'
import { MediaImage } from '@/components/MediaImage'

export const TextAndImage = (props: TextAndImageBlockProps) => {
  const { header, image, body, backgroundColor, layout } = props

  return (
    <Section backgroundColor={backgroundColor}>
      <Container>
      {header && <Header>{header}</Header>}
      <div className={classes.container} data-layout={layout || 'left'}>
        <div className={classes.textContent}>
          <Body>
            <RichText data={body} />
          </Body>
        </div>
        {isDoc<Media>(image) && (
          <MediaImage image={image} size={'fullSize'} flex />
        )}
      </div>
    </Container>
    </Section>
  )
}
