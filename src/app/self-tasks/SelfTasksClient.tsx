'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, User, Filter } from 'lucide-react'
import { SelfTask } from '@/lib/types'
import { formatDate, formatDateTime, getToday } from '@/lib/utils/date'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'

interface SelfTasksClientProps {
  user: {
    id: string
    full_name: string
    role: { name: string }
  }
  selfTasks: SelfTask[]
  employees: Array<{ id: string; full_name: string }>
}

export default function SelfTasksClient({ user, selfTasks, employees }: SelfTasksClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTask, setEditingTask] = useState<SelfTask | null>(null)
  const [filterUserId, setFilterUserId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()
  const { showToast } = useToast()

  const isCEO = user.role.name === 'CEO'

  const [form, setForm] = useState({
    task_date: getToday(),
    details: '',
    visibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingTask ? `/api/self-tasks/${editingTask.id}` : '/api/self-tasks'
      const method = editingTask ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_id: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to save self task')

      showToast('success', editingTask ? 'Self task updated' : 'Self task logged successfully')
      setForm({ task_date: getToday(), details: '', visibility: 'PUBLIC' })
      setEditingTask(null)
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to save self task')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this self task?')) return

    try {
      const response = await fetch(`/api/self-tasks/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('success', 'Self task deleted')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to delete self task')
    }
  }

  const handleEdit = (task: SelfTask) => {
    setEditingTask(task)
    setForm({
      task_date: task.task_date,
      details: task.details,
      visibility: task.visibility as 'PUBLIC' | 'PRIVATE',
    })
    setIsModalOpen(true)
  }

  const filteredTasks = selfTasks.filter(task => {
    // Filter by user ID (for CEO)
    if (filterUserId && task.user_id !== filterUserId) {
      return false
    }
    
    // Filter by date range
    if (startDate && task.task_date < startDate) {
      return false
    }
    if (endDate && task.task_date > endDate) {
      return false
    }
    
    return true
  })

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-6 -mt-6 px-6 py-8 mb-6 rounded-b-2xl shadow-lg">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Self Task Logging</h1>
            <p className="mt-2 text-blue-100">
              {isCEO ? 'View all employee self-logged tasks' : 'Track your daily tasks and accomplishments'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="!bg-white !text-blue-700 hover:!bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log New Task
            </Button>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 text-white">
                <div className="text-2xl font-bold">{selfTasks.length}</div>
                <div className="text-sm text-blue-100">Total Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-l-4 border-blue-500">
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-900">Filters</span>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-2">
              <span className="text-sm font-medium text-blue-700">
                {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CEO Employee Filter */}
            {isCEO && employees.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Employee</label>
                <Select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  options={[
                    { value: '', label: 'All Employees' },
                    ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                  ]}
                />
              </div>
            )}

            {/* Date Range Filters */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">From Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">To Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(startDate || endDate || filterUserId) && (
            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                  setFilterUserId('')
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Self Tasks List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Logged Tasks
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300">
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg mb-2">No self tasks logged yet</p>
                <p className="text-gray-500 text-sm mb-6">Start logging your daily tasks to track your progress</p>
                {!isCEO && (
                  <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Your First Task
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredTasks.map(task => {
              const canEdit = task.user_id === user.id

              return (
                <Card 
                  key={task.id} 
                  className="hover:shadow-xl transition-all duration-200 border-l-4 hover:border-l-blue-500"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Header Row */}
                        <div className="flex items-center gap-3 flex-wrap mb-3">
                          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-semibold text-gray-900">
                              {formatDate(task.task_date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.visibility === 'PRIVATE' ? (
                              <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5">
                                <EyeOff className="w-4 h-4 text-gray-600" />
                                <Badge status={task.visibility} />
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 bg-green-50 rounded-lg px-3 py-1.5">
                                <Eye className="w-4 h-4 text-green-600" />
                                <Badge status={task.visibility} />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Employee Name for CEO */}
                        {isCEO && task.user && (
                          <div className="flex items-center gap-2 mb-3 text-sm">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-700">Employee:</span>
                            <span className="text-gray-900 font-semibold">{task.user.full_name}</span>
                          </div>
                        )}

                        {/* Task Details */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                            {task.details}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="bg-gray-100 px-2 py-1 rounded">
                            Logged on {formatDateTime(task.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {canEdit && (
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(task)}
                            className="hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(task.id)}
                            className="hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-200 z-40 group"
        aria-label="Log new task"
      >
        <Plus className="w-6 h-6" />
        <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Log New Task
        </span>
      </button>

      {/* Modal for Log/Edit Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setForm({ task_date: getToday(), details: '', visibility: 'PUBLIC' })
        }}
        title={editingTask ? 'Edit Self Task' : 'Log Self Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={form.task_date}
              onChange={(e) => setForm({ ...form, task_date: e.target.value })}
              required
            />

            <Select
              label="Visibility"
              value={form.visibility}
              onChange={(e) => setForm({ ...form, visibility: e.target.value as 'PUBLIC' | 'PRIVATE' })}
              options={[
                { value: 'PUBLIC', label: 'Public (visible to CEO)' },
                { value: 'PRIVATE', label: 'Private (only you)' },
              ]}
            />
          </div>

          <Textarea
            label="Task Details"
            value={form.details}
            onChange={(e) => setForm({ ...form, details: e.target.value })}
            required
            placeholder="Describe what you worked on today..."
            rows={6}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingTask(null)
                setForm({ task_date: getToday(), details: '', visibility: 'PUBLIC' })
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {editingTask ? 'Update Task' : 'Log Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
