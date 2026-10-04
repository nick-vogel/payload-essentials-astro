import React from 'react'
import classes from './index.module.css'

export const Body = ({children}) => {
  return (
    <div className={classes.body}>
      {children}
    </div>
  )
}