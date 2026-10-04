import React, { ReactNode } from 'react'
import classes from './index.module.css'

export const Container = ({ children }: { children: ReactNode }) => {
  return <div className={classes.container}>{children}</div>
}