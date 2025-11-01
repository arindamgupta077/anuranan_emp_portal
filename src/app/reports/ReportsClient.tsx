'use client'

import { useState, useMemo } from 'react'
import { Download, TrendingUp, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { differenceInDays, format, parseISO } from 'date-fns'

type Employee = {
  id: string
  full_name: string
  email: string
  status: string
  role: any
}

type Task = {
  id: string
  title: string
  status: string
  priority: string
  due_date: string
  completed_at: string | null
  assigned_to: string
  assigned_to_user?: {
    id: string
    full_name: string
  }
}

type SelfTask = {
  id: string
  date: string
  details: string
  user_id: string
  user?: {
    id: string
    full_name: string
  }
}

type Leave = {
  id: string
  start_date: string
  end_date: string
  status: string
  user_id: string
  user?: {
    id: string
    full_name: string
  }
}

type Props = {
  employees: Employee[]
  tasks: Task[]
  selfTasks: SelfTask[]
  leaves: Leave[]
}

export default function ReportsClient({ employees, tasks, selfTasks, leaves }: Props) {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all')

  // Filter data by selected employee
  const filteredTasks = selectedEmployee === 'all'
    ? tasks
    : tasks.filter((t) => t.assigned_to === selectedEmployee)

  const filteredSelfTasks = selectedEmployee === 'all'
    ? selfTasks
    : selfTasks.filter((st) => st.user_id === selectedEmployee)

  const filteredLeaves = selectedEmployee === 'all'
    ? leaves
    : leaves.filter((l) => l.user_id === selectedEmployee)

  // Calculate metrics
  const metrics = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE')
    
    // Task metrics
    const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED')
    const overdueTasks = filteredTasks.filter(
      (t) => t.status !== 'COMPLETED' && new Date(t.due_date) < new Date()
    )
    const completionRate = filteredTasks.length > 0
      ? Math.round((completedTasks.length / filteredTasks.length) * 100)
      : 0

    // Self task metrics
    const selfTasksThisMonth = filteredSelfTasks.filter((st) => {
      const taskDate = parseISO(st.date)
      const now = new Date()
      return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()
    })

    // Leave metrics
    const approvedLeaves = filteredLeaves.filter((l) => l.status === 'APPROVED')
    const totalLeaveDays = approvedLeaves.reduce((sum, leave) => {
      const start = parseISO(leave.start_date)
      const end = parseISO(leave.end_date)
      return sum + differenceInDays(end, start) + 1
    }, 0)

    return {
      totalEmployees: activeEmployees.length,
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate,
      selfTasksCount: filteredSelfTasks.length,
      selfTasksThisMonth: selfTasksThisMonth.length,
      totalLeaves: filteredLeaves.length,
      approvedLeaves: approvedLeaves.length,
      totalLeaveDays,
    }
  }, [employees, filteredTasks, filteredSelfTasks, filteredLeaves])

  // Performance by employee
  const employeePerformance = useMemo(() => {
    return employees
      .filter((emp) => emp.status === 'ACTIVE')
      .map((emp) => {
        const empTasks = tasks.filter((t) => t.assigned_to === emp.id)
        const completed = empTasks.filter((t) => t.status === 'COMPLETED').length
        const overdue = empTasks.filter(
          (t) => t.status !== 'COMPLETED' && new Date(t.due_date) < new Date()
        ).length
        const rate = empTasks.length > 0 ? Math.round((completed / empTasks.length) * 100) : 0
        
        const empLeaves = leaves.filter((l) => l.user_id === emp.id && l.status === 'APPROVED')
        const leaveDays = empLeaves.reduce((sum, leave) => {
          const start = parseISO(leave.start_date)
          const end = parseISO(leave.end_date)
          return sum + differenceInDays(end, start) + 1
        }, 0)

        const empSelfTasks = selfTasks.filter((st) => st.user_id === emp.id)

        return {
          id: emp.id,
          name: emp.full_name,
          role: emp.role?.name || 'N/A',
          totalTasks: empTasks.length,
          completed,
          overdue,
          completionRate: rate,
          selfTasks: empSelfTasks.length,
          leaveDays,
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate)
  }, [employees, tasks, selfTasks, leaves])

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Employee Name',
      'Role',
      'Total Tasks',
      'Completed',
      'Overdue',
      'Completion Rate (%)',
      'Self Tasks',
      'Leave Days',
    ]

    const rows = employeePerformance.map((emp) => [
      emp.name,
      emp.role,
      emp.totalTasks,
      emp.completed,
      emp.overdue,
      emp.completionRate,
      emp.selfTasks,
      emp.leaveDays,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `employee_performance_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Performance Reports</h1>
        <Button onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-4">
        <div className="w-64">
          <Select
            label="Employee"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            options={[
              { value: 'all', label: 'All Employees' },
              ...employees
                .filter((emp) => emp.status === 'ACTIVE')
                .map((emp) => ({
                  value: emp.id,
                  label: emp.full_name,
                })),
            ]}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold">{metrics.totalTasks}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold">{metrics.completionRate}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold">{metrics.overdueTasks}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leave Days</p>
              <p className="text-2xl font-bold">{metrics.totalLeaveDays}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Task Status Breakdown */}
      <Card title="Task Status Overview">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold">{metrics.completedTasks}</p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold">
              {metrics.totalTasks - metrics.completedTasks - metrics.overdueTasks}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div>
            <div className="flex items-center justify-center mb-2">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold">{metrics.overdueTasks}</p>
            <p className="text-sm text-gray-600">Overdue</p>
          </div>
        </div>
      </Card>

      {/* Employee Performance Table */}
      <Card title="Employee Performance">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Self Tasks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Days
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employeePerformance.map((emp) => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{emp.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.totalTasks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-green-600 font-medium">{emp.completed}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-red-600 font-medium">{emp.overdue}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {emp.completionRate}%
                      </span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${emp.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.selfTasks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.leaveDays}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employeePerformance.length === 0 && (
          <p className="text-center text-gray-500 py-8">No employee data available</p>
        )}
      </Card>
    </div>
  )
}
