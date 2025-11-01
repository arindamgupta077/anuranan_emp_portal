'use client'

import { useRouter } from 'next/navigation'
import { User, Mail, Shield, CheckCircle, ClipboardList, Calendar, FileText } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

type UserData = {
  id: string
  full_name: string
  email: string
  status: string
  role: {
    name: string
    description: string | null
  }
}

type Stats = {
  completedTasks: number
  totalTasks: number
  totalSelfTasks: number
  approvedLeaves: number
}

type Props = {
  user: UserData
  stats: Stats
}

export default function ProfileClient({ user, stats }: Props) {
  const router = useRouter()

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex items-start space-x-6">
          <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{user.full_name}</h2>
            <div className="space-y-2">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center text-gray-600">
                  <Shield className="h-4 w-4 mr-2" />
                  <span className="font-medium">{user.role.name}</span>
                </div>
                <Badge status={user.status} />
              </div>
              {user.role.description && (
                <p className="text-sm text-gray-500 mt-2">{user.role.description}</p>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{stats.completedTasks}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Self Tasks</p>
              <p className="text-2xl font-bold">{stats.totalSelfTasks}</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved Leaves</p>
              <p className="text-2xl font-bold">{stats.approvedLeaves}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Performance */}
      <Card title="Performance">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Task Completion Rate</span>
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.completedTasks}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.totalTasks - stats.completedTasks}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.totalSelfTasks}</p>
              <p className="text-sm text-gray-600">Self Logged</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button onClick={() => router.push('/dashboard')} variant="ghost">
            Dashboard
          </Button>
          <Button onClick={() => router.push('/tasks')} variant="ghost">
            My Tasks
          </Button>
          <Button onClick={() => router.push('/self-tasks')} variant="ghost">
            Self Tasks
          </Button>
          <Button onClick={() => router.push('/leaves')} variant="ghost">
            Leaves
          </Button>
        </div>
      </Card>

      {/* Account Info */}
      <Card title="Account Information">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">User ID</dt>
            <dd className="mt-1 text-sm text-gray-900 font-mono">{user.id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1">
              <Badge status={user.status} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Role</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.role.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
        </dl>
      </Card>
    </div>
  )
}
