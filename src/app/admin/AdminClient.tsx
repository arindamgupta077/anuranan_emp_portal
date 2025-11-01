'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, ClipboardList, Calendar, FileText, Trash2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

type Role = {
  id: string
  name: string
  description: string | null
}

type User = {
  id: string
  full_name: string
  email: string
  role_id: string
  is_active: boolean
  role?: Role
}

type RecurringTask = {
  id: string
  title: string
  description: string | null
  frequency: 'WEEKLY' | 'MONTHLY'
  day_of_week: number | null
  day_of_month: number | null
  start_date: string
  end_date: string | null
  assigned_to: string
  is_active: boolean
  assigned_to_user?: {
    id: string
    full_name: string
  }
}

type Props = {
  employees: User[]
  roles: Role[]
  recurringTasks: RecurringTask[]
}

type Tab = 'employees' | 'tasks' | 'recurring' | 'reports'

export default function AdminClient({ employees, roles, recurringTasks }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('employees')
  const router = useRouter()
  const { showToast } = useToast()

  // Employee management state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [employeeForm, setEmployeeForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
  })

  // Task creation state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    due_date: '',
    assigned_to: '',
  })

  // Recurring task state
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringForm, setRecurringForm] = useState({
    title: '',
    description: '',
    frequency: 'WEEKLY' as 'WEEKLY' | 'MONTHLY',
    day_of_week: '',
    day_of_month: '',
    start_date: '',
    end_date: '',
    assigned_to: '',
  })

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeForm),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to add employee')
      }

      showToast('success', result.message || 'Employee created successfully')
      setShowAddEmployeeModal(false)
      setEmployeeForm({ full_name: '', email: '', password: '', role_id: '' })
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to add employee')
    }
  }

  const handleToggleEmployeeStatus = async (userId: string, currentIsActive: boolean) => {
    try {
      const newIsActive = !currentIsActive
      const res = await fetch(`/api/admin/employees/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newIsActive }),
      })

      if (!res.ok) throw new Error('Failed to update status')

      showToast('success', `Employee ${newIsActive ? 'activated' : 'deactivated'}`)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to update employee status')
    }
  }

  const handleDeleteEmployee = async (userId: string, employeeName: string) => {
    if (!confirm(`Are you sure you want to delete ${employeeName}? This action cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/employees/${userId}`, {
        method: 'DELETE',
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete employee')
      }

      showToast('success', result.message || 'Employee deleted successfully')
      router.refresh()
    } catch (error: any) {
      showToast('error', error.message || 'Failed to delete employee')
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskForm),
      })

      if (!res.ok) throw new Error('Failed to create task')

      showToast('success', 'Task created successfully')
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        due_date: '',
        assigned_to: '',
      })
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to create task')
    }
  }

  const handleCreateRecurringTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...recurringForm,
        day_of_week: recurringForm.frequency === 'WEEKLY' ? parseInt(recurringForm.day_of_week) : null,
        day_of_month: recurringForm.frequency === 'MONTHLY' ? parseInt(recurringForm.day_of_month) : null,
      }

      const res = await fetch('/api/recurring-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to create recurring task')

      showToast('success', 'Recurring task created successfully')
      setShowRecurringModal(false)
      setRecurringForm({
        title: '',
        description: '',
        frequency: 'WEEKLY',
        day_of_week: '',
        day_of_month: '',
        start_date: '',
        end_date: '',
        assigned_to: '',
      })
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to create recurring task')
    }
  }

  const handleToggleRecurringTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/recurring-tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, is_active: !currentStatus }),
      })

      if (!res.ok) throw new Error('Failed to toggle recurring task')

      showToast('success', `Recurring task ${!currentStatus ? 'activated' : 'deactivated'}`)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to update recurring task')
    }
  }

  const tabs = [
    { id: 'employees' as Tab, label: 'Employees', icon: Users },
    { id: 'tasks' as Tab, label: 'Create Task', icon: ClipboardList },
    { id: 'recurring' as Tab, label: 'Recurring Tasks', icon: Calendar },
    { id: 'reports' as Tab, label: 'Reports', icon: FileText },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddEmployeeModal(true)}>
              Add Employee
            </Button>
          </div>

          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {employee.full_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.role?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={employee.is_active ? 'ACTIVE' : 'INACTIVE'} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                          >
                            {employee.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'tasks' && (
        <Card title="Create New Task">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <Input
              label="Title"
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              value={taskForm.description}
              onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
              rows={4}
            />

            <Select
              label="Priority"
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({ ...taskForm, priority: e.target.value as any })
              }
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' },
              ]}
              required
            />

            <Input
              label="Due Date"
              type="date"
              value={taskForm.due_date}
              onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
              required
            />

            <Select
              label="Assign To"
              value={taskForm.assigned_to}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assigned_to: e.target.value })
              }
              options={[
                { value: '', label: 'Select Employee' },
                ...employees
                  .filter((emp) => emp.is_active)
                  .map((emp) => ({
                    value: emp.id,
                    label: `${emp.full_name} (${emp.role?.name})`,
                  })),
              ]}
              required
            />

            <Button type="submit">Create Task</Button>
          </form>
        </Card>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowRecurringModal(true)}>
              Add Recurring Task
            </Button>
          </div>

          <div className="grid gap-4">
            {recurringTasks.map((task) => (
              <Card key={task.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <Badge status={task.is_active ? 'APPROVED' : 'REJECTED'} />
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {task.frequency}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 mb-3">{task.description}</p>
                    )}
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>
                        <span className="font-medium">Assigned to:</span>{' '}
                        {task.assigned_to_user?.full_name}
                      </p>
                      <p>
                        <span className="font-medium">Schedule:</span>{' '}
                        {task.frequency === 'WEEKLY'
                          ? `Every ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][task.day_of_week || 0]}`
                          : `${task.day_of_month}${task.day_of_month === 1 ? 'st' : task.day_of_month === 2 ? 'nd' : task.day_of_month === 3 ? 'rd' : 'th'} of each month`}
                      </p>
                      <p>
                        <span className="font-medium">Period:</span> {task.start_date}
                        {task.end_date && ` - ${task.end_date}`}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant={task.is_active ? 'danger' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleRecurringTask(task.id, task.is_active)}
                  >
                    {task.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {recurringTasks.length === 0 && (
            <Card>
              <p className="text-center text-gray-500 py-8">
                No recurring tasks yet. Create one to automate task generation.
              </p>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Performance Reports</h3>
            <p className="text-gray-600 mb-6">
              View detailed analytics and export reports
            </p>
            <Button onClick={() => router.push('/reports')}>
              Go to Reports Page
            </Button>
          </div>
        </Card>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <Input
            label="Full Name"
            value={employeeForm.full_name}
            onChange={(e) =>
              setEmployeeForm({ ...employeeForm, full_name: e.target.value })
            }
            required
          />

          <Input
            label="Email"
            type="email"
            value={employeeForm.email}
            onChange={(e) =>
              setEmployeeForm({ ...employeeForm, email: e.target.value })
            }
            required
          />

          <Input
            label="Password"
            type="password"
            value={employeeForm.password}
            onChange={(e) =>
              setEmployeeForm({ ...employeeForm, password: e.target.value })
            }
            required
            helpText="Minimum 6 characters"
          />

          <Select
            label="Role"
            value={employeeForm.role_id}
            onChange={(e) =>
              setEmployeeForm({ ...employeeForm, role_id: e.target.value })
            }
            options={[
              { value: '', label: 'Select Role' },
              ...roles.map((role) => ({
                value: role.id,
                label: role.name,
              })),
            ]}
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddEmployeeModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Employee</Button>
          </div>
        </form>
      </Modal>

      {/* Add Recurring Task Modal */}
      <Modal
        isOpen={showRecurringModal}
        onClose={() => setShowRecurringModal(false)}
        title="Create Recurring Task"
        size="lg"
      >
        <form onSubmit={handleCreateRecurringTask} className="space-y-4">
          <Input
            label="Title"
            value={recurringForm.title}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, title: e.target.value })
            }
            required
          />

          <Textarea
            label="Description"
            value={recurringForm.description}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, description: e.target.value })
            }
            rows={3}
          />

          <Select
            label="Frequency"
            value={recurringForm.frequency}
            onChange={(e) => {
              const freq = e.target.value as 'WEEKLY' | 'MONTHLY'
              setRecurringForm({
                ...recurringForm,
                frequency: freq,
                day_of_week: freq === 'WEEKLY' ? recurringForm.day_of_week : '',
                day_of_month: freq === 'MONTHLY' ? recurringForm.day_of_month : '',
              })
            }}
            options={[
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
            ]}
            required
          />

          {recurringForm.frequency === 'WEEKLY' && (
            <Select
              label="Day of Week"
              value={recurringForm.day_of_week}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, day_of_week: e.target.value })
              }
              options={[
                { value: '', label: 'Select Day' },
                { value: '0', label: 'Sunday' },
                { value: '1', label: 'Monday' },
                { value: '2', label: 'Tuesday' },
                { value: '3', label: 'Wednesday' },
                { value: '4', label: 'Thursday' },
                { value: '5', label: 'Friday' },
                { value: '6', label: 'Saturday' },
              ]}
              required
            />
          )}

          {recurringForm.frequency === 'MONTHLY' && (
            <Input
              label="Day of Month (1-31)"
              type="number"
              min="1"
              max="31"
              value={recurringForm.day_of_month}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, day_of_month: e.target.value })
              }
              required
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={recurringForm.start_date}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, start_date: e.target.value })
              }
              required
            />

            <Input
              label="End Date (Optional)"
              type="date"
              value={recurringForm.end_date}
              onChange={(e) =>
                setRecurringForm({ ...recurringForm, end_date: e.target.value })
              }
            />
          </div>

          <Select
            label="Assign To"
            value={recurringForm.assigned_to}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, assigned_to: e.target.value })
            }
            options={[
              { value: '', label: 'Select Employee' },
              ...employees
                .filter((emp) => emp.is_active)
                .map((emp) => ({
                  value: emp.id,
                  label: `${emp.full_name} (${emp.role?.name})`,
                })),
            ]}
            required
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRecurringModal(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Recurring Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
