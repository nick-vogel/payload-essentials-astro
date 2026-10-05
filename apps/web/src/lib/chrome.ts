import type { Nav, Setting } from 'cms/types'

// The two logo uploads from the Settings global, color for light mode and white for dark.
export type Logos = Pick<Setting, 'logoColor' | 'logoWhite'>

// What the navigation and footer around every page read from the Nav and Settings globals.
export type ChromeProps = Pick<Nav, 'navItems'> & Logos
