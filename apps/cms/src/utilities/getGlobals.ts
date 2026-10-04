import { Config } from '@/payload-types'
import { getPayloadClient } from '@/utilities/getPayloadClient'
import { unstable_cache } from 'next/cache'
import { SelectType } from 'payload'

type Global = keyof Config['globals']
async function getGlobal<T extends Global>(
  slug: T,
  depth = 0,
  select?: Config['globalsSelect'][T],
) {
  const payload = await getPayloadClient()
  return await payload.findGlobal({
    slug,
    depth,
    select: select as SelectType,
  })
}

export const getCachedGlobal = <T extends Global>(
  slug: T,
  depth = 0,
  select?: Config['globalsSelect'][T],
) =>
  unstable_cache(
    async () => getGlobal(slug, depth, select),
    [slug, String(depth), JSON.stringify(select ?? {})],
    {
      tags: [`global_${slug}`],
    },
  )
