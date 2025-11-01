export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long' }
  }
  return { valid: true }
}

export function validateDateRange(startDate: string, endDate: string): { valid: boolean; message?: string } {
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid date format' }
  }
  
  if (end < start) {
    return { valid: false, message: 'End date must be after start date' }
  }
  
  return { valid: true }
}

export function validateRequired(value: string | null | undefined, fieldName: string): { valid: boolean; message?: string } {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` }
  }
  return { valid: true }
}
