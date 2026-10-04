'use client'
import React from 'react'
import classes from './index.module.css'
import { Category, Post } from '@/payload-types'
import { useRouter, usePathname } from 'next/navigation'
import { router } from 'next/client'
import { isDoc } from '@/utilities/isDoc'

type CategoryFilterProps = {
  categories: Pick<Category, 'id' | 'slug' | 'name' | 'relatedPosts'>[]
  currentCategory?: string
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ currentCategory, categories }) => {
  const router = useRouter()
  const pathname = usePathname()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams()
    if (value) {
      params.set('category', value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname, {
      scroll: false,
    })
  }

  return (
    <div className={classes.filterWrapper}>
      <label htmlFor={'category-filter'} className={classes.label}>
        Category
      </label>
      <select
        id={'category-filter'}
        className={classes.select}
        value={currentCategory || ''}
        onChange={handleChange}
      >
        <option value="">All Categories</option>
        {categories
          .filter(cat => !(
            cat.relatedPosts?.docs?.length === 1 &&
              isDoc<Post>(cat.relatedPosts.docs[0]) &&
              cat.relatedPosts.docs[0].featured === true
          )).map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
      </select>
    </div>
  )
}
