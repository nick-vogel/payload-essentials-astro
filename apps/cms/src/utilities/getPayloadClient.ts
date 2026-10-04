import config from '@payload-config'
import { getPayload } from 'payload'

export async function getPayloadClient() {
  const payloadConfig = await config
  return await getPayload({ config: payloadConfig })
}
