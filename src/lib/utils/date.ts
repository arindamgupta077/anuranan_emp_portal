import { format, parseISO, differenceInDays, addDays, isAfter, isBefore } from 'date-fns'

export function formatDate(date: string | Date, formatStr: string = 'MMM dd, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr)
}

export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy hh:mm a')
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = parseISO(dueDate)
  return isBefore(due, today)
}

export function calculateDuration(startDate: string, endDate: string): number {
  const start = parseISO(startDate)
  const end = parseISO(endDate)
  return differenceInDays(end, start) + 1 // Inclusive
}

export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function addDaysToDate(date: string, days: number): string {
  const dateObj = parseISO(date)
  return format(addDays(dateObj, days), 'yyyy-MM-dd')
}
