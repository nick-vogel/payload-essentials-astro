import { isDoc } from '@/utilities/isDoc'

export const getRelationID = (
  relation?: { id: string } | string | null,
): string | null => {
  if (isDoc<{ id: string }>(relation)) return relation.id
  return relation ?? null
}
