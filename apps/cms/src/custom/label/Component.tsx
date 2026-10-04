'use client'
import { useRowLabel, usePayloadAPI } from '@payloadcms/ui'

export const ArrayRowLabel = () => {
  const {
    data: {link},
    rowNumber
  } = useRowLabel<{ link?: string }>()

  const [{data, isError, isLoading}] = usePayloadAPI(`/api/pages/${link}`, {
    initialParams: {
      select: {
        title: true,
      }
    }
  })

  if (isLoading) return <p>Loading...</p>
  if (isError) {
    const message = data?.errors?.some((error: { message: string}) => error.message === 'Not Found') ? (
      'Try selecting a different option.'
    ) : (
      'Error occurred while fetching data.'
    )
    return <p>{message}</p>
  }


  const customLabel = data?.title || `Link ${String(rowNumber).padStart(2, '0')}`

  return <div>{customLabel}</div>
}

export const CardRowLabel = () => {
  const {data: {title}, rowNumber} = useRowLabel<{title: string}>()
  const customLabel = title || `Card ${String(rowNumber).padStart(2, '0')}`
  return <div>{customLabel}</div>
}