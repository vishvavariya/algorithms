import type { Metadata, Viewport } from 'next'
import './globals.css'
import { StructuredData } from '@/components/StructuredData'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import { AnalyticsAuto } from '@/components/AnalyticsAuto'
import { PresenceBeacon } from '@/components/PresenceBeacon'
import { Suspense } from 'react'
import { Bricolage_Grotesque, Fraunces } from 'next/font/google'
import { SITE_AUTHOR, SITE_NAME, SITE_ORIGIN, SITE_URL, absoluteUrl, ogImageUrl, routePath, seoPages } from '@/lib/seo'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['700', '900'],
  variable: '--font-fraunces',
  display: 'swap',
})



export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: SITE_NAME,
  title: {
    default: seoPages.home.title,
    template: `%s | ${SITE_NAME}`,
  },
  description: seoPages.home.description,
  authors: [SITE_AUTHOR],
  creator: SITE_AUTHOR.name,
  publisher: SITE_AUTHOR.name,
  keywords: seoPages.home.keywords,
  alternates: {
    canonical: routePath('/'),
  },
  openGraph: {
    title: seoPages.home.title,
    description: seoPages.home.description,
    url: absoluteUrl('/'),
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: ogImageUrl({
          title: seoPages.home.title,
          description: seoPages.home.description,
          label: seoPages.home.ogLabel,
          theme: seoPages.home.ogTheme,
        }),
        width: 1200,
        height: 630,
        alt: seoPages.home.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seoPages.home.title,
    description: seoPages.home.description,
    creator: '@vishvavariya',
    images: [
      ogImageUrl({
        title: seoPages.home.title,
        description: seoPages.home.description,
        label: seoPages.home.ogLabel,
        theme: seoPages.home.ogTheme,
      }),
    ],
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: SITE_NAME,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const siteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: seoPages.home.description,
    inLanguage: 'en',
    publisher: {
      '@id': `${SITE_URL}/#person`,
    },
  }

  const personLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: SITE_AUTHOR.name,
    url: SITE_AUTHOR.url,
    jobTitle: 'Software engineer and creative technologist',
    sameAs: [
      'https://vishvavariya.com/',
      'https://www.linkedin.com/in/vishvavariya',
      'https://x.com/vishvavariya',
    ],
  }

  // Note: per-algorithm ItemList is rendered on the home page itself so it can
  // reference the live registry without forcing the layout to import the data.

  return (
    <html lang="en" className={`${bricolage.variable} ${fraunces.variable}`}>
      <head>
        <meta name="theme-color" content="#17120c" />
        <meta name="color-scheme" content="dark light" />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <StructuredData data={siteLd} />
        <StructuredData data={personLd} />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
          <AnalyticsAuto />
        </Suspense>
        <PresenceBeacon />
        {children}
      </body>
    </html>
  )
}
