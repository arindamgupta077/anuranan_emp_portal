'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  ClipboardList, 
  Calendar, 
  FileText, 
  Trash2, 
  Plus, 
  Edit2, 
  ToggleLeft, 
  ToggleRight,
  Search,
  Filter,
  UserPlus,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
  Award,
  BarChart3
} from 'lucide-react'
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

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Employee management state
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null)
  const [employeeForm, setEmployeeForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role_id: '',
  })
  const [editForm, setEditForm] = useState({
    full_name: '',
    role_id: '',
  })

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           emp.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || emp.role_id === roleFilter
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && emp.is_active) ||
                           (statusFilter === 'inactive' && !emp.is_active)
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [employees, searchQuery, roleFilter, statusFilter])

  // Stats calculations
  const stats = useMemo(() => {
    const activeEmployees = employees.filter(e => e.is_active).length
    const totalEmployees = employees.length
    const activeRecurringTasks = recurringTasks.filter(t => t.is_active).length
    const totalRecurringTasks = recurringTasks.length

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees: totalEmployees - activeEmployees,
      activeRecurringTasks,
      totalRecurringTasks,
    }
  }, [employees, recurringTasks])

  // Task creation state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
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

  const handleOpenEditModal = (employee: User) => {
    setEditingEmployee(employee)
    setEditForm({
      full_name: employee.full_name,
      role_id: employee.role_id,
    })
    setShowEditEmployeeModal(true)
  }

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      const res = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!res.ok) throw new Error('Failed to update employee')

      showToast('success', 'Employee updated successfully')
      setShowEditEmployeeModal(false)
      setEditingEmployee(null)
      setEditForm({ full_name: '', role_id: '' })
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to update employee')
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
        body: JSON.stringify({
          title: taskForm.title,
          details: taskForm.description,
          assigned_to: taskForm.assigned_to,
          due_date: taskForm.due_date,
        }),
      })

      if (!res.ok) throw new Error('Failed to create task')

      showToast('success', 'Task created successfully')
      setTaskForm({
        title: '',
        description: '',
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
    { id: 'employees' as Tab, label: 'Employees', icon: Users, count: stats.totalEmployees },
    { id: 'tasks' as Tab, label: 'Create Task', icon: ClipboardList },
    { id: 'recurring' as Tab, label: 'Recurring Tasks', icon: Calendar, count: stats.totalRecurringTasks },
    { id: 'reports' as Tab, label: 'Reports', icon: FileText },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 pb-8 px-2 sm:px-0">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
              <Award className="h-7 w-7 sm:h-8 sm:w-8 md:h-10 md:w-10" />
              Admin Control Panel
            </h1>
            <p className="text-primary-100 text-sm sm:text-base md:text-lg">Manage your organization efficiently</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.totalEmployees}</div>
              <div className="text-xs sm:text-sm text-primary-100">Total Staff</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 sm:px-4 md:px-6 py-2 md:py-3 text-center flex-1 md:flex-none">
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{stats.activeEmployees}</div>
              <div className="text-xs sm:text-sm text-primary-100">Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mb-1">Total Employees</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium mb-1">Active Staff</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.activeEmployees}</p>
            </div>
            <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium mb-1">Inactive Staff</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.inactiveEmployees}</p>
            </div>
            <XCircle className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-orange-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-5 md:p-6 text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium mb-1">Recurring Tasks</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{stats.activeRecurringTasks}/{stats.totalRecurringTasks}</p>
            </div>
            <Activity className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 text-purple-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto space-x-1 p-2 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-lg font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-md transform scale-105'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'employees' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col gap-3 sm:gap-4 bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-3">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Roles' },
                  ...roles.map(role => ({ value: role.id, label: role.name }))
                ]}
                className="text-sm"
              />
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
                className="text-sm"
              />

              <Button 
                onClick={() => setShowAddEmployeeModal(true)}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 text-sm sm:text-base py-2.5 sm:py-auto"
              >
                <UserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Add Employee</span>
              </Button>
            </div>
          </div>

          {/* Employee Cards/Table */}
          {filteredEmployees.length === 0 ? (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
              <Users className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3" />
              <p className="text-gray-500 text-base sm:text-lg font-medium">No employees found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3">
                {filteredEmployees.map((employee) => (
                  <div 
                    key={employee.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-base shadow-md">
                            {employee.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold text-gray-900 truncate">
                              {employee.full_name}
                            </div>
                            <div className="text-sm text-gray-600 truncate">{employee.email}</div>
                          </div>
                        </div>
                        <Badge status={employee.is_active ? 'ACTIVE' : 'INACTIVE'} />
                      </div>
                      
                      <div className="mb-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {employee.role?.name}
                        </span>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleOpenEditModal(employee)}
                          className="flex-1 flex items-center justify-center gap-1.5 p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-150 text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                          className={`flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg transition-colors duration-150 text-sm font-medium ${
                            employee.is_active 
                              ? 'text-orange-600 bg-orange-50 hover:bg-orange-100' 
                              : 'text-green-600 bg-green-50 hover:bg-green-100'
                          }`}
                        >
                          {employee.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          <span>{employee.is_active ? 'Disable' : 'Enable'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                          className="flex items-center justify-center gap-1.5 p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-150"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredEmployees.map((employee) => (
                        <tr 
                          key={employee.id} 
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                  {employee.full_name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">
                                  {employee.full_name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{employee.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {employee.role?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge status={employee.is_active ? 'ACTIVE' : 'INACTIVE'} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleOpenEditModal(employee)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                                title="Edit Employee"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleEmployeeStatus(employee.id, employee.is_active)}
                                className={`p-2 rounded-lg transition-colors duration-150 ${
                                  employee.is_active 
                                    ? 'text-orange-600 hover:bg-orange-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={employee.is_active ? 'Deactivate' : 'Activate'}
                              >
                                {employee.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteEmployee(employee.id, employee.full_name)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                                title="Delete Employee"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Employee count footer */}
          {filteredEmployees.length > 0 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md px-4 sm:px-6 py-3 sm:py-4">
              <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                Showing <span className="font-semibold text-gray-900">{filteredEmployees.length}</span> of <span className="font-semibold text-gray-900">{employees.length}</span> employees
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
              <div className="flex items-center gap-2 sm:gap-3 text-white">
                <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                <div>
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Create New Task</h2>
                  <p className="text-primary-100 text-xs sm:text-sm mt-1">Assign a task to your team members</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Input
                  label="Task Title"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  placeholder="Enter task title..."
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  label="Description"
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={5}
                  placeholder="Provide detailed task description..."
                />
              </div>

              <div className="space-y-2">
                <Input
                  label="Due Date"
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Select
                  label="Assign To Employee"
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
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="ghost"
                  onClick={() => setTaskForm({
                    title: '',
                    description: '',
                    due_date: '',
                    assigned_to: '',
                  })}
                  className="w-full sm:w-auto"
                >
                  Reset Form
                </Button>
                <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'recurring' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-primary-600" />
                Recurring Tasks Management
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Automate repetitive tasks with scheduled assignments</p>
            </div>
            <Button 
              onClick={() => setShowRecurringModal(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              <span>Add Recurring Task</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:gap-4 md:gap-5">
            {recurringTasks.map((task) => (
              <div 
                key={task.id} 
                className="bg-white rounded-lg sm:rounded-xl shadow-md overflow-hidden border-l-4 hover:shadow-xl transition-all duration-300"
                style={{ 
                  borderLeftColor: task.is_active ? '#10b981' : '#ef4444' 
                }}
              >
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <h3 className="font-bold text-base sm:text-lg md:text-xl text-gray-900">{task.title}</h3>
                        <Badge status={task.is_active ? 'APPROVED' : 'REJECTED'} />
                        <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                          task.frequency === 'WEEKLY' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {task.frequency === 'WEEKLY' ? '📅 Weekly' : '📆 Monthly'}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4 leading-relaxed">{task.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                            <Users className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 text-xs">Assigned to</p>
                            <p className="font-semibold text-gray-900 truncate">{task.assigned_to_user?.full_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 text-xs">Schedule</p>
                            <p className="font-semibold text-gray-900 truncate">
                              {task.frequency === 'WEEKLY'
                                ? `Every ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][task.day_of_week || 0]}`
                                : `${task.day_of_month}${task.day_of_month === 1 ? 'st' : task.day_of_month === 2 ? 'nd' : task.day_of_month === 3 ? 'rd' : 'th'} of month`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <div className="bg-orange-100 p-2 rounded-lg flex-shrink-0">
                            <Activity className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-500 text-xs">Period</p>
                            <p className="font-semibold text-gray-900 text-xs truncate">
                              {task.start_date}{task.end_date && ` → ${task.end_date}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant={task.is_active ? 'danger' : 'primary'}
                      size="sm"
                      onClick={() => handleToggleRecurringTask(task.id, task.is_active)}
                      className="w-full sm:w-auto sm:ml-4 flex items-center justify-center gap-2 text-sm"
                    >
                      {task.is_active ? (
                        <>
                          <ToggleRight className="h-4 w-4" />
                          <span>Deactivate</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4" />
                          <span>Activate</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recurringTasks.length === 0 && (
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-8 sm:p-12 text-center">
              <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">No Recurring Tasks Yet</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-6">
                Create your first recurring task to automate repetitive assignments
              </p>
              <Button 
                onClick={() => setShowRecurringModal(true)}
                className="flex items-center justify-center gap-2 mx-auto w-full sm:w-auto"
              >
                <Plus className="h-5 w-5" />
                Create Recurring Task
              </Button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-8 md:p-12 text-center text-white">
              <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20 mx-auto mb-4 sm:mb-6 opacity-90" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-3">Performance Analytics</h2>
              <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
                View comprehensive reports, analyze team performance, and export detailed analytics
              </p>
              <button
                onClick={() => router.push('/reports')}
                className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg rounded-lg flex items-center justify-center gap-2 sm:gap-3 mx-auto shadow-lg w-full sm:w-auto max-w-sm transition-colors"
              >
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />
                Open Reports Dashboard
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">Task Analytics</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Track task completion rates and productivity metrics</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-t-4 border-green-500">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="bg-green-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">Team Performance</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Monitor employee performance and engagement levels</p>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6 border-t-4 border-purple-500 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-lg flex-shrink-0">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">Export Reports</h3>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm">Generate and download detailed reports in various formats</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={showAddEmployeeModal}
        onClose={() => setShowAddEmployeeModal(false)}
        title="Add New Employee"
        size="md"
      >
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="bg-primary-100 p-2 rounded-lg flex-shrink-0">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Add New Employee</h3>
              <p className="text-xs sm:text-sm text-gray-500">Create a new employee account</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddEmployee} className="space-y-4 sm:space-y-5">
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={employeeForm.full_name}
              onChange={(e) =>
                setEmployeeForm({ ...employeeForm, full_name: e.target.value })
              }
              required
              placeholder="Enter full name"
            />

            <Input
              label="Email Address"
              type="email"
              value={employeeForm.email}
              onChange={(e) =>
                setEmployeeForm({ ...employeeForm, email: e.target.value })
              }
              required
              placeholder="employee@example.com"
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
              placeholder="••••••••"
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
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddEmployeeModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
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
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Create Recurring Task</h3>
              <p className="text-xs sm:text-sm text-gray-500">Set up automatic task generation</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleCreateRecurringTask} className="space-y-4 sm:space-y-5">
          <Input
            label="Task Title"
            value={recurringForm.title}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, title: e.target.value })
            }
            required
            placeholder="Enter task title"
          />

          <Textarea
            label="Description"
            value={recurringForm.description}
            onChange={(e) =>
              setRecurringForm({ ...recurringForm, description: e.target.value })
            }
            rows={3}
            placeholder="Describe the task details..."
          />

            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Schedule Configuration</h4>            <Select
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
                { value: 'WEEKLY', label: '📅 Weekly' },
                { value: 'MONTHLY', label: '📆 Monthly' },
              ]}
              required
            />

            {recurringForm.frequency === 'WEEKLY' && (
              <div className="mt-3">
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
              </div>
            )}

            {recurringForm.frequency === 'MONTHLY' && (
              <div className="mt-3">
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
                  placeholder="e.g., 15"
                />
              </div>
            )}
          </div>

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
            label="Assign To Employee"
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

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowRecurringModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              Create Recurring Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={showEditEmployeeModal}
        onClose={() => {
          setShowEditEmployeeModal(false)
          setEditingEmployee(null)
          setEditForm({ full_name: '', role_id: '' })
        }}
        title="Edit Employee"
        size="md"
      >
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
              <Edit2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Edit Employee</h3>
              <p className="text-xs sm:text-sm text-gray-500">Update employee information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleEditEmployee} className="space-y-4 sm:space-y-5">
          <Input
            label="Full Name"
            value={editForm.full_name}
            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
            required
            placeholder="Enter full name"
          />

          <Select
            label="Role"
            value={editForm.role_id}
            onChange={(e) => setEditForm({ ...editForm, role_id: e.target.value })}
            options={[
              { value: '', label: 'Select Role' },
              ...roles.map((role) => ({
                value: role.id,
                label: role.name,
              })),
            ]}
            required
          />

          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowEditEmployeeModal(false)
                setEditingEmployee(null)
                setEditForm({ full_name: '', role_id: '' })
              }}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Update Employee
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
