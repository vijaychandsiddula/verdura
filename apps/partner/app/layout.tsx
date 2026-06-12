import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Verdura Partner Portal',
  description: 'Manage your listings, orders, and earnings on Verdura',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', backgroundColor: '#f5f0e8' }}>
        {children}
      </body>
    </html>
  )
}
