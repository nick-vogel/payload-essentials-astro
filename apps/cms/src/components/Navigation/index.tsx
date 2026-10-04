'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { Media, Nav, Page, Setting } from '@/payload-types'
import Link from 'next/link'
import { isDoc } from '@/utilities/isDoc'
import { Logo } from '@/components/Navigation/Logo'
import { Menu, X } from 'lucide-react'
import classes from './index.module.css'

export const Navigation = ({
  navItems,
  logoColor,
  logoWhite,
}: Pick<Nav, 'navItems'> & Pick<Setting, 'logoColor' | 'logoWhite'>) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        return
      }
      if (e.key === 'Tab' && navRef.current) {
        const focusable = navRef.current.querySelectorAll<HTMLElement>(
          'a[href], button, [tabindex]:not([tabindex="-1"])',
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  const navClassName = [classes.navigation, menuOpen && classes.menuOpen].filter(Boolean).join(' ')

  return (
    <nav className={navClassName} ref={navRef} aria-label="Main navigation">
      {isDoc<Media>(logoColor) && isDoc<Media>(logoWhite) && (
        <Logo className={classes.logo} logoColor={logoColor} logoWhite={logoWhite} />
      )}
      <button
        className={classes.hamburger}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <Menu className={classes.menuIcon} size={24} aria-hidden={'true'} />
        <X className={classes.closeIcon} size={24} aria-hidden={'true'} />
      </button>
      <div className={classes.overlay} onClick={() => setMenuOpen(false)} aria-hidden={'true'} />
      <div className={classes.navLinkContainer} role={'menu'}>
        {navItems?.map((item) => {
          const link = item.link
          if (isDoc<Page>(link)) {
            return (
              <Link
                className={classes.navItem}
                href={`/${link.slug === 'home' ? '/' : link.slug}`}
                key={link.id}
                role={'menuitem'}
                onClick={() => setMenuOpen(false)}
              >
                {link.title}
              </Link>
            )
          }
        })}
      </div>
    </nav>
  )
}
