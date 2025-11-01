'use client'

import { WifiOff } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-gray-100 rounded-full">
            <WifiOff size={64} className="text-gray-400" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Please check your
          network and try again.
        </p>
        
        <Button onClick={handleRetry} size="lg">
          Try Again
        </Button>
        
        <p className="mt-6 text-sm text-gray-500">
          The app will automatically reconnect when your internet is restored.
        </p>
      </div>
    </div>
  )
}
