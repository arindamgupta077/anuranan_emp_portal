'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Filter, AlertCircle, Clock, Eye, CheckCircle, Circle, Loader, Edit, Trash2, X, Save, Users, BarChart3, Clipboard } from 'lucide-react'
import { Task, TaskStatus, TASK_STATUSES } from '@/lib/types'
import { formatDate, isOverdue } from '@/lib/utils/date'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

interface TasksClientProps {
  user: {
    id: string
    full_name: string
    role: { name: string }
  }
  tasks: Task[]
  employees: Array<{ id: string; full_name: string; email: string }>
}

export default function TasksClient({ user, tasks, employees }: TasksClientProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>(['OPEN', 'IN_PROGRESS'])
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [taskComment, setTaskComment] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const router = useRouter()
  const { showToast } = useToast()

  const isCEO = user.role.name === 'CEO'
  const ITEMS_PER_PAGE = 10

  // Initialize comment when task is selected
  useEffect(() => {
    if (selectedTask) {
      setTaskComment(selectedTask.comment || '')
    }
  }, [selectedTask])

  // Assign task form
  const [assignForm, setAssignForm] = useState({
    title: '',
    details: '',
    assigned_to: '',
    due_date: '',
    execution_date: '',
  })

  // Edit task form
  const [editForm, setEditForm] = useState({
    title: '',
    details: '',
    assigned_to: '',
    status: 'OPEN' as TaskStatus,
    due_date: '',
    execution_date: '',
  })

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setUpdatingTaskId(taskId)
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, updated_by: user.id }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      showToast('success', 'Task status updated successfully')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to update task status')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...assignForm,
          due_date: assignForm.due_date || null,
          execution_date: assignForm.execution_date || null,
          created_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')

      showToast('success', 'Task assigned successfully')
      setShowAssignModal(false)
      setAssignForm({ title: '', details: '', assigned_to: '', due_date: '', execution_date: '' })
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to assign task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditTask = () => {
    if (selectedTask) {
      setEditForm({
        title: selectedTask.title,
        details: selectedTask.details || '',
        assigned_to: selectedTask.assigned_to || '',
        status: selectedTask.status as TaskStatus,
        due_date: selectedTask.due_date || '',
        execution_date: selectedTask.execution_date || '',
      })
      setIsEditMode(true)
    }
  }

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTask) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          due_date: editForm.due_date || null,
          execution_date: editForm.execution_date || null,
          updated_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      showToast('success', 'Task updated successfully')
      setIsEditMode(false)
      setSelectedTask(null)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to update task')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!selectedTask) return
    
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      showToast('success', 'Task deleted successfully')
      setSelectedTask(null)
      setIsEditMode(false)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to delete task')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditForm({
      title: '',
      details: '',
      assigned_to: '',
      status: 'OPEN',
      due_date: '',
      execution_date: '',
    })
  }

  const handleSaveComment = async () => {
    if (!selectedTask) return

    setIsSavingComment(true)
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}/comment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: taskComment,
          updated_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to save comment')

      showToast('success', 'Comment saved successfully')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to save comment')
    } finally {
      setIsSavingComment(false)
    }
  }

  const toggleStatusFilter = (status: TaskStatus) => {
    const newFilters = statusFilters.includes(status)
      ? statusFilters.filter(s => s !== status)
      : [...statusFilters, status]
    
    setStatusFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filter changes
    router.push(`/tasks?status=${newFilters.join(',')}`)
  }

  const handleEmployeeFilter = (employeeId: string) => {
    setSelectedEmployee(employeeId)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilters.includes(task.status as TaskStatus)
    const employeeMatch = selectedEmployee === 'all' || task.assigned_to === selectedEmployee
    return statusMatch && employeeMatch
  })

  // Pagination calculations
  const totalFilteredTasks = filteredTasks.length
  const totalPages = Math.ceil(totalFilteredTasks / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

  // Calculate statistics
  const totalTasks = tasks.length
  const openTasks = tasks.filter(t => t.status === 'OPEN').length
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length
  const overdueTasks = tasks.filter(t => t.due_date && isOverdue(t.due_date) && t.status !== 'COMPLETED').length

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />
      case 'IN_PROGRESS':
        return <Loader className="w-4 h-4 animate-spin" />
      case 'OPEN':
        return <Circle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-300 shadow-sm'
      case 'IN_PROGRESS':
        return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-300 shadow-sm'
      case 'OPEN':
        return 'bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border-indigo-300 shadow-sm'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  const getStatusDropdownColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'border-emerald-400 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-100 text-emerald-800'
      case 'IN_PROGRESS':
        return 'border-amber-400 focus:ring-amber-500 focus:border-amber-500 bg-amber-100 text-amber-800'
      case 'OPEN':
        return 'border-indigo-400 focus:ring-indigo-500 focus:border-indigo-500 bg-indigo-100 text-indigo-800'
      default:
        return 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-3 md:space-y-4 px-0 md:px-0 pb-8">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-3 px-4 md:px-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tasks Management
          </h1>
          <p className="mt-0.5 text-xs md:text-sm text-gray-600">
            {isCEO ? 'Manage all organization tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isCEO && (
          <Button onClick={() => setShowAssignModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 touch-target w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Statistics - Compact Single Row for Mobile, Cards for Desktop */}
      
      {/* Mobile: Compact Single Row */}
      <div className="md:hidden px-4">
        <Card className="bg-white border border-gray-200 shadow-sm p-2">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto hide-scrollbar-mobile">
            {/* Total */}
            <div className="flex flex-col items-center min-w-[55px]">
              <Clock className="w-3.5 h-3.5 text-blue-600 mb-0.5" />
              <p className="text-lg font-bold text-gray-900">{totalTasks}</p>
              <p className="text-[9px] text-gray-600 font-medium">Total</p>
            </div>
            
            <div className="h-8 w-px bg-gray-200" />
            
            {/* Open */}
            <div className="flex flex-col items-center min-w-[55px]">
              <Circle className="w-3.5 h-3.5 text-indigo-600 mb-0.5" />
              <p className="text-lg font-bold text-gray-900">{openTasks}</p>
              <p className="text-[9px] text-gray-600 font-medium">Open</p>
            </div>
            
            <div className="h-8 w-px bg-gray-200" />
            
            {/* In Progress */}
            <div className="flex flex-col items-center min-w-[55px]">
              <Loader className="w-3.5 h-3.5 text-amber-600 mb-0.5" />
              <p className="text-lg font-bold text-gray-900">{inProgressTasks}</p>
              <p className="text-[9px] text-gray-600 font-medium">Progress</p>
            </div>
            
            <div className="h-8 w-px bg-gray-200" />
            
            {/* Completed */}
            <div className="flex flex-col items-center min-w-[55px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mb-0.5" />
              <p className="text-lg font-bold text-gray-900">{completedTasks}</p>
              <p className="text-[9px] text-gray-600 font-medium">Done</p>
            </div>
            
            <div className="h-8 w-px bg-gray-200" />
            
            {/* Overdue */}
            <div className="flex flex-col items-center min-w-[55px]">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 mb-0.5" />
              <p className="text-lg font-bold text-gray-900">{overdueTasks}</p>
              <p className="text-[9px] text-gray-600 font-medium">Overdue</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Desktop: Original Card Grid */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all md:hover:scale-[1.03] hover:from-blue-600 hover:to-blue-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-semibold">Total Tasks</p>
              <p className="text-2xl font-bold mt-0.5">{totalTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-1.5">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-all md:hover:scale-[1.03] hover:from-indigo-600 hover:to-indigo-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-xs font-semibold">Open</p>
              <p className="text-2xl font-bold mt-0.5">{openTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-1.5">
              <Circle className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all md:hover:scale-[1.03] hover:from-amber-600 hover:to-orange-600 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-xs font-semibold">In Progress</p>
              <p className="text-2xl font-bold mt-0.5">{inProgressTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-1.5">
              <Loader className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all md:hover:scale-[1.03] hover:from-emerald-600 hover:to-green-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-semibold">Completed</p>
              <p className="text-2xl font-bold mt-0.5">{completedTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-1.5">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all md:hover:scale-[1.03] hover:from-rose-600 hover:to-red-700 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-xs font-semibold">Overdue</p>
              <p className="text-2xl font-bold mt-0.5">{overdueTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-1.5">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters - Mobile: Side by Side Dropdowns, Desktop: Status Buttons + Employee Dropdown */}
      <div className="px-4 md:px-0">
        <Card className="bg-white border border-gray-200 shadow-sm p-3">
          {/* Mobile View - Side by Side Dropdowns */}
          <div className="lg:hidden">
            <div className={`grid gap-3 ${isCEO && employees.length > 0 ? 'grid-cols-[1.5fr,1fr]' : 'grid-cols-1'}`}>
              {/* Status Filter Dropdown - Mobile */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-indigo-100 rounded">
                    <Filter className="w-3 h-3 text-indigo-600" />
                  </div>
                  <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">STATUS</span>
                </div>
                <select
                  value={
                    statusFilters.length === 3 ? 'all' :
                    statusFilters.length === 2 && statusFilters.includes('OPEN') && statusFilters.includes('IN_PROGRESS') ? 'active' :
                    statusFilters.length === 1 ? statusFilters[0] : 'active'
                  }
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === 'all') {
                      setStatusFilters(['OPEN', 'IN_PROGRESS', 'COMPLETED'])
                    } else if (value === 'active') {
                      setStatusFilters(['OPEN', 'IN_PROGRESS'])
                    } else {
                      setStatusFilters([value as TaskStatus])
                    }
                    setCurrentPage(1)
                    router.push(`/tasks?status=${value === 'all' ? 'OPEN,IN_PROGRESS,COMPLETED' : value === 'active' ? 'OPEN,IN_PROGRESS' : value}`)
                  }}
                  className="w-full text-sm font-semibold px-3 py-2.5 border-2 border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-600 bg-gradient-to-br from-indigo-50 to-white text-gray-800 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%234F46E5' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  <option value="active">Active (Open + Progress)</option>
                  <option value="all">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Employee Filter Dropdown - Mobile (CEO Only) */}
              {isCEO && employees.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 bg-purple-100 rounded">
                      <Users className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">EMPLOYEE</span>
                  </div>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeFilter(e.target.value)}
                    className="w-full text-sm font-semibold px-3 py-2.5 border-2 border-purple-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-600 bg-gradient-to-br from-purple-50 to-white text-gray-800 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239333EA' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                  >
                    <option value="all">All Employees</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Desktop View - Status Buttons + Employee Dropdown */}
          <div className="hidden lg:flex flex-row gap-6">
            {/* Status Filter Section */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Filter by status:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TASK_STATUSES.map(status => {
                  const isActive = statusFilters.includes(status)
                  return (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? status === 'COMPLETED'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm'
                            : status === 'IN_PROGRESS'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                            : 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {isActive && getStatusIcon(status)}
                      {status.replace('_', ' ')}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Employee Filter - Only for CEO */}
            {isCEO && employees.length > 0 && (
              <>
                <div className="w-px bg-gray-200"></div>
                <div className="flex flex-col gap-2 w-80">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Filter by employee:</span>
                  </div>
                  <select
                    value={selectedEmployee}
                    onChange={(e) => handleEmployeeFilter(e.target.value)}
                    className="w-full text-xs font-medium px-3 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-700 cursor-pointer transition-all duration-200 hover:border-purple-400"
                  >
                    <option value="all">All Employees</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Tasks Table/Cards - Mobile Responsive */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 md:border">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 mb-4 shadow-lg">
              <Clock className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {isCEO ? 'Create your first task to get started and manage your team\'s work efficiently.' : 'You have no tasks with the selected filters. Try adjusting your filters to see more tasks.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <thead className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-24">
                    Task ID
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-52">
                    Assigned To
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-56">
                    Due Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-white uppercase tracking-wider w-48">
                    <div className="flex items-center gap-2">
                      Status & Update
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTasks.map((task, index) => {
                  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'COMPLETED'
                  const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-gradient-to-r from-slate-50/50 to-gray-50/30'
                  
                  // Hover color based on status - overdue gets priority
                  const hoverColor = overdue
                    ? 'hover:bg-gradient-to-r hover:from-rose-50 hover:to-red-50/50'
                    : task.status === 'COMPLETED' 
                    ? 'hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50/50' 
                    : task.status === 'IN_PROGRESS' 
                    ? 'hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50/50' 
                    : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50/50'
                  
                  return (
                    <tr 
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className={`${rowColor} ${hoverColor} transition-all duration-300 group border-l-4 cursor-pointer ${
                        overdue 
                          ? 'border-l-rose-500' 
                          : task.status === 'COMPLETED' 
                          ? 'border-l-emerald-500' 
                          : task.status === 'IN_PROGRESS' 
                          ? 'border-l-amber-500' 
                          : 'border-l-indigo-500'
                      }`}
                    >
                      {/* Task Number */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-sm group-hover:shadow-md transition-all duration-300">
                          #{task.task_number}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors duration-200">
                              {task.title}
                            </span>
                            {overdue && (
                              <div className="flex items-center text-rose-600 bg-gradient-to-r from-rose-50 to-red-50 px-2.5 py-1 rounded-lg border-2 border-rose-200 shadow-sm animate-pulse">
                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                <span className="text-xs font-bold tracking-wide">OVERDUE</span>
                              </div>
                            )}
                          </div>
                          {task.details && (
                            <p className="text-xs text-gray-600 line-clamp-1">{task.details}</p>
                          )}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        {task.assigned_user ? (
                          <div className="flex items-center">
                            <div className="relative flex-shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-indigo-100 group-hover:ring-4 transition-all duration-300 overflow-hidden">
                              {task.assigned_user.profile_photo_url ? (
                                <Image
                                  src={task.assigned_user.profile_photo_url}
                                  alt={task.assigned_user.full_name}
                                  fill
                                  className="object-cover"
                                  unoptimized={task.assigned_user.profile_photo_url.includes('supabase')}
                                />
                              ) : (
                                <span>{task.assigned_user.full_name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                {task.assigned_user.full_name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic font-medium">Unassigned</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          {task.due_date ? (
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-2 shadow-sm transition-all duration-300 ${
                              overdue 
                                ? 'text-rose-700 bg-gradient-to-r from-rose-50 to-red-50 border-rose-300' 
                                : 'text-gray-700 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-300'
                            }`}>
                              <Clock className="w-3.5 h-3.5" />
                              <span className="whitespace-nowrap">Due: {formatDate(task.due_date)}</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic font-medium">No due date</span>
                          )}
                          {task.execution_date && (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border-2 shadow-sm transition-all duration-300 text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="whitespace-nowrap">Exec: {formatDate(task.execution_date)}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                            disabled={updatingTaskId === task.id}
                            className={`w-full text-xs font-bold px-3 py-2.5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none ${getStatusDropdownColor(task.status as TaskStatus)}`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundRepeat: 'no-repeat',
                              backgroundSize: '1.5em 1.5em',
                              paddingRight: '2.5rem'
                            }}
                          >
                            {TASK_STATUSES.map(status => (
                              <option 
                                key={status} 
                                value={status} 
                                className="font-semibold py-2"
                                style={{
                                  backgroundColor: status === 'COMPLETED' ? '#d1fae5' : status === 'IN_PROGRESS' ? '#fef3c7' : '#ddd6fe',
                                  color: status === 'COMPLETED' ? '#065f46' : status === 'IN_PROGRESS' ? '#92400e' : '#4c1d95',
                                  padding: '8px'
                                }}
                              >
                                {status === 'COMPLETED' && '✓ '}
                                {status === 'IN_PROGRESS' && '⟳ '}
                                {status === 'OPEN' && '○ '}
                                {status.replace('_', ' ')}
                              </option>
                              ))}
                          </select>
                          {updatingTaskId === task.id && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                              <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Visible only on mobile */}
          <div className="md:hidden space-y-3 p-2">
            {paginatedTasks.map((task) => {
              const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'COMPLETED'
              
              return (
                <div key={task.id} className="p-4 bg-white hover:bg-gray-50 transition-all cursor-pointer active:bg-gray-100 rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md" onClick={() => setSelectedTask(task)}>
                  {/* Task Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                          #{task.task_number}
                        </span>
                        {overdue && (
                          <span className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-xs font-semibold">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Overdue
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{task.title}</h3>
                      {task.details && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.details}</p>
                      )}
                    </div>
                  </div>

                  {/* Task Details */}
                  <div className="space-y-3 mb-4">
                    {/* Assigned To - Only show for CEO */}
                    {isCEO && task.assigned_user && (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                          {task.assigned_user.profile_photo_url ? (
                            <Image
                              src={task.assigned_user.profile_photo_url}
                              alt={task.assigned_user.full_name}
                              fill
                              className="object-cover"
                              unoptimized={task.assigned_user.profile_photo_url.includes('supabase')}
                            />
                          ) : (
                            <span>{task.assigned_user.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {task.assigned_user.full_name}
                        </span>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.due_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className={`text-xs font-semibold ${
                          overdue ? 'text-rose-700' : 'text-gray-700'
                        }`}>
                          Due: {formatDate(task.due_date)}
                        </span>
                      </div>
                    )}

                    {/* Execution Date */}
                    {task.execution_date && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-700">
                          Exec: {formatDate(task.execution_date)}
                        </span>
                      </div>
                    )}

                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusUpdate(task.id, e.target.value as TaskStatus)
                        }}
                        disabled={updatingTaskId === task.id}
                        className={`w-full text-[10px] font-bold px-2 py-1.5 border-2 rounded-md focus:outline-none focus:ring-2 transition-all disabled:opacity-50 appearance-none ${getStatusDropdownColor(task.status as TaskStatus)}`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.3rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.2em 1.2em',
                          paddingRight: '1.8rem'
                        }}
                      >
                        {TASK_STATUSES.map(status => (
                          <option 
                            key={status} 
                            value={status} 
                            className="font-semibold py-2"
                            style={{
                              backgroundColor: status === 'COMPLETED' ? '#d1fae5' : status === 'IN_PROGRESS' ? '#fef3c7' : '#ddd6fe',
                              color: status === 'COMPLETED' ? '#065f46' : status === 'IN_PROGRESS' ? '#92400e' : '#4c1d95',
                              padding: '8px'
                            }}
                          >
                            {status === 'COMPLETED' && '✓ '}
                            {status === 'IN_PROGRESS' && '⟳ '}
                            {status === 'OPEN' && '○ '}
                            {status.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                      {updatingTaskId === task.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                          <Loader className="w-4 h-4 animate-spin text-indigo-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
        )}
        
        {/* Pagination Controls - Mobile Optimized */}
        {totalFilteredTasks > 0 && totalPages > 1 && (
          <div className="px-3 md:px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-700">
              <span className="font-medium">
                Showing {startIndex + 1} - {Math.min(endIndex, totalFilteredTasks)} of {totalFilteredTasks} tasks
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all touch-target ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm font-medium rounded-md transition-all touch-target ${
                        currentPage === pageNumber
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-gray-500 px-0.5 md:px-1 text-xs md:text-sm">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-7 h-7 md:w-8 md:h-8 text-xs md:text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 touch-target"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-2 md:px-3 py-1.5 text-xs md:text-sm font-medium rounded-md transition-all touch-target ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter-Based Statistics Section */}
      {filteredTasks.length > 0 && (
        <div className="mb-6">
          <div className="bg-white rounded-lg md:rounded-xl shadow-md md:shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 md:px-6 md:py-3">
              <h3 className="text-sm md:text-lg font-bold text-white flex items-center gap-1.5 md:gap-2">
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5" />
                Filtered Statistics
              </h3>
              <p className="text-[10px] md:text-sm text-indigo-100 mt-0.5 md:mt-1">
                Based on current filter selection
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="p-2 md:p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4">
                {/* Total Filtered Tasks */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-2 md:p-4 border border-gray-300 md:border-2 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 md:p-2 bg-gray-600 rounded-md md:rounded-lg">
                      <Clipboard className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-sm font-medium text-gray-600 mb-0.5 md:mb-1">Filtered Total</p>
                  <p className="text-lg md:text-3xl font-bold text-gray-800">{filteredTasks.length}</p>
                </div>

                {/* Filtered Open Tasks */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg md:rounded-xl p-2 md:p-4 border border-indigo-300 md:border-2 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 md:p-2 bg-indigo-600 rounded-md md:rounded-lg">
                      <Circle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-sm font-medium text-indigo-600 mb-0.5 md:mb-1">Open</p>
                  <p className="text-lg md:text-3xl font-bold text-indigo-700">
                    {filteredTasks.filter(t => t.status === 'OPEN').length}
                  </p>
                </div>

                {/* Filtered In Progress Tasks */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg md:rounded-xl p-2 md:p-4 border border-amber-300 md:border-2 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 md:p-2 bg-amber-600 rounded-md md:rounded-lg">
                      <Clock className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-sm font-medium text-amber-600 mb-0.5 md:mb-1">In Progress</p>
                  <p className="text-lg md:text-3xl font-bold text-amber-700">
                    {filteredTasks.filter(t => t.status === 'IN_PROGRESS').length}
                  </p>
                </div>

                {/* Filtered Completed Tasks */}
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg md:rounded-xl p-2 md:p-4 border border-emerald-300 md:border-2 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 md:p-2 bg-emerald-600 rounded-md md:rounded-lg">
                      <CheckCircle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-sm font-medium text-emerald-600 mb-0.5 md:mb-1">Completed</p>
                  <p className="text-lg md:text-3xl font-bold text-emerald-700">
                    {filteredTasks.filter(t => t.status === 'COMPLETED').length}
                  </p>
                </div>

                {/* Filtered Overdue Tasks */}
                <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg md:rounded-xl p-2 md:p-4 border border-rose-300 md:border-2 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <div className="p-1 md:p-2 bg-rose-600 rounded-md md:rounded-lg">
                      <AlertCircle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-[9px] md:text-sm font-medium text-rose-600 mb-0.5 md:mb-1">Overdue</p>
                  <p className="text-lg md:text-3xl font-bold text-rose-700">
                    {filteredTasks.filter(t => t.due_date && isOverdue(t.due_date) && t.status !== 'COMPLETED').length}
                  </p>
                </div>
              </div>

              {/* Active Filters Display */}
              <div className="mt-2 pt-2 md:mt-4 md:pt-4 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  <span className="text-[10px] md:text-sm font-semibold text-gray-600">Active Filters:</span>
                  
                  {/* Status Filter Badge */}
                  {statusFilters.length > 0 && statusFilters.length < TASK_STATUSES.length && (
                    <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 bg-indigo-100 text-indigo-700 rounded-md md:rounded-lg text-[9px] md:text-xs font-semibold border border-indigo-200">
                      <Filter className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      Status: {statusFilters.map(s => s.replace('_', ' ')).join(', ')}
                    </div>
                  )}
                  
                  {/* Employee Filter Badge */}
                  {selectedEmployee !== 'all' && isCEO && (
                    <div className="inline-flex items-center gap-1 md:gap-1.5 px-2 py-1 md:px-3 md:py-1.5 bg-purple-100 text-purple-700 rounded-md md:rounded-lg text-[9px] md:text-xs font-semibold border border-purple-200">
                      <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      Employee: {employees.find(e => e.id === selectedEmployee)?.full_name || 'Unknown'}
                    </div>
                  )}
                  
                  {/* No Filters Applied */}
                  {statusFilters.length === TASK_STATUSES.length && selectedEmployee === 'all' && (
                    <span className="text-[9px] md:text-sm text-gray-500 italic">No filters applied (showing all tasks)</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => {
            setSelectedTask(null)
            setIsEditMode(false)
            setTaskComment('')
          }}
          title={isEditMode ? 'Edit Task' : 'Task Details'}
          size="lg"
        >
          {!isEditMode ? (
            // View Mode
            <div className="space-y-6">
              {/* Task Header */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-mono font-bold bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg">
                    #{selectedTask.task_number}
                  </span>
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 shadow-lg ${getStatusColor(selectedTask.status as TaskStatus)}`}>
                    {getStatusIcon(selectedTask.status as TaskStatus)}
                    <span className="tracking-wide">{selectedTask.status.replace('_', ' ')}</span>
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
                {selectedTask.due_date && isOverdue(selectedTask.due_date) && selectedTask.status !== 'COMPLETED' && (
                  <div className="flex items-center text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">This task is overdue!</span>
                  </div>
                )}
              </div>

              {/* Task Details */}
              {selectedTask.details && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <div className="w-1 h-4 bg-indigo-600 rounded"></div>
                    Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedTask.details}</p>
                </div>
              )}

              {/* Task Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedTask.assigned_user && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Assigned To</h4>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-semibold overflow-hidden">
                        {selectedTask.assigned_user.profile_photo_url ? (
                          <Image
                            src={selectedTask.assigned_user.profile_photo_url}
                            alt={selectedTask.assigned_user.full_name}
                            fill
                            className="object-cover"
                            unoptimized={selectedTask.assigned_user.profile_photo_url.includes('supabase')}
                          />
                        ) : (
                          <span>{selectedTask.assigned_user.full_name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedTask.assigned_user.full_name}</p>
                        <p className="text-xs text-gray-600">{selectedTask.assigned_user.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTask.created_user && (
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-2">Created By</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                        {selectedTask.created_user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedTask.created_user.full_name}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTask.due_date && (
                  <div className={`rounded-lg p-4 border ${
                    isOverdue(selectedTask.due_date) && selectedTask.status !== 'COMPLETED'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-green-50 border-green-200'
                  }`}>
                    <h4 className={`text-xs font-semibold uppercase tracking-wide mb-2 ${
                      isOverdue(selectedTask.due_date) && selectedTask.status !== 'COMPLETED'
                        ? 'text-red-700'
                        : 'text-green-700'
                    }`}>
                      Due Date
                    </h4>
                    <p className={`text-sm font-semibold ${
                      isOverdue(selectedTask.due_date) && selectedTask.status !== 'COMPLETED'
                        ? 'text-red-900'
                        : 'text-gray-900'
                    }`}>
                      {formatDate(selectedTask.due_date)}
                    </p>
                  </div>
                )}

                {selectedTask.execution_date && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Execution Date</h4>
                    <p className="text-sm font-semibold text-gray-900">{formatDate(selectedTask.execution_date)}</p>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Created On</h4>
                  <p className="text-sm font-semibold text-gray-900">{formatDate(selectedTask.created_at)}</p>
                </div>
              </div>

              {/* Comment Section - For Non-CEO Assigned Employees */}
              {!isCEO && selectedTask.assigned_to === user.id && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-5 border-2 border-amber-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-amber-600 rounded"></div>
                    Add Your Comment
                  </h4>
                  <Textarea
                    value={taskComment}
                    onChange={(e) => setTaskComment(e.target.value)}
                    placeholder="Share updates, progress notes, or any comments about this task..."
                    rows={4}
                    className="border-amber-300 focus:border-amber-500 focus:ring-amber-500 mb-3"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={handleSaveComment}
                      isLoading={isSavingComment}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Comment
                    </Button>
                  </div>
                  {selectedTask.comment && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Previous Comment</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedTask.comment}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Comment Display - For CEO viewing tasks with comments */}
              {isCEO && selectedTask.comment && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border-2 border-blue-200">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded"></div>
                    Employee Comment
                  </h4>
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedTask.comment}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isCEO && (
                <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleDeleteTask}
                    isLoading={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEditTask}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdateTask} className="space-y-5">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Editing Task #{selectedTask.task_number}</strong> - Update any field below and save changes.
                </p>
              </div>

              <div className="space-y-1">
                <Input
                  label="Task Title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  placeholder="Enter a clear and concise task title"
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <Textarea
                  label="Task Details"
                  value={editForm.details}
                  onChange={(e) => setEditForm({ ...editForm, details: e.target.value })}
                  placeholder="Provide detailed description of the task requirements..."
                  rows={4}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="Assign To"
                  value={editForm.assigned_to}
                  onChange={(e) => setEditForm({ ...editForm, assigned_to: e.target.value })}
                  required
                  options={[
                    { value: '', label: 'Select an employee' },
                    ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                  ]}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="Status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TaskStatus })}
                  required
                  options={TASK_STATUSES.map(status => ({
                    value: status,
                    label: status.replace('_', ' ')
                  }))}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Input
                    type="date"
                    label="Due Date (Optional)"
                    value={editForm.due_date}
                    onChange={(e) => setEditForm({ ...editForm, due_date: e.target.value })}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Target completion date</p>
                </div>

                <div className="space-y-1">
                  <Input
                    type="date"
                    label="Execution Date (Optional)"
                    value={editForm.execution_date}
                    onChange={(e) => setEditForm({ ...editForm, execution_date: e.target.value })}
                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Date when the task should be executed</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isUpdating}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Assign Task Modal */}
      {isCEO && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign New Task"
          size="lg"
        >
          <form onSubmit={handleAssignTask} className="space-y-5">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 mb-4">
              <p className="text-sm text-gray-700">
                Create and assign a new task to team members. Fill in all required fields to proceed.
              </p>
            </div>

            <div className="space-y-1">
              <Input
                label="Task Title"
                value={assignForm.title}
                onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                required
                placeholder="Enter a clear and concise task title"
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <Textarea
                label="Task Details"
                value={assignForm.details}
                onChange={(e) => setAssignForm({ ...assignForm, details: e.target.value })}
                placeholder="Provide detailed description of the task requirements and expectations..."
                rows={4}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <Select
                label="Assign To"
                value={assignForm.assigned_to}
                onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
                required
                options={[
                  { value: '', label: 'Select an employee' },
                  ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                ]}
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Input
                  type="date"
                  label="Due Date (Optional)"
                  value={assignForm.due_date}
                  onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Target completion date</p>
              </div>

              <div className="space-y-1">
                <Input
                  type="date"
                  label="Execution Date (Optional)"
                  value={assignForm.execution_date}
                  onChange={(e) => setAssignForm({ ...assignForm, execution_date: e.target.value })}
                  className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">Date when the task should be executed</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => setShowAssignModal(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                isLoading={isUpdating}
                className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Assign Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
