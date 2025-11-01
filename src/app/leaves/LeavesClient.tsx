'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, X, Edit2, Trash2, Calendar as CalendarIcon, Filter, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Leave, LeaveStatus } from '@/lib/types'
import { formatDate, calculateDuration } from '@/lib/utils/date'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'

interface LeavesClientProps {
  user: {
    id: string
    full_name: string
    role: { name: string }
  }
  leaves: Leave[]
  employees: Array<{ id: string; full_name: string }>
}

export default function LeavesClient({ user, leaves, employees }: LeavesClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null)
  const [filterStatus, setFilterStatus] = useState<LeaveStatus | ''>('')
  const [filterUserId, setFilterUserId] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showEmployeeStats, setShowEmployeeStats] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const router = useRouter()
  const { showToast } = useToast()

  const isCEO = user.role.name === 'CEO'

  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    reason: '',
  })

  const duration = form.start_date && form.end_date 
    ? calculateDuration(form.start_date, form.end_date) 
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (new Date(form.end_date) < new Date(form.start_date)) {
      showToast('error', 'End date must be after start date')
      return
    }

    setIsSubmitting(true)

    try {
      const url = editingLeave ? `/api/leaves/${editingLeave.id}` : '/api/leaves'
      const method = editingLeave ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_id: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to save leave')

      showToast('success', editingLeave ? 'Leave updated' : 'Leave requested successfully')
      setForm({ start_date: '', end_date: '', reason: '' })
      setEditingLeave(null)
      setIsModalOpen(false)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to save leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApprove = async (leaveId: string) => {
    if (!confirm('Approve this leave request?')) return

    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          approved_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to approve')

      showToast('success', 'Leave approved')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to approve leave')
    }
  }

  const handleReject = async (leaveId: string) => {
    if (!confirm('Reject this leave request?')) return

    try {
      const response = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          approved_by: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to reject')

      showToast('success', 'Leave rejected')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to reject leave')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return

    try {
      const response = await fetch(`/api/leaves/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete')

      showToast('success', 'Leave deleted')
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to delete leave')
    }
  }

  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave)
    setForm({
      start_date: leave.start_date,
      end_date: leave.end_date,
      reason: leave.reason || '',
    })
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingLeave(null)
    setForm({ start_date: '', end_date: '', reason: '' })
  }

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus && leave.status !== filterStatus) return false
    if (filterUserId && leave.user_id !== filterUserId) return false
    return true
  })

  // Calculate leave statistics
  const totalLeaveDays = leaves
    .filter(leave => leave.status === 'APPROVED' && leave.user_id === user.id)
    .reduce((sum, leave) => sum + calculateDuration(leave.start_date, leave.end_date), 0)

  const pendingLeaves = leaves.filter(leave => leave.status === 'PENDING' && (isCEO || leave.user_id === user.id))
  const approvedLeaves = leaves.filter(leave => leave.status === 'APPROVED' && (isCEO || leave.user_id === user.id))
  const rejectedLeaves = leaves.filter(leave => leave.status === 'REJECTED' && (isCEO || leave.user_id === user.id))

  // Employee leave statistics (CEO only)
  const employeeLeaveStats = useMemo(() => {
    if (!isCEO) return []
    
    return employees.map(employee => {
      const employeeLeaves = leaves.filter(leave => leave.user_id === employee.id && leave.status === 'APPROVED')
      const totalDays = employeeLeaves.reduce((sum, leave) => sum + calculateDuration(leave.start_date, leave.end_date), 0)
      const leaveCount = employeeLeaves.length
      
      return {
        id: employee.id,
        name: employee.full_name,
        totalDays,
        leaveCount
      }
    }).sort((a, b) => b.totalDays - a.totalDays)
  }, [isCEO, employees, leaves])

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateInLeave = (date: Date, leave: Leave) => {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    const start = new Date(leave.start_date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(leave.end_date)
    end.setHours(0, 0, 0, 0)
    return checkDate >= start && checkDate <= end
  }

  const getEmployeesOnLeave = (date: Date) => {
    return leaves
      .filter(leave => leave.status === 'APPROVED' && isDateInLeave(date, leave))
      .map(leave => ({
        ...leave,
        employeeName: employees.find(emp => emp.id === leave.user_id)?.full_name || 'Unknown'
      }))
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const calendarDays = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const employeesOnLeave = getEmployeesOnLeave(date)
      days.push({ date, day, employeesOnLeave })
    }

    return days
  }, [currentMonth, leaves, employees])

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-gray-600">
            {isCEO ? 'Manage employee leave requests' : 'Request and track your leaves'}
          </p>
        </div>
        
        {/* Statistics Cards - Moved to Corner */}
        <div className="flex flex-wrap gap-2">
          {!isCEO && (
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200 rounded-lg px-3 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs font-medium text-primary-600">Approved Days</p>
                  <p className="text-xl font-bold text-primary-900">{totalLeaveDays}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">⏳</span>
              </div>
              <div>
                <p className="text-xs font-medium text-yellow-700">Pending</p>
                <p className="text-xl font-bold text-yellow-900">{pendingLeaves.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-200 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-green-700">Approved</p>
                <p className="text-xl font-bold text-green-900">{approvedLeaves.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg px-3 py-2 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0">
                <X className="w-3 h-3 text-red-700" />
              </div>
              <div>
                <p className="text-xs font-medium text-red-700">Rejected</p>
                <p className="text-xl font-bold text-red-900">{rejectedLeaves.length}</p>
              </div>
            </div>
          </div>
          
          {!isCEO && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Request Leave
            </Button>
          )}
        </div>
      </div>

      {/* CEO-specific sections */}
      {isCEO && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar View */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Leave Calendar
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {showCalendar ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showCalendar && (
              <div className="pt-4 border-t border-gray-200">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <Button variant="ghost" size="sm" onClick={nextMonth}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {calendarDays.map((dayData, index) => {
                    if (!dayData) {
                      return <div key={`empty-${index}`} className="aspect-square" />
                    }

                    const { day, employeesOnLeave } = dayData
                    const isToday = new Date().toDateString() === dayData.date.toDateString()
                    const hasLeaves = employeesOnLeave.length > 0

                    return (
                      <div
                        key={index}
                        className={`
                          aspect-square border rounded-lg p-1 relative cursor-pointer
                          transition-all hover:shadow-md
                          ${isToday ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}
                          ${hasLeaves ? 'bg-red-50' : 'bg-white'}
                        `}
                        title={hasLeaves ? `${employeesOnLeave.length} employee(s) on leave` : ''}
                      >
                        <div className="text-xs font-medium text-gray-700 text-center">{day}</div>
                        {hasLeaves && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 rounded-b-lg" />
                        )}
                        {hasLeaves && employeesOnLeave.length <= 3 && (
                          <div className="mt-1 space-y-0.5">
                            {employeesOnLeave.map((leave, i) => (
                              <div 
                                key={i}
                                className="text-[8px] text-gray-600 truncate bg-white rounded px-0.5"
                                title={leave.employeeName}
                              >
                                {leave.employeeName.split(' ')[0]}
                              </div>
                            ))}
                          </div>
                        )}
                        {hasLeaves && employeesOnLeave.length > 3 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-red-700">
                              {employeesOnLeave.length}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-500 bg-primary-50 rounded" />
                    <span className="text-gray-600">Today</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-50 border border-red-500 rounded" />
                    <span className="text-gray-600">Has Leaves</span>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Employee Leave Statistics */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Employee Leave Stats
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmployeeStats(!showEmployeeStats)}
              >
                {showEmployeeStats ? 'Hide' : 'Show'}
              </Button>
            </div>
            
            {showEmployeeStats && (
              <div className="pt-4 border-t border-gray-200 max-h-96 overflow-y-auto">
                {employeeLeaveStats.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No employee data available</p>
                ) : (
                  <div className="space-y-3">
                    {employeeLeaveStats.map((stat, index) => (
                      <div 
                        key={stat.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{stat.name}</p>
                            <p className="text-xs text-gray-500">
                              {stat.leaveCount} {stat.leaveCount === 1 ? 'request' : 'requests'}
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary-600">{stat.totalDays}</p>
                            <p className="text-xs text-gray-500">days</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <Select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as LeaveStatus | '')}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />

            {isCEO && (
              <Select
                label="Filter by Employee"
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                options={[
                  { value: '', label: 'All Employees' },
                  ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                ]}
              />
            )}
          </div>
        )}
      </Card>

      {/* Leaves List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Leave Requests
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredLeaves.length} {filteredLeaves.length === 1 ? 'request' : 'requests'})
            </span>
          </h2>
        </div>
        
        <div className="space-y-3">
          {filteredLeaves.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium">No leave requests found</p>
                <p className="text-gray-500 text-sm mt-1">
                  {filterStatus || filterUserId 
                    ? 'Try adjusting your filters' 
                    : !isCEO ? 'Click "Request Leave" to submit your first request' : 'No requests to review'}
                </p>
              </div>
            </Card>
          ) : (
            filteredLeaves.map(leave => {
              const canEdit = leave.user_id === user.id && leave.status === 'PENDING'
              const canApprove = isCEO && leave.status === 'PENDING'
              const leaveDuration = calculateDuration(leave.start_date, leave.end_date)
              
              const borderColor = 
                leave.status === 'APPROVED' ? 'border-l-green-500' : 
                leave.status === 'REJECTED' ? 'border-l-red-500' : 
                'border-l-yellow-500'

              return (
                <Card key={leave.id} className={`hover:shadow-md transition-all duration-200 border-l-4 ${borderColor}`}>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Employee Name (for CEO) */}
                        {isCEO && leave.user && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                              {leave.user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-base font-semibold text-gray-900">
                              {leave.user.full_name}
                            </span>
                          </div>
                        )}
                        
                        {/* Date Range and Duration */}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(leave.start_date)} → {formatDate(leave.end_date)}</span>
                          </div>
                          <Badge status={leave.status} />
                          <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {leaveDuration} day{leaveDuration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        
                        {/* Reason */}
                        {leave.reason && (
                          <div className="bg-gray-50 rounded-md p-3 mb-2">
                            <p className="text-sm text-gray-700 italic">"{leave.reason}"</p>
                          </div>
                        )}
                        
                        {/* Approval Info */}
                        {leave.approved_at && leave.approver && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            {leave.status === 'APPROVED' ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <X className="w-3 h-3 text-red-600" />
                            )}
                            {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leave.approver.full_name} on {formatDate(leave.approved_at)}
                          </p>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(leave.id)}
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(leave.id)}
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEdit(leave)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(leave.id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      </div>

      {/* Request Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingLeave ? 'Edit Leave Request' : 'Request Leave'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="Start Date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
            />

            <Input
              type="date"
              label="End Date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
              min={form.start_date}
            />
          </div>

          {duration > 0 && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
              <p className="text-sm text-primary-900">
                <span className="font-semibold">Duration:</span> {duration} day{duration !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          <Textarea
            label="Reason (optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Provide a reason for your leave request..."
            rows={4}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {editingLeave ? 'Update Request' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
