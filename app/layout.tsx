import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWAInstall } from '@/components/PWAInstall'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'CM Studio — Assistant community manager',
  description: 'Assistant community manager',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CM Studio',
  },
  icons: {
    icon: '/logo.png',
    apple: '/icons/apple-touch-icon.svg',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1E57CD',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* Script anti-FOUC : s'exécute de manière synchrone AVANT le rendu */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              })();
            `,
          }}
        />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RKJYNVRWPH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-RKJYNVRWPH');
          `}
        </Script>
      </head>
      <body>
        {children}
        <PWAInstall />
      </body>
    </html>
  )
}
