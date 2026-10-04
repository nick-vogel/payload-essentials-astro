import type { Category, Media, Post, User } from '@/payload-types'
import Link from 'next/link'
import { isDoc } from '@/utilities/isDoc'
import classes from './index.module.css'
import { CardVariant } from '@/components/CardContainer'
import { MediaImage } from '@/components/MediaImage'
import { Header } from '@/components/Header'
import { Calendar, Tag, User2 } from 'lucide-react'

type CardProps = Pick<
  Post,
  'id' | 'slug' | 'featuredImage' | 'title' | 'populatedAuthor' | 'date' | 'date_tz' | 'category'
> & {
  variant?: CardVariant
  className?: string
}

export const Card = ({ variant = 'default', className, ...post }: CardProps) => {
  const cardClasses = [classes.link, classes.card, classes[variant], className]
    .filter(Boolean)
    .join(' ')
  return (
    <Link className={cardClasses} href={'/blog/' + post.slug}>
      <article>
        {isDoc<Media>(post.featuredImage) && (
          <div className={classes.imageWrapper}>
            {variant === 'default' && isDoc<Category>(post.category) && (
              <span className={classes.categoryBadge}><Tag width={16} height={16} /> {post.category.name}</span>
            )}
            <MediaImage image={post.featuredImage} size={'card'} />
          </div>
        )}
        <div className={classes.content}>
          <Header as={'h3'} align={'left'}>
            {post.title}
          </Header>
          <div className={classes.meta}>
            {isDoc<User>(post.populatedAuthor) && <span className={classes.iconContainer}><User2 height={16} width={16} /> {post.populatedAuthor.name}</span>}
            {post.date && (
              <span className={classes.iconContainer}>
                <Calendar height={16} width={16} />
                {new Date(post.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  timeZone: post.date_tz,
                })}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
