import type { ServerProps } from 'payload'
import { SettingsGraphic } from './SettingsGraphic'

export const Icon = ({ payload }: ServerProps) => (
  <SettingsGraphic
    payload={payload}
    colorField="iconColor"
    whiteField="iconWhite"
  />
)

export default Icon
