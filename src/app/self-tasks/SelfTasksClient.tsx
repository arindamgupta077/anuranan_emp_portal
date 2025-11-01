'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { SelfTask } from '@/lib/types'
import { formatDate, formatDateTime, getToday } from '@/lib/utils/date'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredTasks = filterUserId
    ? selfTasks.filter(task => task.user_id === filterUserId)
    : selfTasks

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Self Task Logging</h1>
        <p className="mt-1 text-gray-600">
          {isCEO ? 'View all employee self-logged tasks' : 'Log your daily tasks and activities'}
        </p>
      </div>

      {/* Log Task Form */}
      <Card title={editingTask ? 'Edit Self Task' : 'Log Self Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            rows={4}
          />

          <div className="flex justify-end gap-3">
            {editingTask && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingTask(null)
                  setForm({ task_date: getToday(), details: '', visibility: 'PUBLIC' })
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {editingTask ? 'Update Task' : 'Log Task'}
            </Button>
          </div>
        </form>
      </Card>

      {/* CEO Filter */}
      {isCEO && employees.length > 0 && (
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Employee:</label>
            <Select
              value={filterUserId}
              onChange={(e) => setFilterUserId(e.target.value)}
              options={[
                { value: '', label: 'All Employees' },
                ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
              ]}
              className="max-w-xs"
            />
          </div>
        </Card>
      )}

      {/* Self Tasks List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Logged Tasks ({filteredTasks.length})
        </h2>
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600">No self tasks logged yet</p>
              </div>
            </Card>
          ) : (
            filteredTasks.map(task => {
              const canEdit = task.user_id === user.id

              return (
                <Card key={task.id} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(task.task_date)}
                          </span>
                          <Badge status={task.visibility} />
                          {task.visibility === 'PRIVATE' ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        {isCEO && task.user && (
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Employee:</span> {task.user.full_name}
                          </div>
                        )}
                        <p className="text-gray-700 whitespace-pre-wrap">{task.details}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Logged on {formatDateTime(task.created_at)}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(task)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(task.id)}
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
    </div>
  )
}
