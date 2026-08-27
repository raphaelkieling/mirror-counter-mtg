import { Analytics } from '@vercel/analytics/next'
import { Varela_Round } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

const varelaRound = Varela_Round({ weight: '400', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Counters — tabletop life tracker',
  description: 'A fast, simple life counter for tabletop games.',
  generator: 'v0.app',
}

export const viewport: Viewport = { colorScheme: 'light', themeColor: '#f4f3f8', viewportFit: 'cover' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`bg-background ${varelaRound.className}`}><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
