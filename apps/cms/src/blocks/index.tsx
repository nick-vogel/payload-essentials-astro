import { TextBlock } from '@/blocks/Text/Component'
import type { Page } from '@/payload-types'
import { Hero } from '@/blocks/Hero/Component'
import { TextAndImage } from '@/blocks/TextAndImage/Component'
import { CardBlock } from '@/blocks/Cards/Component'

const blockComponents = {
  text: TextBlock,
  hero: Hero,
  textAndImage: TextAndImage,
  cards: CardBlock,
}

export const Blocks: React.FC<{
  blocks: Page['blocks']
}> = ({ blocks }) => {
  if (!blocks?.length) return null
  return (
    <>
      {blocks.map((block) => {
        const { blockType, id } = block
        if (!blockType || !(blockType in blockComponents)) return null
        switch (blockType) {
          case 'text':
            return <TextBlock key={id} {...block} />
          case 'hero':
            return <Hero {...block} key={id} />
          case 'textAndImage':
            return <TextAndImage {...block} key={id} />
          case 'cards':
            return <CardBlock {...block} key={id} />
          default:
            return null
        }
      })}
    </>
  )
}
