'use client'

import Link from 'next/link'
import { 
  CheckSquare, 
  ClipboardList, 
  Calendar, 
  Users, 
  AlertCircle, 
  TrendingUp,
  Plus,
  Eye,
  Settings
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface DashboardClientProps {
  user: {
    full_name: string
    role: {
      name: string
    }
  }
  stats: {
    activeTasks: number
    selfTasksCount: number
    pendingLeaves: number
    totalEmployees: number
    overdueTasksCount: number
    completionRate: number
  }
}

export default function DashboardClient({ user, stats }: DashboardClientProps) {
  const isCEO = user.role.name === 'CEO'

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user.full_name}!
        </h1>
        <p className="mt-2 text-gray-600">
          {isCEO 
            ? "Here's an overview of your organization's activities" 
            : "Here's what you need to focus on today"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Tasks */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isCEO ? 'Total Active Tasks' : 'My Active Tasks'}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckSquare className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/tasks">
              <Button variant="ghost" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Tasks
              </Button>
            </Link>
          </div>
        </Card>

        {/* Self Tasks */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isCEO ? 'Total Self Tasks' : 'My Self Tasks'}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.selfTasksCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ClipboardList className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/self-tasks">
              <Button variant="ghost" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Log Task
              </Button>
            </Link>
          </div>
        </Card>

        {/* Pending Leaves */}
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {isCEO ? 'Pending Leave Requests' : 'My Pending Leaves'}
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingLeaves}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link href="/leaves">
              <Button variant="ghost" size="sm" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Leaves
              </Button>
            </Link>
          </div>
        </Card>

        {/* CEO-specific stats */}
        {isCEO && (
          <>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Employees</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.overdueTasksCount}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/tasks">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </Link>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <TrendingUp className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link href="/reports">
                  <Button variant="ghost" size="sm" className="w-full">
                    <Eye className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </Link>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tasks">
            <Button variant="secondary" className="w-full">
              <CheckSquare className="w-5 h-5 mr-2" />
              View My Tasks
            </Button>
          </Link>
          <Link href="/self-tasks">
            <Button variant="secondary" className="w-full">
              <Plus className="w-5 h-5 mr-2" />
              Log Self Task
            </Button>
          </Link>
          <Link href="/leaves">
            <Button variant="secondary" className="w-full">
              <Calendar className="w-5 h-5 mr-2" />
              Request Leave
            </Button>
          </Link>
          {isCEO && (
            <>
              <Link href="/admin?tab=create-task">
                <Button variant="primary" className="w-full">
                  <Plus className="w-5 h-5 mr-2" />
                  Assign Task
                </Button>
              </Link>
              <Link href="/admin?tab=employees">
                <Button variant="primary" className="w-full">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Employees
                </Button>
              </Link>
              <Link href="/reports">
                <Button variant="primary" className="w-full">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Reports
                </Button>
              </Link>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
