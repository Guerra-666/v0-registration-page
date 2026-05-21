import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Registro Congreso Multidisciplinario',
  description: 'Registro de eventos para el Congreso Multidisciplinario de Investigacion e Innovacion. 28-30 Mayo 2024.',
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  openGraph: {
    title: 'Congreso Multidisciplinario de Investigacion e Innovacion',
    description: 'Registro de eventos para el Congreso Multidisciplinario de Investigacion e Innovacion. 28-30 Mayo 2024.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Congreso Multidisciplinario de Investigacion e Innovacion',
      },
    ],
    type: 'website',
    locale: 'es_MX',
    siteName: 'Congreso COMIIN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Congreso Multidisciplinario de Investigacion e Innovacion',
    description: 'Registro de eventos para el Congreso. 28-30 Mayo 2024.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="bg-background">
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

