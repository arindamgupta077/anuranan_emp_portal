'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Check, X, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react'
import { Leave, LeaveStatus } from '@/lib/types'
import { formatDate, calculateDuration } from '@/lib/utils/date'
import { useToast } from '@/components/ui/Toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

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
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredLeaves = leaves.filter(leave => {
    if (filterStatus && leave.status !== filterStatus) return false
    if (filterUserId && leave.user_id !== filterUserId) return false
    return true
  })

  // Calculate total leave days
  const totalLeaveDays = leaves
    .filter(leave => leave.status === 'APPROVED' && leave.user_id === user.id)
    .reduce((sum, leave) => sum + calculateDuration(leave.start_date, leave.end_date), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
        <p className="mt-1 text-gray-600">
          {isCEO ? 'Manage employee leave requests' : 'Request and track your leaves'}
        </p>
      </div>

      {/* Leave Summary */}
      {!isCEO && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Approved Leave Days</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeaveDays}</p>
            </div>
            <CalendarIcon className="w-12 h-12 text-primary-600" />
          </div>
        </Card>
      )}

      {/* Request Leave Form */}
      <Card title={editingLeave ? 'Edit Leave Request' : 'Request Leave'}>
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
            <div className="text-sm text-gray-600">
              <span className="font-medium">Duration:</span> {duration} day{duration !== 1 ? 's' : ''}
            </div>
          )}

          <Textarea
            label="Reason (optional)"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Reason for leave..."
            rows={3}
          />

          <div className="flex justify-end gap-3">
            {editingLeave && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingLeave(null)
                  setForm({ start_date: '', end_date: '', reason: '' })
                }}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" isLoading={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {editingLeave ? 'Update Request' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </Card>

      {/* Leaves List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Leave Requests ({filteredLeaves.length})
        </h2>
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600">No leave requests found</p>
              </div>
            </Card>
          ) : (
            filteredLeaves.map(leave => {
              const canEdit = leave.user_id === user.id && leave.status === 'PENDING'
              const canApprove = isCEO && leave.status === 'PENDING'
              const leaveDuration = calculateDuration(leave.start_date, leave.end_date)

              return (
                <Card key={leave.id} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {isCEO && leave.user && (
                          <div className="text-sm font-medium text-gray-900 mb-2">
                            {leave.user.full_name}
                          </div>
                        )}
                        <div className="flex items-center gap-3 flex-wrap mb-2">
                          <span className="text-sm text-gray-600">
                            {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                          </span>
                          <Badge status={leave.status} />
                          <span className="text-sm font-medium text-primary-600">
                            {leaveDuration} day{leaveDuration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {leave.reason && (
                          <p className="text-gray-700 text-sm mb-2">{leave.reason}</p>
                        )}
                        {leave.approved_at && leave.approver && (
                          <p className="text-xs text-gray-500">
                            {leave.status === 'APPROVED' ? 'Approved' : 'Rejected'} by {leave.approver.full_name} on {formatDate(leave.approved_at)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleApprove(leave.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleReject(leave.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {canEdit && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(leave)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(leave.id)}
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
    </div>
  )
}
