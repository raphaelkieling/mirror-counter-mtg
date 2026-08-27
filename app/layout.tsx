import { Analytics } from '@vercel/analytics/next'
import { Varela_Round } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const varelaRound = Varela_Round({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Counters — tabletop life tracker',
  description: 'A fast, simple life counter for tabletop games.',
  generator: 'v0.app',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Counters',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f4f3f8',
  viewportFit: 'cover',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`bg-background ${varelaRound.className}`}>
      <head>
        <link rel="icon" href="/32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/1024.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Counters" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
        <script src="/register-sw.js" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
