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
  const router = useRouter()
  const { showToast } = useToast()

  const isCEO = user.role.name === 'CEO'

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
    router.push(`/tasks?status=${newFilters.join(',')}`)
  }

  const filteredTasks = tasks.filter(task => statusFilters.includes(task.status as TaskStatus))

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
        return 'bg-green-50 text-green-700 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'OPEN':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tasks Management
          </h1>
          <p className="mt-1 text-gray-600">
            {isCEO ? 'Manage all organization tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isCEO && (
          <Button onClick={() => setShowAssignModal(true)} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
            <Plus className="w-5 h-5 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Tasks</p>
              <p className="text-3xl font-bold mt-1">{totalTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Clock className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Open</p>
              <p className="text-3xl font-bold mt-1">{openTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Circle className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">In Progress</p>
              <p className="text-3xl font-bold mt-1">{inProgressTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <Loader className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completed</p>
              <p className="text-3xl font-bold mt-1">{completedTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Overdue</p>
              <p className="text-3xl font-bold mt-1">{overdueTasks}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {TASK_STATUSES.map(status => {
            const isActive = statusFilters.includes(status)
            return (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? status === 'COMPLETED'
                      ? 'bg-green-600 text-white shadow-md'
                      : status === 'IN_PROGRESS'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
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
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-4">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">
              {isCEO ? 'Create your first task to get started' : 'You have no tasks with the selected filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Task ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task, index) => {
                  const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'COMPLETED'
                  const rowColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  
                  return (
                    <tr 
                      key={task.id} 
                      className={`${rowColor} hover:bg-indigo-50 transition-colors duration-150`}
                    >
                      {/* Task Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-semibold bg-indigo-100 text-indigo-800">
                          #{task.task_number}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                              {task.title}
                            </span>
                            {overdue && (
                              <div className="flex items-center text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                <span className="text-xs font-medium">Overdue</span>
                              </div>
                            )}
                          </div>
                          {task.details && (
                            <p className="text-xs text-gray-500 line-clamp-1">{task.details}</p>
                          )}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assigned_user ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold text-sm">
                              {task.assigned_user.full_name.charAt(0)}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {task.assigned_user.full_name}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.due_date ? (
                          <span className={`text-sm font-medium ${
                            overdue 
                              ? 'text-red-600 bg-red-50 px-3 py-1 rounded-full' 
                              : 'text-gray-700'
                          }`}>
                            {formatDate(task.due_date)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No due date</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(task.status as TaskStatus)}`}>
                            {getStatusIcon(task.status as TaskStatus)}
                            {task.status.replace('_', ' ')}
                          </span>
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                            disabled={isUpdating}
                            className="text-xs px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Eye className="w-4 h-4" />
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
