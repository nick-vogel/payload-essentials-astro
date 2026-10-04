import {RichText} from '@/components/RichText'
import type {TextBlockProps} from '@/payload-types'
import { Section } from '@/components/Section'
import { Header } from '@/components/Header'
import { Body } from '@/components/Body'
import { Container } from '@/components/Container'

export const TextBlock = (props: TextBlockProps) => {
  const {header, backgroundColor, body} = props
  return (
    <Section backgroundColor={backgroundColor}>
      <Container>{header && <Header>{header}</Header>}
        <Body>
          <RichText data={body} />
        </Body></Container>
    </Section>
  )
}