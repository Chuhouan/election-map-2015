import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BBC-Style 2024 UK General Election Interactive Visualization',
  description: 'A professional election visualization platform inspired by BBC election coverage',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background-primary text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}