import React from 'react'
import classes from './index.module.css'
import Link from 'next/link'

export type SearchParamsProps = Record<string, string | undefined>

type PaginationProps = {
  totalPages: number
  currentPage: number
  searchParams?: SearchParamsProps
  hasNext: boolean
  hasPrev: boolean
}

function buildHref(page: number, searchParams?: SearchParamsProps): string {
  const params = new URLSearchParams()
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
  }
  if (page > 1) {
    params.set('page', String(page))
  }
  const queryString = params.toString()
  return queryString ? `?${queryString}` : '?'
}

export const Pagination: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  searchParams,
  hasNext,
  hasPrev,
}) => {
  if (totalPages <= 1) return null
  const pages: number[] = []
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i)
  }
  return (
    <nav aria-label={'Pagination'} className={classes.pagination}>
      <ol className={classes.list}>
        <li>
          {hasPrev ? (
            <Link
              href={buildHref(currentPage - 1, searchParams)}
              className={`${classes.link} ${classes.arrow}`}
              aria-label={'Previous Page'}
            >
              Previous
            </Link>
          ) : (
            <span
              className={`${classes.link} ${classes.arrow} ${classes.disabled}`}
              aria-disabled={'true'}
            >
              Previous
            </span>
          )}
        </li>
        {pages.map((page) => (
          <li key={page}>
            {page === currentPage ? (
              <span className={`${classes.link} ${classes.active}`} aria-current="page">
                {page}
              </span>
            ) : (
              <Link href={buildHref(page, searchParams)} className={classes.link}>
                {page}
              </Link>
            )}
          </li>
        ))}
        <li>
          {hasNext ? (
            <Link
              href={buildHref(currentPage + 1, searchParams)}
              className={`${classes.link} ${classes.arrow}`}
              aria-label={'Next Page'}
            >
              Next
            </Link>
          ) : (
            <span
              className={`${classes.link} ${classes.arrow} ${classes.disabled}`}
              aria-disabled={'true'}
            >
              Next
            </span>
          )}
        </li>
      </ol>
    </nav>
  )
}
