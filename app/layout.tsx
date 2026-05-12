import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PWAInstall } from '@/components/PWAInstall'
import { ThemeProvider } from '@/components/layout/ThemeProvider'

export const metadata: Metadata = {
  title: 'CM Studio — Plateforme Community Management',
  description: 'Gérez vos réseaux sociaux et votre communauté avec intelligence.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CM Studio',
  },
  icons: {
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
    <html lang="fr" data-theme="light" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  )
}
