import type { HeroBlockProps, Media, Page } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'
import { getMediaSize } from '@/utilities/getMediaSize'
import Image from 'next/image'
import Link from 'next/link'
import classes from './Component.module.css'
import { Header } from '@/components/Header'

export const Hero = (props: HeroBlockProps) => {
  const { title, heroImage, showHeroImage, primaryCTA, secondaryCTA } = props

  return (
    <section className={classes.hero}>
      <div className={classes.content}>
        <Header as={'h1'} className={classes.title}>{title}</Header>
        {(primaryCTA || secondaryCTA) && (
          <div className={classes.ctaContainer}>
            {primaryCTA && isDoc<Page>(primaryCTA) && (
              <Link className={classes.primaryCta} href={primaryCTA.slug}>{primaryCTA.title}</Link>
            )}
            {secondaryCTA && isDoc<Page>(secondaryCTA) && (
              <Link className={classes.secondaryCta} href={secondaryCTA.slug}>{secondaryCTA.title}</Link>
            )}
          </div>
        )}
      </div>
      {isDoc<Media>(heroImage) && showHeroImage && (
        <>
          <div className={classes.overlay} />
          <Image
            className={classes.image}
          src={getMediaSize(heroImage, 'fullSize').url}
          alt={heroImage.alt || ''}
          height={getMediaSize(heroImage, 'fullSize').height}
          width={getMediaSize(heroImage, 'fullSize').width}
          priority
        /></>
      )}
    </section>
  )
}
