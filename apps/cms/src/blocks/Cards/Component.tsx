import type { CardsBlockProps, Media } from '@/payload-types'
import { RichText } from '@/components/RichText'
import { isDoc } from '@/utilities/isDoc'
import Image from 'next/image'
import { getMediaSize } from '@/utilities/getMediaSize'
import classes from './Component.module.css'
import { Section } from '@/components/Section'
import { Header } from '@/components/Header'
import { MediaImage } from '@/components/MediaImage'
import { Body } from '@/components/Body'
import { Container } from '@/components/Container'

export const CardBlock = (props: CardsBlockProps) => {
  const { cardsArray, header, backgroundColor } = props
  return (
    <Section backgroundColor={backgroundColor}>
      <Container>{header && <Header>{header}</Header>}
        {cardsArray && cardsArray.length > 0 && (
          <div className={classes.grid} data-cards={cardsArray.length}>
            {cardsArray.map((card) => (
              <article className={classes.card} key={card.id}>
                {isDoc<Media>(card.image) && <MediaImage image={card.image} size={'card'} />}
                <div className={classes.content}>
                  <Header as={'h3'} className={classes.title} align={'left'}>
                    {card.title}
                  </Header>
                  <Body><RichText data={card.body} /></Body>
                </div>
              </article>
            ))}
          </div>
        )}</Container>
    </Section>
  )
}
