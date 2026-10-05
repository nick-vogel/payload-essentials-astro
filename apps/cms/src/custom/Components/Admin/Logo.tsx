import type { ServerProps } from 'payload'
import { SettingsGraphic } from './SettingsGraphic'

export const Logo = ({ payload }: ServerProps) => (
  <SettingsGraphic
    payload={payload}
    colorField="logoColor"
    whiteField="logoWhite"
  />
)

export default Logo
