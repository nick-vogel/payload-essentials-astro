import React from 'react'
import './styles.css'
import { getPayload } from 'payload'
import config from '@payload-config'
import { GoogleTagManager } from '@next/third-parties/google'
import { Metadata } from 'next'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedGlobal('settings')()

  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    ),
    description:
      settings.siteDescription ||
      'Learn everything you need to get started with Payload',
    title: {
      default: settings.siteName || 'Payload Essentials Course',
      template: `%s | ${settings.siteName || 'Payload Essentials Course'}`,
    },
    icons: [
      {
        url: '/pe-icon.png',
        type: 'image/png',
        sizes: '64x64',
      },
      {
        url: '/pe-icon-reverse.png',
        type: 'image/png',
        sizes: '64x64',
        media: '(prefers-color-scheme: dark)',
      },
    ],
  }
}

export default async function RootLayout(props: {
  children: React.ReactNode
}) {
  const { children } = props

  const navigation = await getCachedGlobal('nav', 1)()

  const settings = await getCachedGlobal('settings', 1)()

  return (
    <html lang="en">
      {settings.gtmCode && (
        <GoogleTagManager gtmId={settings.gtmCode} />
      )}
      <body>
        {navigation && (
          <Navigation
            navItems={navigation.navItems}
            logoColor={settings.logoColor}
            logoWhite={settings.logoWhite}
          />
        )}
        <main>{children}</main>
        <Footer
          logoColor={settings.logoColor}
          logoWhite={settings.logoWhite}
          navItems={navigation.navItems}
        />
      </body>
    </html>
  )
}
