import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { ClientLayout } from '@/components/layout/ClientLayout'
import { AuthProvider } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Verdura — Plants & Care, Delivered',
  description: 'Shop plants with tailored care guides and smart reminders, delivered across India.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#f5f0e8', fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="bottom-center" />
        </AuthProvider>
      </body>
    </html>
  )
}
