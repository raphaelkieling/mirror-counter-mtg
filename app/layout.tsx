import { Analytics } from "@vercel/analytics/next";
import { Varela_Round } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";

import "./globals.css";

const varelaRound = Varela_Round({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mirror Counter",
  description:
    "A fast, simple life counter for Magic: The Gathering 1x1 format.",
  generator: "v0.app",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Mirror Counter",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Mirror Counter",
    description:
      "A fast, simple life counter for Magic: The Gathering 1x1 format.",
    type: "website",
    siteName: "Mirror Counter",
  },
  twitter: {
    card: "summary",
    title: "Mirror Counter",
    description:
      "A fast, simple life counter for Magic: The Gathering 1x1 format.",
  },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4f3f8",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Layout
  return (
    <html lang="en" className={`bg-background ${varelaRound.className}`}>
      <head>
        <link rel="icon" href="/32.png" type="image/png" />
        <link rel="apple-touch-icon" href="/1024.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Mirror Counter" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        {children}
        <script src="/register-sw.js" />
        {process.env.NODE_ENV === "production" && (
          <div>
            <SpeedInsights />
            <Analytics />
          </div>
        )}
      </body>
    </html>
  );
}
