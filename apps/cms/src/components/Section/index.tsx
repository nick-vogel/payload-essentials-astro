import classes from './index.module.css'
import React from 'react'

export const Section = ({
  backgroundColor = 'primary',
  children, }: {
  backgroundColor?: 'primary' | 'secondary' | null
  children: React.ReactNode
}) => {
  return (
    <section
      className={classes.container}
      data-background={backgroundColor || 'primary'}
    >
      {children}
    </section>
  )
}