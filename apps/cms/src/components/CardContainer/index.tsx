import React from 'react'
import classes from './index.module.css'

export type CardVariant = 'default' | 'compact'

type CardContainerProps = {
  children: React.ReactNode
  variant?: CardVariant
  className?: string
}

export const CardContainer = ({children, variant = 'default', className}: CardContainerProps) => {
  const classNames = [classes.grid, className].filter(Boolean).join(' ')

  const childrenWithVariant = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { variant } as React.HTMLAttributes<HTMLElement>)
    }
    return child
  })

  return <div className={classNames}>
    {childrenWithVariant}
  </div>
}