'use client'

import { ReactNode } from 'react'
import Navbar from './Navbar'
import { ToastProvider } from '../ui/Toast'

interface ProtectedLayoutProps {
  children: ReactNode
  user: {
    full_name: string
    role: {
      name: string
    }
  }
}

export default function ProtectedLayout({ children, user }: ProtectedLayoutProps) {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Anuranan - Bengali Recitation Training Institute
            </p>
          </div>
        </footer>
      </div>
    </ToastProvider>
  )
}
