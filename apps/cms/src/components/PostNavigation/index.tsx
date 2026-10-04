import React from 'react'
import classes from './index.module.css'
import Link from 'next/link'
import { ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'

type PostLinkProps = {
  slug: string
  title: string
} | null

type PostNavigationProps = {
  prevPost: PostLinkProps
  nextPost: PostLinkProps
}

export const PostNavigation: React.FC<PostNavigationProps> = ({
  prevPost,
  nextPost,
}) => {
  if (!prevPost && !nextPost) return null
  return (
    <nav className={classes.nav} aria-label={'Post navigation'}>
      <div className={classes.inner}>
        {prevPost ? (
          <Link
            href={`/blog/${prevPost.slug}`}
            className={`${classes.link} ${classes.prev}`}
            aria-label={`Previous post: ${prevPost.title}`}
          >
            <ChevronLeft size={16} aria-hidden={'true'} />
            <span className={classes.linkContent}>
              <span className={classes.label}>Previous Post</span>
              <span className={classes.title}>{prevPost.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextPost ? (
          <Link
            href={`/blog/${nextPost.slug}`}
            className={`${classes.link} ${classes.next}`}
            aria-label={`Next post: ${nextPost.title}`}
          >
            <span className={classes.linkContent}>
              <span className={classes.label}>Next Post</span>
              <span className={classes.title}>{nextPost.title}</span>
            </span>
            <ChevronRight size={16} aria-hidden={'true'} />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </nav>
  )
}
