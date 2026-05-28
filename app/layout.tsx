import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '2015 英国大选 · 结果地图 - UK General Election Visualization',
  description: '2015 年英国大选交互式可视化平台，展示 650 个选区的选举结果、得票分布、政党席位等完整数据',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-background-primary text-white antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
