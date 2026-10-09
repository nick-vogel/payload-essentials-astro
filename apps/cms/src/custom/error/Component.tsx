'use client'
import { useEffect } from 'react'
import { useField, toast } from '@payloadcms/ui'
import type {CheckboxFieldErrorClientComponent} from 'payload'

export const CheckboxError: CheckboxFieldErrorClientComponent = ({path}) => {
  const {showError, errorMessage} = useField({path})
  useEffect(() => {
    if (showError && errorMessage) {
      toast.error(errorMessage)
    }
  }, [showError, errorMessage])
  if (!showError) return null
  return <div style={{color: 'red'}}>{errorMessage}</div>
}
