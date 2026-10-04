import { Category, Media, Post, User } from '@/payload-types'
import classes from './index.module.css'
import { isDoc } from '@/utilities/isDoc'
import { MediaImage } from '@/components/MediaImage'
import { Header } from '@/components/Header'
import { Calendar, Tag, User2 } from 'lucide-react'
import Link from 'next/link'

type PostPreviewProps = {
  post: Pick<
    Post,
    | 'id'
    | 'slug'
    | 'title'
    | 'summary'
    | 'featuredImage'
    | 'populatedAuthor'
    | 'date'
    | 'date_tz'
    | 'category'
  >
  variant?: 'featured' | 'header'
  showLink?: boolean
  imageSize?: 'fullSize' | 'card'
  className?: string
}

export function PostPreview({
  post,
  variant = 'featured',
  showLink = true,
  imageSize = 'fullSize',
  className,
}: PostPreviewProps) {
  const {
    featuredImage,
    populatedAuthor: author,
    date,
    date_tz,
    category,
    title,
    summary,
    slug,
  } = post
  const classNames = [classes.header, className].filter(Boolean).join(' ')

  const content = (
    <div className={classNames}>
      {isDoc<Media>(featuredImage) && <MediaImage image={featuredImage} size={imageSize} />}
      <div className={classes.content}>
        {variant === 'featured' && <Header as={'h3'} align={'left'}>{title}</Header>}
        <div className={classes.meta}>
          {isDoc<User>(author) && <span className={classes.iconContainer}>
            <User2 height={16} width={16} /> {author.name}
          </span>}
          {isDoc<Category>(category) && (
            <span className={classes.iconContainer}><Tag width={16} height={16} /> {category.name}</span>
          )}
          {date && (
            <span className={classes.iconContainer}>
              <Calendar width={16} height={16} />
              {new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: date_tz,
              })}
            </span>
          )}
        </div>
        {summary && <p className={classes.summary}>{summary}</p>}
      </div>
    </div>
  )

  if (showLink) {
    return (
      <Link href={`/blog/${slug}`} className={classes.link}>{content}</Link>
    )
  }

  return content
}
