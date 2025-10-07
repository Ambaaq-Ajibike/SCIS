import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'
import { PatientAuthProvider } from '@/lib/patientAuth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SCIS Admin Dashboard',
  description: 'Smart Connected Framework for Integrated Healthcare Administration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PatientAuthProvider>
            {children}
          </PatientAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
