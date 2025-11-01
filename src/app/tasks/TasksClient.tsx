'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, AlertCircle, Clock, Eye, CheckCircle, Circle, Loader } from 'lucide-react'
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
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>(['OPEN', 'IN_PROGRESS'])
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const { showToast } = useToast()

  const isCEO = user.role.name === 'CEO'
  const ITEMS_PER_PAGE = 50

  // Assign task form
  const [assignForm, setAssignForm] = useState({
    title: '',
    details: '',
    assigned_to: '',
    due_date: '',
  })

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setIsUpdating(true)
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
      setIsUpdating(false)
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
          created_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')

      showToast('success', 'Task assigned successfully')
      setShowAssignModal(false)
      setAssignForm({ title: '', details: '', assigned_to: '', due_date: '' })
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to assign task')
    } finally {
      setIsUpdating(false)
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

  const filteredTasks = tasks.filter(task => statusFilters.includes(task.status as TaskStatus))

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
        return <Loader className="w-4 h-4" />
      case 'OPEN':
        return <Circle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300'
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-300'
      case 'OPEN':
        return 'bg-indigo-50 text-indigo-700 border-indigo-300'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tasks Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-600">
            {isCEO ? 'Manage all organization tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isCEO && (
          <Button onClick={() => setShowAssignModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] hover:from-blue-600 hover:to-blue-700 p-2">
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

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] hover:from-indigo-600 hover:to-indigo-700 p-2">
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

        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] hover:from-amber-600 hover:to-orange-600 p-2">
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

        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] hover:from-emerald-600 hover:to-green-700 p-2">
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

        <Card className="bg-gradient-to-br from-rose-500 to-red-600 text-white border-0 shadow-sm hover:shadow-md transition-all hover:scale-[1.03] hover:from-rose-600 hover:to-red-700 p-2">
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

      {/* Filters */}
      <Card className="bg-white border border-gray-200 shadow-sm p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Filter by status:</span>
          {TASK_STATUSES.map(status => {
            const isActive = statusFilters.includes(status)
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
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
      </Card>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-3">
              <Clock className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No tasks found</h3>
            <p className="text-sm text-gray-600">
              {isCEO ? 'Create your first task to get started' : 'You have no tasks with the selected filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-slate-50 to-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Task ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {paginatedTasks.map((task, index) => {
                  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'COMPLETED'
                  const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  
                  // Hover color based on status - overdue gets priority
                  const hoverColor = overdue
                    ? 'hover:bg-rose-50/70'
                    : task.status === 'COMPLETED' 
                    ? 'hover:bg-emerald-50/70' 
                    : task.status === 'IN_PROGRESS' 
                    ? 'hover:bg-amber-50/70' 
                    : 'hover:bg-indigo-50/70'
                  
                  return (
                    <tr 
                      key={task.id} 
                      className={`${rowColor} ${hoverColor} transition-colors duration-200 group`}
                    >
                      {/* Task Number */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200">
                          #{task.task_number}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                              {task.title}
                            </span>
                            {overdue && (
                              <div className="flex items-center text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                <span className="text-xs font-semibold">Overdue</span>
                              </div>
                            )}
                          </div>
                          {task.details && (
                            <p className="text-xs text-gray-500 line-clamp-1">{task.details}</p>
                          )}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.assigned_user ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                              {task.assigned_user.full_name.charAt(0)}
                            </div>
                            <div className="ml-2">
                              <p className="text-sm font-medium text-gray-900">
                                {task.assigned_user.full_name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {task.due_date ? (
                          <span className={`text-xs font-semibold ${
                            overdue 
                              ? 'text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200' 
                              : 'text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200'
                          }`}>
                            {formatDate(task.due_date)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No due date</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(task.status as TaskStatus)}`}>
                            {getStatusIcon(task.status as TaskStatus)}
                            {task.status.replace('_', ' ')}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                            disabled={isUpdating}
                            className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-indigo-300"
                          >
                            {TASK_STATUSES.map(status => (
                              <option key={status} value={status}>
                                {status.replace('_', ' ')}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow group-hover:scale-105"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalFilteredTasks > 0 && totalPages > 1 && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">
                Showing {startIndex + 1} - {Math.min(endIndex, totalFilteredTasks)} of {totalFilteredTasks} tasks
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
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
                      className={`w-8 h-8 text-sm font-medium rounded-md transition-all ${
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
                    <span className="text-gray-500 px-1">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="w-8 h-8 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
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

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task Details`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Task Header */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-600 text-white">
                  #{selectedTask.task_number}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(selectedTask.status as TaskStatus)}`}>
                  {getStatusIcon(selectedTask.status as TaskStatus)}
                  {selectedTask.status.replace('_', ' ')}
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
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center text-white font-semibold">
                      {selectedTask.assigned_user.full_name.charAt(0)}
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

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Created On</h4>
                <p className="text-sm font-semibold text-gray-900">{formatDate(selectedTask.created_at)}</p>
              </div>
            </div>
          </div>
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

            <div className="space-y-1">
              <Input
                type="date"
                label="Due Date"
                value={assignForm.due_date}
                onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                required
                className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              />
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
