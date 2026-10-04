import classes from './index.module.css'
import type { Media, Nav, Page, Setting } from '@/payload-types'
import { isDoc } from '@/utilities/isDoc'
import { Logo } from '@/components/Navigation/Logo'
import Link from 'next/link'

type FooterProps = Pick<Nav, 'navItems'> & Pick<Setting, 'logoColor' | 'logoWhite'>

export const Footer = ({ navItems, logoColor, logoWhite }: FooterProps) => {
  return (
    <footer className={classes.footer}>
      <div className={classes.content}>
        {isDoc<Media>(logoColor) && isDoc<Media>(logoWhite) && (
          <Logo className={classes.logo} logoColor={logoColor} logoWhite={logoWhite} />
        )}
        {navItems && navItems.length > 0 && (
          <nav className={classes.nav} aria-label={'Footer navigation'}>
            {navItems?.map((item) => {
              const link = item.link
              if (isDoc<Page>(link)) {
                return (
                  <Link
                    className={classes.navLink}
                    href={`/${link.slug === 'home' ? '/' : link.slug}`}
                    key={link.id}
                    role={'menuitem'}
                  >
                    {link.title}
                  </Link>
                )
              }
            })}
          </nav>
        )}
      </div>
      <p className={classes.copyright}>© {new Date().getFullYear()} Nick Vogel. All rights reserved</p>
    </footer>
  )
}