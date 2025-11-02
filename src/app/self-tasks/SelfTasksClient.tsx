'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Calendar, User, Filter, Clock, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react'
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
          visibility: 'PUBLIC', // All self tasks are visible to CEO
          user_id: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to save self task')

      showToast('success', editingTask ? 'Self task updated' : 'Self task logged successfully')
      setForm({ task_date: getToday(), details: '' })
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
    })
    setIsModalOpen(true)
  }

  const filteredTasks = selfTasks
    .filter(task => {
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
    .sort((a, b) => {
      // Sort by created_at in descending order (latest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

  return (
    <div className="space-y-4 md:space-y-5 pb-20 px-2 md:px-0">
      {/* Compact Enhanced Header Section with Stats */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 -mx-2 md:-mx-6 md:-mt-6 px-3 md:px-6 py-4 md:py-5 mb-4 md:mb-5 rounded-b-2xl md:rounded-b-3xl shadow-2xl relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                <div className="bg-white/20 backdrop-blur-sm p-1.5 md:p-2 rounded-lg md:rounded-xl">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-tight">
                  Self Task Logging
                </h1>
              </div>
              <p className="text-xs md:text-sm text-blue-50 max-w-2xl leading-snug">
                {isCEO ? '📊 Monitor team productivity and daily achievements' : '✨ Document your daily wins and track your journey'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="!bg-white !text-blue-700 hover:!bg-blue-50 shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold touch-target flex-1 md:flex-none !px-4 md:!px-5 !py-2 md:!py-2.5 hover:scale-105"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                <span className="text-sm md:text-base">Log New Task</span>
              </Button>
            </div>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-4">
            <div className="bg-white/15 backdrop-blur-md rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-md">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-white">{selfTasks.length}</div>
                  <div className="text-[10px] md:text-xs text-blue-100">Total Tasks</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-md rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-md">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-white">{filteredTasks.length}</div>
                  <div className="text-[10px] md:text-xs text-blue-100">Filtered</div>
                </div>
              </div>
            </div>

            {isCEO && (
              <div className="bg-white/15 backdrop-blur-md rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-md">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg md:text-xl font-bold text-white">{employees.length}</div>
                    <div className="text-[10px] md:text-xs text-blue-100">Employees</div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/15 backdrop-blur-md rounded-lg md:rounded-xl p-2.5 md:p-3 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-md">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg md:text-xl font-bold text-white">
                    {selfTasks.filter(t => t.task_date === getToday()).length}
                  </div>
                  <div className="text-[10px] md:text-xs text-blue-100">Today</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="border-l-4 border-blue-500 shadow-lg hover:shadow-xl transition-shadow duration-300 [&>div]:!p-3 md:[&>div]:!p-6">
        <div className="space-y-4 md:space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-md">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Smart Filters</h3>
                <p className="text-xs text-gray-500">Refine your task view</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-4 md:px-5 py-2.5 border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm md:text-base font-bold text-blue-700">
                  {filteredTasks.length} Task{filteredTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* CEO Employee Filter */}
            {isCEO && employees.length > 0 && (
              <div className="space-y-2 group">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <User className="w-4 h-4 text-blue-600" />
                  Employee
                </label>
                <Select
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                  options={[
                    { value: '', label: '👥 All Employees' },
                    ...employees.map(emp => ({ value: emp.id, label: `👤 ${emp.full_name}` }))
                  ]}
                />
              </div>
            )}

            {/* Date Range Filters */}
            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-green-600" />
                From Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="space-y-2 group">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-purple-600" />
                To Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="transition-all duration-200 focus:ring-2 focus:ring-purple-500"
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
                className="hover:scale-105 transition-transform duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Enhanced Tasks List */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl shadow-md">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Logged Tasks
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">Your productivity timeline</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl px-4 py-2 border border-gray-200">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-blue-50/30 hover:shadow-lg transition-all duration-300 [&>div]:!p-3 md:[&>div]:!p-6">
              <div className="text-center py-12 md:py-20">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-gray-800 text-xl font-bold mb-2">No tasks found</h3>
                <p className="text-gray-600 text-base mb-2">
                  {(startDate || endDate || filterUserId) 
                    ? 'Try adjusting your filters' 
                    : 'Start logging your daily tasks'}
                </p>
                <p className="text-gray-500 text-sm mb-8">Track your progress and achievements</p>
                {!isCEO && !(startDate || endDate || filterUserId) && (
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="hover:scale-105 transition-transform duration-200"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Log Your First Task
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredTasks.map((task, index) => {
              const canEdit = task.user_id === user.id
              const isToday = task.task_date === getToday()

              return (
                <Card 
                  key={task.id} 
                  className="hover:shadow-2xl transition-all duration-300 border-l-4 hover:border-l-blue-500 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 group [&>div]:!p-3 md:[&>div]:!p-6"
                >
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex justify-between items-start gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Enhanced Header Row */}
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap mb-3 md:mb-4">
                          <div className={`flex items-center gap-1.5 md:gap-2 ${isToday ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-300' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-lg md:rounded-xl px-2.5 md:px-4 py-1.5 md:py-2 shadow-sm`}>
                            <Calendar className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isToday ? 'text-green-600' : 'text-blue-600'}`} />
                            <span className={`text-xs md:text-sm font-bold ${isToday ? 'text-green-800' : 'text-gray-900'}`}>
                              {formatDate(task.task_date)}
                            </span>
                            {isToday && (
                              <span className="ml-1 md:ml-2 bg-green-600 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 rounded-full font-semibold animate-pulse">
                                Today
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Enhanced Employee Name for CEO */}
                        {isCEO && task.user && (
                          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl p-2 md:p-3 border border-blue-100">
                            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 md:p-2 rounded-md md:rounded-lg shadow-md">
                              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] md:text-xs font-medium text-gray-600 block">Employee</span>
                              <span className="text-xs md:text-sm text-gray-900 font-bold">{task.user.full_name}</span>
                            </div>
                          </div>
                        )}

                        {/* Enhanced Task Details */}
                        <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg md:rounded-xl p-3 md:p-5 mb-3 md:mb-4 border border-gray-100 group-hover:border-blue-200 transition-colors duration-300">
                          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-xs md:text-base">
                            {task.details}
                          </p>
                        </div>

                        {/* Enhanced Footer */}
                        <div className="flex items-center gap-2 md:gap-3 text-xs">
                          <div className="flex items-center gap-1.5 md:gap-2 bg-gray-100 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg">
                            <Clock className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500" />
                            <span className="text-gray-600 font-medium text-[10px] md:text-xs">
                              {formatDateTime(task.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Action Buttons */}
                      {canEdit && (
                        <div className="flex gap-1.5 md:gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(task)}
                            className="hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md !p-2 md:!p-2.5"
                          >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(task.id)}
                            className="hover:bg-red-100 hover:scale-110 transition-all duration-200 shadow-sm hover:shadow-md !p-2 md:!p-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
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

      {/* Enhanced Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-full p-5 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 z-40 group animate-bounce-slow"
        aria-label="Log new task"
      >
        <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-xl">
          ✨ Log New Task
        </span>
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>

      {/* Enhanced Modal for Log/Edit Task */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setForm({ task_date: getToday(), details: '' })
        }}
        title={editingTask ? '✏️ Edit Self Task' : '✨ Log Self Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Task Date
                </label>
                <Input
                  type="date"
                  value={form.task_date}
                  onChange={(e) => setForm({ ...form, task_date: e.target.value })}
                  required
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Edit2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Task Details
                </label>
                <p className="text-xs text-gray-600 mb-3">
                  Share what you accomplished, challenges faced, or tasks completed
                </p>
              </div>
            </div>
            <Textarea
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              required
              placeholder="✍️ Describe what you worked on today..."
              rows={8}
              className="bg-white border-purple-200 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                setEditingTask(null)
                setForm({ task_date: getToday(), details: '' })
              }}
              className="hover:scale-105 transition-transform duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 transition-all duration-200"
            >
              {editingTask ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Update Task
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Log Task
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
