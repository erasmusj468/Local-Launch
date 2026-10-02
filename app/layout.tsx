import './globals.css'  // <-- Make sure this line is here!
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LocalLaunch',
  description: 'Built for local businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
