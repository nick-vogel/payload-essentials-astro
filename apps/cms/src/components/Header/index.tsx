import React from 'react'
import classes from './index.module.css'

type HeaderProps = {
  children: React.ReactNode,
  as?: 'h1' | 'h2' | 'h3',
  align?: 'left' | 'center'
  className?: string
}

export const Header = (props: HeaderProps) => {
  const {children, as = 'h2', align = 'center', className} = props
  const Tag = as
  const classNames = [classes[as], classes[align], className].filter(Boolean).join(' ')
  return <Tag className={classNames}>{children}</Tag>
}