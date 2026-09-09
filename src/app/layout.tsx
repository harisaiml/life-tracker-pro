import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Life Tracker Pro',
  description: 'Track your tasks, habits, diet, and goals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
