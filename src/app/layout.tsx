import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Life Tracker Pro',
  description: 'Track your tasks, habits, diet, goals, and mood - Your complete life management solution',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
