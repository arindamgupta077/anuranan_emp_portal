'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers'

interface CardProps {
  children: ReactNode
  className?: string
  title?: string
  action?: ReactNode
}

export default function Card({ children, className, title, action }: CardProps) {
  return (
    <div className={cn('bg-white rounded-lg shadow-md overflow-hidden', className)}>
      {(title || action) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
