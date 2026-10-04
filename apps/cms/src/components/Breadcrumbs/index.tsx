import React from 'react'
import classes from './index.module.css'
import { getServerSideURL } from '@/utilities/getUrl'
import { Container } from '@/components/Container'
import Link from 'next/link'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumbs: React.FC<BreadcrumbProps> = ({ items }) => {
  const serverUrl = getServerSideURL()
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${serverUrl}${item.href}` }),
    })),
  }
  return (
    <>
      <script
        type={'application/ld+json'}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={classes.wrapper}>
        <Container>
          <nav
            aria-label={'Breadcrumb'}
            className={classes.breadcrumbs}
          >
            <ol className={classes.list}>
              {items.map((item, index) => (
                <li key={item.label} className={classes.item}>
                  {item.href ? (
                    <Link href={item.href} className={classes.link}>
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={classes.current}
                      aria-current={'page'}
                    >
                      {item.label}
                    </span>
                  )}
                  {index < items.length - 1 && (
                    <span
                      className={classes.separator}
                      aria-hidden={'true'}
                    >
                      /
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Container>
      </div>
    </>
  )
}
