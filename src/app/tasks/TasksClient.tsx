'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Filter, AlertCircle, Clock } from 'lucide-react'
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="mt-1 text-gray-600">
            {isCEO ? 'Manage all organization tasks' : 'View and update your assigned tasks'}
          </p>
        </div>
        {isCEO && (
          <Button onClick={() => setShowAssignModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Assign Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {TASK_STATUSES.map(status => (
            <button
              key={status}
              onClick={() => toggleStatusFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                statusFilters.includes(status)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600">
                {isCEO ? 'Create your first task to get started' : 'You have no tasks with the selected filters'}
              </p>
            </div>
          </Card>
        ) : (
          filteredTasks.map(task => {
            const overdue = task.due_date && isOverdue(task.due_date) && task.status !== 'COMPLETED'
            
            return (
              <Card key={task.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-mono text-gray-500">#{task.task_number}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                          {overdue && (
                            <div className="flex items-center text-red-600">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <span className="text-xs font-medium">Overdue</span>
                            </div>
                          )}
                        </div>
                        {task.details && (
                          <p className="mt-2 text-gray-600 text-sm">{task.details}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      {task.assigned_user && (
                        <div>
                          <span className="font-medium">Assigned to:</span> {task.assigned_user.full_name}
                        </div>
                      )}
                      {task.due_date && (
                        <div className={overdue ? 'text-red-600 font-medium' : ''}>
                          <span className="font-medium">Due:</span> {formatDate(task.due_date)}
                        </div>
                      )}
                      {task.created_user && (
                        <div>
                          <span className="font-medium">Created by:</span> {task.created_user.full_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3">
                    <Badge status={task.status} />
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusUpdate(task.id, e.target.value as TaskStatus)}
                      disabled={isUpdating}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {TASK_STATUSES.map(status => (
                        <option key={status} value={status}>
                          {status.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedTask(task)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`Task #${selectedTask.task_number}`}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{selectedTask.title}</h3>
              <Badge status={selectedTask.status} className="mt-2" />
            </div>

            {selectedTask.details && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Details</h4>
                <p className="text-gray-600">{selectedTask.details}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {selectedTask.assigned_user && (
                <div>
                  <h4 className="font-medium text-gray-700">Assigned To</h4>
                  <p className="text-gray-600">{selectedTask.assigned_user.full_name}</p>
                  <p className="text-gray-500 text-xs">{selectedTask.assigned_user.email}</p>
                </div>
              )}

              {selectedTask.created_user && (
                <div>
                  <h4 className="font-medium text-gray-700">Created By</h4>
                  <p className="text-gray-600">{selectedTask.created_user.full_name}</p>
                </div>
              )}

              {selectedTask.due_date && (
                <div>
                  <h4 className="font-medium text-gray-700">Due Date</h4>
                  <p className={`text-gray-600 ${isOverdue(selectedTask.due_date) && selectedTask.status !== 'COMPLETED' ? 'text-red-600 font-medium' : ''}`}>
                    {formatDate(selectedTask.due_date)}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-700">Created</h4>
                <p className="text-gray-600">{formatDate(selectedTask.created_at)}</p>
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
          <form onSubmit={handleAssignTask} className="space-y-4">
            <Input
              label="Task Title"
              value={assignForm.title}
              onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
              required
              placeholder="Enter task title"
            />

            <Textarea
              label="Task Details"
              value={assignForm.details}
              onChange={(e) => setAssignForm({ ...assignForm, details: e.target.value })}
              placeholder="Describe the task..."
              rows={4}
            />

            <Select
              label="Assign To"
              value={assignForm.assigned_to}
              onChange={(e) => setAssignForm({ ...assignForm, assigned_to: e.target.value })}
              required
              options={[
                { value: '', label: 'Select an employee' },
                ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
              ]}
            />

            <Input
              type="date"
              label="Due Date"
              value={assignForm.due_date}
              onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
              required
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isUpdating}>
                Assign Task
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
