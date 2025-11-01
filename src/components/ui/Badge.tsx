'use client'

import { TaskStatus, LeaveStatus } from '@/lib/types'
import { cn } from '@/lib/utils/helpers'

interface BadgeProps {
  status: TaskStatus | LeaveStatus | string
  className?: string
}

export default function Badge({ status, className }: BadgeProps) {
  const variants: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    PENDING: 'bg-gray-100 text-gray-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    PUBLIC: 'bg-purple-100 text-purple-800',
    PRIVATE: 'bg-gray-100 text-gray-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
  }

  // Handle undefined status
  const displayStatus = status || 'UNKNOWN'

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[displayStatus] || 'bg-gray-100 text-gray-800',
      className
    )}>
      {displayStatus.replace('_', ' ')}
    </span>
  )
}
