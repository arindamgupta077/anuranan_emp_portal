import { Database } from './database.types'

export type Role = Database['public']['Tables']['roles']['Row']
export type User = Database['public']['Tables']['users']['Row'] & {
  role?: Role
}

export type Task = Database['public']['Tables']['tasks']['Row'] & {
  assigned_user?: User
  created_user?: User
}

export type TaskHistory = Database['public']['Tables']['task_history']['Row']

export type SelfTask = Database['public']['Tables']['self_tasks']['Row'] & {
  user?: User
}

export type Leave = Database['public']['Tables']['leaves']['Row'] & {
  user?: User
  approver?: User
}

export type RecurringTask = Database['public']['Tables']['recurring_tasks']['Row'] & {
  assigned_user?: User
  created_user?: User
}

export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type Visibility = 'PUBLIC' | 'PRIVATE'
export type RecurrenceType = 'WEEKLY' | 'MONTHLY'

export const ROLE_NAMES = {
  CEO: 'CEO',
  MANAGER: 'Manager',
  TEACHER: 'Teacher',
  OPERATION_MANAGER: 'Operation Manager',
  EDITOR: 'Editor',
} as const

export const TASK_STATUSES: TaskStatus[] = ['OPEN', 'IN_PROGRESS', 'COMPLETED']
export const LEAVE_STATUSES: LeaveStatus[] = ['PENDING', 'APPROVED', 'REJECTED']

export const DAY_OF_WEEK_OPTIONS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export const DAY_OF_MONTH_OPTIONS = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}`,
}))
