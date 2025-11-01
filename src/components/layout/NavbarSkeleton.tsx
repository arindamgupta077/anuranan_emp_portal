'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CheckSquare, ClipboardList, Calendar, Settings, User, LogOut } from 'lucide-react'

export default function NavbarSkeleton() {
  const pathname = usePathname()
  const [userInfo, setUserInfo] = useState<{ name: string; role: string } | null>(null)

  useEffect(() => {
    // Try to get cached user info from sessionStorage
    const cached = sessionStorage.getItem('user_info')
    if (cached) {
      try {
        setUserInfo(JSON.parse(cached))
      } catch (e) {
        // If parsing fails, ignore
      }
    }
  }, [])

  // Check if user is CEO to show Admin button
  const isCEO = userInfo?.role === 'CEO'

  // Show navigation items based on user role
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Self Tasks', href: '/self-tasks', icon: ClipboardList },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
    ...(isCEO ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ]

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex-shrink-0 flex items-center premium-brand-wrapper">
              <span className="premium-brand">ANURANAN</span>
            </Link>

            {/* Desktop Navigation - Show all buttons */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname?.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right side - User menu - Fully visible, no loading state */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/profile"
                prefetch={true}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <div className="text-right">
                  <div className="font-medium">{userInfo?.name || 'Loading...'}</div>
                  <div className="text-xs text-gray-500">{userInfo?.role || 'User'}</div>
                </div>
              </Link>
              <button
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-transparent hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                disabled
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
