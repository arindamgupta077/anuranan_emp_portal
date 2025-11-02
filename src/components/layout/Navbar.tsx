'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LayoutDashboard, CheckSquare, ClipboardList, Calendar, Settings, User, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '../ui/Button'

interface NavbarProps {
  user: {
    full_name: string
    profile_photo_url?: string | null
    role: {
      name: string
    }
  }
}

export default function Navbar({ user }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const menuRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number>(0)
  const touchCurrentX = useRef<number>(0)
  const [dragOffset, setDragOffset] = useState<number>(0)
  
  const isCEO = user.role.name === 'CEO'

  // Cache user info for loading states
  useEffect(() => {
    sessionStorage.setItem('user_info', JSON.stringify({
      name: user.full_name,
      role: user.role.name
    }))
  }, [user.full_name, user.role.name])

  // Handle body scroll lock when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  // Handle swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchCurrentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX
    const diff = touchCurrentX.current - touchStartX.current
    
    // Only allow dragging to the right (closing direction)
    if (diff > 0) {
      setDragOffset(diff)
    }
  }

  const handleTouchEnd = () => {
    const diff = touchCurrentX.current - touchStartX.current
    
    // If dragged more than 100px, close the menu
    if (diff > 100) {
      closeMobileMenu()
    } else {
      // Reset position
      setDragOffset(0)
    }
  }

  const openMobileMenu = () => {
    setIsClosing(false)
    setIsMobileMenuOpen(true)
  }

  const closeMobileMenu = () => {
    setIsClosing(true)
    setDragOffset(0)
    setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsClosing(false)
    }, 300) // Match animation duration
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'Self Tasks', href: '/self-tasks', icon: ClipboardList },
    { name: 'Leaves', href: '/leaves', icon: Calendar },
    ...(isCEO ? [{ name: 'Admin', href: '/admin', icon: Settings }] : []),
  ]

  const handleLogout = async () => {
    // Clear cached user info
    sessionStorage.removeItem('user_info')
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex-shrink-0 flex items-center premium-brand-wrapper">
              <span className="premium-brand">ANURANAN</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
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

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* User info - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                href="/profile"
                prefetch={true}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 transition-colors"
              >
                <User className="w-5 h-5" />
                <div className="text-right">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-xs text-gray-500">{user.role.name}</div>
                </div>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => isMobileMenuOpen ? closeMobileMenu() : openMobileMenu()}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none active:scale-95 transition-transform"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 animate-spin-slow" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu - Floating Side Panel */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
              isClosing ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={closeMobileMenu}
            style={{
              animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out'
            }}
          />
          
          {/* Slide-in Menu Panel */}
          <div
            ref={menuRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-50 md:hidden overflow-y-auto ${
              isClosing ? 'animate-slideOutRight' : 'animate-slideInRight'
            }`}
            style={{
              transform: dragOffset > 0 ? `translateX(${dragOffset}px)` : undefined,
              transition: dragOffset > 0 ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {/* Header with close button */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5 shadow-lg z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Menu className="w-5 h-5" />
                  Menu
                </h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-full hover:bg-white/20 active:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* User Info in Header */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold overflow-hidden ring-2 ring-white/30">
                    {user.profile_photo_url ? (
                      <Image
                        src={user.profile_photo_url}
                        alt={user.full_name}
                        fill
                        className="object-cover"
                        unoptimized={user.profile_photo_url.includes('supabase')}
                      />
                    ) : (
                      <span>{user.full_name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{user.full_name}</div>
                    <div className="text-xs text-blue-100">{user.role.name}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              {navigation.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    style={{
                      animation: isClosing 
                        ? `slideOutItem 0.3s ease-out ${index * 0.05}s forwards`
                        : `slideInItem 0.4s ease-out ${index * 0.05}s both`
                    }}
                  >
                    <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {item.name}
                  </Link>
                )
              })}

              {/* Divider */}
              <div className="h-px bg-gray-200 my-3" />

              {/* Profile Link */}
              <Link
                href="/profile"
                prefetch={true}
                onClick={closeMobileMenu}
                className="flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                style={{
                  animation: isClosing 
                    ? `slideOutItem 0.3s ease-out ${navigation.length * 0.05}s forwards`
                    : `slideInItem 0.4s ease-out ${navigation.length * 0.05}s both`
                }}
              >
                <User className="w-5 h-5 mr-3 text-gray-500" />
                Profile
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3.5 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200"
                style={{
                  animation: isClosing 
                    ? `slideOutItem 0.3s ease-out ${(navigation.length + 1) * 0.05}s forwards`
                    : `slideInItem 0.4s ease-out ${(navigation.length + 1) * 0.05}s both`
                }}
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>

            {/* Swipe Indicator */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs text-gray-500">
                <span>👉</span>
                <span>Swipe right to close</span>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}
