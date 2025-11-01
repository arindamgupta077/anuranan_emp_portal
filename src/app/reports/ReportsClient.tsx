'use client'

import { useState, useMemo } from 'react'
import { 
  Download, TrendingUp, CheckCircle, XCircle, Clock, Calendar, 
  Users, Target, Award, Activity, BarChart3, PieChart, LineChart,
  TrendingDown, AlertCircle, CheckCircle2, Zap, Star, ChevronDown,
  ChevronUp, Filter, FileText, CalendarDays, ListTodo, UserCheck
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { differenceInDays, format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths, startOfWeek, endOfWeek, eachWeekOfInterval, subWeeks, isWithinInterval } from 'date-fns'

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
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month')
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'tasks' | 'trends'>('overview')
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null)

  // Helper function to filter by time range
  const filterByTimeRange = (date: string) => {
    const itemDate = parseISO(date)
    const now = new Date()
    
    switch (timeRange) {
      case 'week':
        return differenceInDays(now, itemDate) <= 7
      case 'month':
        return differenceInDays(now, itemDate) <= 30
      case 'quarter':
        return differenceInDays(now, itemDate) <= 90
      case 'year':
        return differenceInDays(now, itemDate) <= 365
      case 'all':
      default:
        return true
    }
  }

  // Filter data by selected employee and time range
  const filteredTasks = useMemo(() => {
    let filtered = selectedEmployee === 'all'
      ? tasks
      : tasks.filter((t) => t.assigned_to === selectedEmployee)
    
    if (timeRange !== 'all') {
      filtered = filtered.filter(t => filterByTimeRange(t.due_date))
    }
    return filtered
  }, [selectedEmployee, tasks, timeRange])

  const filteredSelfTasks = useMemo(() => {
    let filtered = selectedEmployee === 'all'
      ? selfTasks
      : selfTasks.filter((st) => st.user_id === selectedEmployee)
    
    if (timeRange !== 'all') {
      filtered = filtered.filter(st => filterByTimeRange(st.date))
    }
    return filtered
  }, [selectedEmployee, selfTasks, timeRange])

  const filteredLeaves = useMemo(() => {
    let filtered = selectedEmployee === 'all'
      ? leaves
      : leaves.filter((l) => l.user_id === selectedEmployee)
    
    if (timeRange !== 'all') {
      filtered = filtered.filter(l => filterByTimeRange(l.start_date))
    }
    return filtered
  }, [selectedEmployee, leaves, timeRange])

  // Calculate comprehensive metrics
  const metrics = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE')
    
    // Task metrics
    const completedTasks = filteredTasks.filter((t) => t.status === 'COMPLETED')
    const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS')
    const openTasks = filteredTasks.filter((t) => t.status === 'OPEN')
    const overdueTasks = filteredTasks.filter(
      (t) => t.status !== 'COMPLETED' && new Date(t.due_date) < new Date()
    )
    const completionRate = filteredTasks.length > 0
      ? Math.round((completedTasks.length / filteredTasks.length) * 100)
      : 0

    // Priority distribution
    const highPriority = filteredTasks.filter(t => t.priority === 'HIGH')
    const mediumPriority = filteredTasks.filter(t => t.priority === 'MEDIUM')
    const lowPriority = filteredTasks.filter(t => t.priority === 'LOW')

    // Completion speed (average days to complete)
    const completedWithDates = completedTasks.filter(t => t.completed_at)
    const avgCompletionDays = completedWithDates.length > 0
      ? Math.round(
          completedWithDates.reduce((sum, t) => {
            const created = parseISO(t.due_date)
            const completed = parseISO(t.completed_at!)
            return sum + Math.abs(differenceInDays(completed, created))
          }, 0) / completedWithDates.length
        )
      : 0

    // Self task metrics
    const selfTasksThisMonth = filteredSelfTasks.filter((st) => {
      const taskDate = parseISO(st.date)
      const now = new Date()
      return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear()
    })

    // Leave metrics
    const approvedLeaves = filteredLeaves.filter((l) => l.status === 'APPROVED')
    const pendingLeaves = filteredLeaves.filter((l) => l.status === 'PENDING')
    const rejectedLeaves = filteredLeaves.filter((l) => l.status === 'REJECTED')
    const totalLeaveDays = approvedLeaves.reduce((sum, leave) => {
      const start = parseISO(leave.start_date)
      const end = parseISO(leave.end_date)
      return sum + differenceInDays(end, start) + 1
    }, 0)
    const avgLeaveDaysPerEmployee = activeEmployees.length > 0
      ? Math.round(totalLeaveDays / activeEmployees.length)
      : 0

    // Productivity score (0-100)
    const productivityScore = Math.round(
      (completionRate * 0.5) + 
      (Math.max(0, 100 - (overdueTasks.length / Math.max(filteredTasks.length, 1) * 100)) * 0.3) +
      (Math.min(selfTasksThisMonth.length / activeEmployees.length * 10, 100) * 0.2)
    )

    return {
      totalEmployees: activeEmployees.length,
      totalTasks: filteredTasks.length,
      completedTasks: completedTasks.length,
      inProgressTasks: inProgressTasks.length,
      openTasks: openTasks.length,
      overdueTasks: overdueTasks.length,
      completionRate,
      highPriority: highPriority.length,
      mediumPriority: mediumPriority.length,
      lowPriority: lowPriority.length,
      highPriorityCompleted: highPriority.filter(t => t.status === 'COMPLETED').length,
      avgCompletionDays,
      selfTasksCount: filteredSelfTasks.length,
      selfTasksThisMonth: selfTasksThisMonth.length,
      totalLeaves: filteredLeaves.length,
      approvedLeaves: approvedLeaves.length,
      pendingLeaves: pendingLeaves.length,
      rejectedLeaves: rejectedLeaves.length,
      totalLeaveDays,
      avgLeaveDaysPerEmployee,
      productivityScore,
    }
  }, [employees, filteredTasks, filteredSelfTasks, filteredLeaves])

  // Monthly trend analysis
  const monthlyTrends = useMemo(() => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    })

    return months.map(month => {
      const monthStart = startOfMonth(month)
      const monthEnd = endOfMonth(month)
      
      const monthTasks = tasks.filter(t => {
        const taskDate = parseISO(t.due_date)
        return isWithinInterval(taskDate, { start: monthStart, end: monthEnd })
      })

      const completed = monthTasks.filter(t => t.status === 'COMPLETED').length
      const total = monthTasks.length

      return {
        month: format(month, 'MMM yyyy'),
        completed,
        inProgress: monthTasks.filter(t => t.status === 'IN_PROGRESS').length,
        open: monthTasks.filter(t => t.status === 'OPEN').length,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })
  }, [tasks])

  // Performance by employee
  const employeePerformance = useMemo(() => {
    return employees
      .filter((emp) => emp.status === 'ACTIVE')
      .map((emp) => {
        const empTasks = tasks.filter((t) => t.assigned_to === emp.id)
        const filteredEmpTasks = filteredTasks.filter((t) => t.assigned_to === emp.id)
        
        const completed = filteredEmpTasks.filter((t) => t.status === 'COMPLETED').length
        const inProgress = filteredEmpTasks.filter((t) => t.status === 'IN_PROGRESS').length
        const overdue = filteredEmpTasks.filter(
          (t) => t.status !== 'COMPLETED' && new Date(t.due_date) < new Date()
        ).length
        const rate = filteredEmpTasks.length > 0 ? Math.round((completed / filteredEmpTasks.length) * 100) : 0
        
        const empLeaves = leaves.filter((l) => l.user_id === emp.id && l.status === 'APPROVED')
        const leaveDays = empLeaves.reduce((sum, leave) => {
          const start = parseISO(leave.start_date)
          const end = parseISO(leave.end_date)
          return sum + differenceInDays(end, start) + 1
        }, 0)

        const empSelfTasks = selfTasks.filter((st) => st.user_id === emp.id)
        
        // Calculate performance score
        const performanceScore = Math.round(
          (rate * 0.6) + 
          (Math.max(0, 100 - (overdue / Math.max(filteredEmpTasks.length, 1) * 100)) * 0.3) +
          (Math.min(empSelfTasks.length * 2, 100) * 0.1)
        )

        // Task priority breakdown
        const highPriority = filteredEmpTasks.filter(t => t.priority === 'HIGH')
        const mediumPriority = filteredEmpTasks.filter(t => t.priority === 'MEDIUM')
        const lowPriority = filteredEmpTasks.filter(t => t.priority === 'LOW')

        return {
          id: emp.id,
          name: emp.full_name,
          email: emp.email,
          role: emp.role?.name || 'N/A',
          totalTasks: filteredEmpTasks.length,
          completed,
          inProgress,
          overdue,
          completionRate: rate,
          selfTasks: empSelfTasks.length,
          leaveDays,
          performanceScore,
          highPriority: highPriority.length,
          mediumPriority: mediumPriority.length,
          lowPriority: lowPriority.length,
          highPriorityCompleted: highPriority.filter(t => t.status === 'COMPLETED').length,
        }
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
  }, [employees, tasks, filteredTasks, selfTasks, leaves])

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Employee Name',
      'Email',
      'Role',
      'Total Tasks',
      'Completed',
      'In Progress',
      'Overdue',
      'Completion Rate (%)',
      'Performance Score',
      'High Priority Tasks',
      'Medium Priority Tasks',
      'Low Priority Tasks',
      'Self Tasks',
      'Leave Days',
    ]

    const rows = employeePerformance.map((emp) => [
      emp.name,
      emp.email,
      emp.role,
      emp.totalTasks,
      emp.completed,
      emp.inProgress,
      emp.overdue,
      emp.completionRate,
      emp.performanceScore,
      emp.highPriority,
      emp.mediumPriority,
      emp.lowPriority,
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
    link.setAttribute('download', `performance_report_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper function to get color based on value
  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-blue-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getPerformanceBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-blue-100'
    if (score >= 40) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and employee performance metrics</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="w-4 h-4 inline mr-1" />
              Employee Filter
            </label>
            <Select
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
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Time Range
            </label>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              options={[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'quarter', label: 'Last Quarter' },
                { value: 'year', label: 'Last Year' },
                { value: 'all', label: 'All Time' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'employees', label: 'Employee Performance', icon: Users },
            { id: 'tasks', label: 'Task Analytics', icon: ListTodo },
            { id: 'trends', label: 'Trends', icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Productivity Score</p>
                  <p className="text-3xl font-bold text-blue-900">{metrics.productivityScore}</p>
                  <p className="text-xs text-blue-600 mt-1">Out of 100</p>
                </div>
                <div className="h-14 w-14 bg-blue-200 rounded-xl flex items-center justify-center">
                  <Activity className="h-8 w-8 text-blue-700" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-900">{metrics.completionRate}%</p>
                  <p className="text-xs text-green-600 mt-1">{metrics.completedTasks} of {metrics.totalTasks} tasks</p>
                </div>
                <div className="h-14 w-14 bg-green-200 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-700" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Overdue Tasks</p>
                  <p className="text-3xl font-bold text-red-900">{metrics.overdueTasks}</p>
                  <p className="text-xs text-red-600 mt-1">Requires attention</p>
                </div>
                <div className="h-14 w-14 bg-red-200 rounded-xl flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-700" />
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Active Employees</p>
                  <p className="text-3xl font-bold text-purple-900">{metrics.totalEmployees}</p>
                  <p className="text-xs text-purple-600 mt-1">{metrics.selfTasksThisMonth} self tasks this month</p>
                </div>
                <div className="h-14 w-14 bg-purple-200 rounded-xl flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-700" />
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Task Velocity</h3>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Avg. Completion Time</span>
                    <span className="font-semibold">{metrics.avgCompletionDays} days</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">In Progress</span>
                    <span className="font-semibold">{metrics.inProgressTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(metrics.inProgressTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Open Tasks</span>
                    <span className="font-semibold">{metrics.openTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(metrics.openTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Priority Distribution</h3>
                <Target className="w-5 h-5 text-red-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">🔴 High Priority</span>
                    <span className="font-semibold">{metrics.highPriority} ({metrics.highPriorityCompleted} done)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(metrics.highPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">🟡 Medium Priority</span>
                    <span className="font-semibold">{metrics.mediumPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(metrics.mediumPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">🟢 Low Priority</span>
                    <span className="font-semibold">{metrics.lowPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(metrics.lowPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Leave Analytics</h3>
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm text-gray-600">Approved</span>
                  <span className="font-semibold text-green-700">{metrics.approvedLeaves}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="font-semibold text-yellow-700">{metrics.pendingLeaves}</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                  <span className="text-sm text-gray-600">Rejected</span>
                  <span className="font-semibold text-red-700">{metrics.rejectedLeaves}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Leave Days</span>
                    <span className="font-bold">{metrics.totalLeaveDays}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Avg per employee</span>
                    <span>{metrics.avgLeaveDaysPerEmployee} days</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Task Status Breakdown - Enhanced */}
          <Card title="Task Status Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex items-center justify-center mb-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-900">{metrics.completedTasks}</p>
                <p className="text-sm text-green-700 font-medium mt-1">Completed Tasks</p>
                <p className="text-xs text-gray-600 mt-2">{metrics.completionRate}% completion rate</p>
              </div>
              <div className="text-center p-6 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div className="flex items-center justify-center mb-3">
                  <Clock className="h-12 w-12 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-900">{metrics.inProgressTasks}</p>
                <p className="text-sm text-yellow-700 font-medium mt-1">In Progress</p>
                <p className="text-xs text-gray-600 mt-2">
                  {Math.round((metrics.inProgressTasks / Math.max(metrics.totalTasks, 1)) * 100)}% of total
                </p>
              </div>
              <div className="text-center p-6 bg-red-50 rounded-lg border-2 border-red-200">
                <div className="flex items-center justify-center mb-3">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-red-900">{metrics.overdueTasks}</p>
                <p className="text-sm text-red-700 font-medium mt-1">Overdue Tasks</p>
                <p className="text-xs text-gray-600 mt-2">Requires immediate attention</p>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Employee Performance Tab */}
      {activeTab === 'employees' && (
        <>
          {/* Top Performers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {employeePerformance.slice(0, 3).map((emp, index) => {
              const medals = ['🥇', '🥈', '🥉']
              const colors = [
                'from-yellow-50 to-yellow-100 border-yellow-200',
                'from-gray-50 to-gray-100 border-gray-300',
                'from-orange-50 to-orange-100 border-orange-200'
              ]
              return (
                <Card key={emp.id} className={`bg-gradient-to-br ${colors[index]}`}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{medals[index]}</div>
                    <h3 className="font-bold text-lg">{emp.name}</h3>
                    <p className="text-sm text-gray-600">{emp.role}</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-lg">{emp.performanceScore}</span>
                      <span className="text-sm text-gray-600">/ 100</span>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600">Tasks</p>
                        <p className="font-bold">{emp.completed}/{emp.totalTasks}</p>
                      </div>
                      <div className="bg-white p-2 rounded">
                        <p className="text-gray-600">Rate</p>
                        <p className="font-bold">{emp.completionRate}%</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Detailed Employee Performance Table */}
          <Card title="Detailed Employee Performance">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Employee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Performance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tasks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Completion
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Activity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employeePerformance.map((emp) => (
                    <>
                      <tr key={emp.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-500">{emp.role}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-1 rounded-full ${getPerformanceBgColor(emp.performanceScore)}`}>
                              <span className={`text-sm font-bold ${getPerformanceColor(emp.performanceScore)}`}>
                                {emp.performanceScore}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">Total: {emp.totalTasks}</div>
                            <div className="text-xs space-x-2">
                              <span className="text-green-600">✓ {emp.completed}</span>
                              <span className="text-yellow-600">⟳ {emp.inProgress}</span>
                              <span className="text-red-600">! {emp.overdue}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="w-full">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">{emp.completionRate}%</span>
                            </div>
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${emp.completionRate >= 80 ? 'bg-green-500' : emp.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${emp.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              <span>{emp.highPriority} ({emp.highPriorityCompleted} done)</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              <span>{emp.mediumPriority}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span>{emp.lowPriority}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-500" />
                              <span>{emp.selfTasks} self tasks</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CalendarDays className="w-3 h-3 text-purple-500" />
                              <span>{emp.leaveDays} leave days</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setExpandedEmployee(expandedEmployee === emp.id ? null : emp.id)}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            {expandedEmployee === emp.id ? (
                              <><ChevronUp className="w-4 h-4" /> Hide</>
                            ) : (
                              <><ChevronDown className="w-4 h-4" /> Details</>
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedEmployee === emp.id && (
                        <tr>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4 text-blue-500" />
                                  Task Breakdown
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Completed:</span>
                                    <span className="font-semibold text-green-600">{emp.completed}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>In Progress:</span>
                                    <span className="font-semibold text-yellow-600">{emp.inProgress}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Overdue:</span>
                                    <span className="font-semibold text-red-600">{emp.overdue}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Award className="w-4 h-4 text-yellow-500" />
                                  Performance Metrics
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Overall Score:</span>
                                    <span className={`font-semibold ${getPerformanceColor(emp.performanceScore)}`}>
                                      {emp.performanceScore}/100
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Completion Rate:</span>
                                    <span className="font-semibold">{emp.completionRate}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>High Priority Done:</span>
                                    <span className="font-semibold">{emp.highPriorityCompleted}/{emp.highPriority}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-white p-4 rounded-lg shadow-sm">
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-purple-500" />
                                  Activity Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span>Self Tasks:</span>
                                    <span className="font-semibold">{emp.selfTasks}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Leave Days:</span>
                                    <span className="font-semibold">{emp.leaveDays}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Total Tasks:</span>
                                    <span className="font-semibold">{emp.totalTasks}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {employeePerformance.length === 0 && (
              <p className="text-center text-gray-500 py-8">No employee data available</p>
            )}
          </Card>
        </>
      )}

      {/* Task Analytics Tab */}
      {activeTab === 'tasks' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Task Status Chart */}
            <Card title="Task Status Distribution">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-bold text-green-600">{metrics.completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.completedTasks / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm font-bold text-yellow-600">{metrics.inProgressTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-yellow-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.inProgressTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.inProgressTasks / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Open</span>
                    <span className="text-sm font-bold text-blue-600">{metrics.openTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.openTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.openTasks / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Overdue</span>
                    <span className="text-sm font-bold text-red-600">{metrics.overdueTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.overdueTasks / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.overdueTasks / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Priority Distribution Chart */}
            <Card title="Priority Distribution">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                      <span className="text-sm font-medium">High Priority</span>
                    </div>
                    <span className="text-sm font-bold text-red-600">{metrics.highPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-red-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.highPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.highPriority / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {metrics.highPriorityCompleted} completed ({metrics.highPriority > 0 ? Math.round((metrics.highPriorityCompleted / metrics.highPriority) * 100) : 0}%)
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="text-sm font-medium">Medium Priority</span>
                    </div>
                    <span className="text-sm font-bold text-yellow-600">{metrics.mediumPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-yellow-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.mediumPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.mediumPriority / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                      <span className="text-sm font-medium">Low Priority</span>
                    </div>
                    <span className="text-sm font-bold text-green-600">{metrics.lowPriority}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-green-500 h-4 rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${(metrics.lowPriority / Math.max(metrics.totalTasks, 1)) * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {Math.round((metrics.lowPriority / Math.max(metrics.totalTasks, 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Task Insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="text-center">
                <ListTodo className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{metrics.totalTasks}</p>
                <p className="text-sm text-blue-700">Total Tasks</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <div className="text-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{metrics.completionRate}%</p>
                <p className="text-sm text-green-700">Completion Rate</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <div className="text-center">
                <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-900">{metrics.avgCompletionDays}</p>
                <p className="text-sm text-yellow-700">Avg Days to Complete</p>
              </div>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-900">{metrics.overdueTasks}</p>
                <p className="text-sm text-red-700">Overdue Tasks</p>
              </div>
            </Card>
          </div>
        </>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <>
          <Card title="Monthly Task Completion Trends">
            <div className="space-y-4">
              {monthlyTrends.map((trend, index) => (
                <div key={index} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{trend.month}</h4>
                    <span className="text-sm text-gray-600">Total: {trend.total} tasks</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Completed</span>
                          <span className="font-semibold text-green-600">{trend.completed}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(trend.completed / Math.max(trend.total, 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>In Progress</span>
                          <span className="font-semibold text-yellow-600">{trend.inProgress}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full"
                            style={{ width: `${(trend.inProgress / Math.max(trend.total, 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Open</span>
                          <span className="font-semibold text-blue-600">{trend.open}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(trend.open / Math.max(trend.total, 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between px-3 py-1 bg-gray-50 rounded">
                    <span className="text-xs text-gray-600">Completion Rate</span>
                    <span className="text-sm font-bold text-gray-900">{trend.completionRate}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Self-Task Activity">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">This Month</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{metrics.selfTasksThisMonth}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">All Time</span>
                  </div>
                  <span className="text-2xl font-bold text-gray-600">{metrics.selfTasksCount}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    Average per employee: <span className="font-bold">{Math.round(metrics.selfTasksThisMonth / Math.max(metrics.totalEmployees, 1))}</span> this month
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Leave Trends">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-green-600">{metrics.approvedLeaves}</p>
                    <p className="text-xs text-gray-600">Approved</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-yellow-600">{metrics.pendingLeaves}</p>
                    <p className="text-xs text-gray-600">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <XCircle className="w-5 h-5 text-red-600 mx-auto mb-1" />
                    <p className="text-xl font-bold text-red-600">{metrics.rejectedLeaves}</p>
                    <p className="text-xs text-gray-600">Rejected</p>
                  </div>
                </div>
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Leave Days</span>
                    <span className="font-bold">{metrics.totalLeaveDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg per Employee</span>
                    <span className="font-bold">{metrics.avgLeaveDaysPerEmployee} days</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
