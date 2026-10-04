import { GlobalAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateGlobal: GlobalAfterChangeHook = ({
  req: { payload },
  global: { slug },
}) => {
  payload.logger.info(`Revalidating ${slug}`)
  revalidateTag(`global_${slug}`, 'max')
}
