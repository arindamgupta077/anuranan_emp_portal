'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // First, ensure any existing session is cleared
      await supabase.auth.signOut()
      
      // Small delay to ensure session is cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      if (data.user) {
        console.log('Login successful, user ID:', data.user.id)
        console.log('User email:', data.user.email)
        
        // Check if user exists in database
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('id, full_name, email, role_id, roles(name)')
          .eq('id', data.user.id)
          .single()

        if (dbError || !dbUser) {
          console.error('Database user lookup error:', dbError)
          await supabase.auth.signOut()
          setError('User not found in database. Please contact your administrator to set up your account.')
          setIsLoading(false)
          return
        }

        console.log('Database user found:', dbUser.full_name, 'Role ID:', dbUser.role_id)
        
        // Clear any cached data
        if (typeof window !== 'undefined') {
          sessionStorage.clear()
          localStorage.removeItem('supabase.auth.token')
        }
        
        // Use window.location for a full page reload to ensure fresh auth state
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred during login. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Welcome Section (Hidden on mobile) */}
        <div className="hidden lg:block space-y-8 pr-8">
          <div className="space-y-4">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full">
              <span className="text-primary-700 font-semibold text-sm">🎭 Employee Portal</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Welcome to<br />
              <span className="premium-brand" style={{ fontSize: '3rem', display: 'inline-block' }}>ANURANAN</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed">
              Bengali Recitation Training Institute
            </p>
            <p className="text-gray-600 leading-relaxed">
              Manage your tasks, track performance, and collaborate with your team. 
              Access your dashboard to view assignments, submit reports, and stay connected with the organization.
            </p>
          </div>

          <div className="space-y-4 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/60">
            <h3 className="font-semibold text-gray-900 mb-3">Portal Features:</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-medium text-gray-900">Task Management</span>
                  <p className="text-sm text-gray-600">Track and manage your daily assignments</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-medium text-gray-900">Leave Management</span>
                  <p className="text-sm text-gray-600">Apply for and track leave requests</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <span className="font-medium text-gray-900">Performance Reports</span>
                  <p className="text-sm text-gray-600">View detailed analytics and insights</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-100">
            {/* Mobile header */}
            <div className="text-center mb-8">
              <div className="lg:hidden mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                  <span className="text-3xl">🎭</span>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Enter your credentials to access your account
              </p>
              <div className="lg:hidden mt-2">
                <p className="text-xs font-medium">
                  <span className="premium-brand" style={{ fontSize: '0.875rem' }}>ANURANAN</span> Employee Portal
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <Input
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                placeholder="your.email@anuranan.org"
              />

              <Input
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                placeholder="Enter your password"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Your Account'}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Need help logging in?
                </p>
                <p className="text-xs text-gray-500">
                  Contact your administrator for login credentials or password reset
                </p>
              </div>
            </div>
          </div>

          {/* Footer text for mobile */}
          <div className="lg:hidden mt-6 text-center">
            <p className="text-sm text-gray-600">
              © 2025 Anuranan. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
