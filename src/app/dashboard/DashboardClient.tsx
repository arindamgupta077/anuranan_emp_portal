'use client'

import { useState } from 'react'
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
  Settings,
  ArrowRight,
  Activity,
  Target,
  Award,
  Clock,
  Zap,
  BarChart3,
  FileText
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import AssignTaskModal from '@/components/modals/AssignTaskModal'

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
  const [showAssignModal, setShowAssignModal] = useState(false)

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Section with Gradient Background - Compact */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 animate-pulse" />
                <p className="text-sm font-medium text-blue-100">{getGreeting()}</p>
              </div>
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user.full_name}!
              </h1>
              <p className="text-sm text-blue-100 max-w-xl">
                {isCEO 
                  ? "📊 Here's a comprehensive overview of your organization's performance and activities" 
                  : "🎯 Here's your personalized dashboard with everything you need to stay productive"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isCEO && (
                <Button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl px-4 py-2 text-sm font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Assign Task
                </Button>
              )}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-xs font-medium whitespace-nowrap">
                <Activity className="w-3.5 h-3.5" />
                <span>Role: {user.role.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Active Tasks - Premium Card */}
        <Link href="/tasks" className="group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-blue-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-600" />
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {isCEO ? 'Total Active' : 'My Active'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Tasks</p>
                </div>
                <div className="p-3 bg-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.activeTasks}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    View all tasks
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </Link>

        {/* Self Tasks - Premium Card */}
        <Link href="/self-tasks" className="group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-purple-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                      {isCEO ? 'Total Self' : 'My Self'}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Tasks</p>
                </div>
                <div className="p-3 bg-purple-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.selfTasksCount}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    Log new task
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Leaves - Premium Card */}
        <Link href="/leaves" className="group">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-amber-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Pending
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Leave Requests</p>
                </div>
                <div className="p-3 bg-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900 mb-1">{stats.pendingLeaves}</p>
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {isCEO ? 'Review requests' : 'View leaves'}
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-amber-600 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </Link>

        {/* CEO-specific stats */}
        {isCEO && (
          <>
            {/* Active Employees */}
            <Link href="/admin" className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-emerald-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                          Active
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Employees</p>
                    </div>
                    <div className="p-3 bg-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900 mb-1">{stats.totalEmployees}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Settings className="w-3 h-3" />
                        Manage team
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Overdue Tasks */}
            <Link href="/tasks" className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-red-50 to-red-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-red-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">
                          Overdue
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Tasks</p>
                    </div>
                    <div className="p-3 bg-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-900 mb-1">{stats.overdueTasksCount}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Review urgently
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-red-600 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Completion Rate */}
            <Link href="/reports" className="group">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                          Completion
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-700">Rate</p>
                    </div>
                    <div className="p-3 bg-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <p className="text-4xl font-bold text-gray-900 mb-2">{stats.completionRate}%</p>
                      {/* Progress Bar */}
                      <div className="w-full bg-indigo-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 flex items-center gap-1 mt-2">
                        <BarChart3 className="w-3 h-3" />
                        View analytics
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-indigo-600 group-hover:translate-x-1 transition-transform duration-300 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Quick Actions Section with Premium Design */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              Quick Actions
            </h2>
            <p className="text-sm text-gray-600 mt-1">Frequently used features at your fingertips</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Regular User Actions */}
          <Link href="/tasks" className="group">
            <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <CheckSquare className="w-8 h-8 text-white mb-3 relative z-10" />
              <h3 className="text-white font-semibold text-lg mb-1 relative z-10">My Tasks</h3>
              <p className="text-blue-100 text-sm relative z-10">View and manage assigned tasks</p>
              <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          <Link href="/self-tasks" className="group">
            <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <ClipboardList className="w-8 h-8 text-white mb-3 relative z-10" />
              <h3 className="text-white font-semibold text-lg mb-1 relative z-10">Self Tasks</h3>
              <p className="text-purple-100 text-sm relative z-10">Log your own tasks & activities</p>
              <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          <Link href="/leaves" className="group">
            <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
              <Calendar className="w-8 h-8 text-white mb-3 relative z-10" />
              <h3 className="text-white font-semibold text-lg mb-1 relative z-10">Leave Request</h3>
              <p className="text-amber-100 text-sm relative z-10">Request time off & track leaves</p>
              <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </Link>

          {/* CEO-specific actions */}
          {isCEO && (
            <>
              <Link href="/admin?tab=create-task" className="group">
                <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <Plus className="w-8 h-8 text-white mb-3 relative z-10" />
                  <h3 className="text-white font-semibold text-lg mb-1 relative z-10">Assign Task</h3>
                  <p className="text-emerald-100 text-sm relative z-10">Create & assign tasks to team</p>
                  <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>

              <Link href="/admin?tab=employees" className="group">
                <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <Users className="w-8 h-8 text-white mb-3 relative z-10" />
                  <h3 className="text-white font-semibold text-lg mb-1 relative z-10">Team Management</h3>
                  <p className="text-indigo-100 text-sm relative z-10">Manage employees & roles</p>
                  <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>

              <Link href="/reports" className="group">
                <div className="relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10" />
                  <BarChart3 className="w-8 h-8 text-white mb-3 relative z-10" />
                  <h3 className="text-white font-semibold text-lg mb-1 relative z-10">Analytics</h3>
                  <p className="text-rose-100 text-sm relative z-10">View reports & insights</p>
                  <ArrowRight className="w-5 h-5 text-white absolute bottom-4 right-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Performance Summary - Only for CEO */}
      {isCEO && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Performance Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1">Key metrics at a glance</p>
            </div>
            <Link href="/reports">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <span>Full Report</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeTasks}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Activity className="w-3 h-3" />
                <span>In progress</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalEmployees}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Activity className="w-3 h-3" />
                <span>Active employees</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.overdueTasksCount}</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Needs attention</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm font-medium text-gray-600">Completion</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Tips */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-cyan-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">💡 Productivity Tip</h3>
            <p className="text-gray-700">
              {isCEO 
                ? "Review overdue tasks regularly and provide support to team members who may be facing challenges. Clear communication leads to better outcomes."
                : "Break down large tasks into smaller, manageable chunks. Complete high-priority items during your peak productivity hours for best results."}
            </p>
          </div>
        </div>
      </div>

      {/* Assign Task Modal - CEO Only */}
      {isCEO && (
        <AssignTaskModal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
        />
      )}
    </div>
  )
}
