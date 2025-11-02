'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  FileText,
  Sparkles,
  Edit2
} from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Modal from '@/components/ui/Modal'
import AssignTaskModal from '@/components/modals/AssignTaskModal'
import { useToast } from '@/components/ui/Toast'
import { getToday } from '@/lib/utils/date'

interface DashboardClientProps {
  user: {
    id: string
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
  const router = useRouter()
  const { showToast } = useToast()
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showSelfTaskModal, setShowSelfTaskModal] = useState(false)
  const [isSubmittingSelfTask, setIsSubmittingSelfTask] = useState(false)
  const [selfTaskForm, setSelfTaskForm] = useState({
    task_date: getToday(),
    details: '',
  })

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Handle self task submission
  const handleSelfTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingSelfTask(true)

    try {
      const response = await fetch('/api/self-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selfTaskForm,
          visibility: 'PUBLIC',
          user_id: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to log self task')

      showToast('success', 'Self task logged successfully')
      setSelfTaskForm({ task_date: getToday(), details: '' })
      setShowSelfTaskModal(false)
      router.refresh()
    } catch (error) {
      showToast('error', 'Failed to log self task')
    } finally {
      setIsSubmittingSelfTask(false)
    }
  }

  return (
    <div className="space-y-4 md:space-y-8 pb-20 md:pb-8 px-3 md:px-0">
      {/* Welcome Section with Gradient Background - Mobile Optimized */}
      <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 md:p-6 text-white shadow-lg md:shadow-xl">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="absolute -right-16 -top-16 h-32 w-32 md:h-48 md:w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-32 w-32 md:h-48 md:w-48 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col space-y-3 md:space-y-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 md:w-5 md:h-5 animate-pulse" />
                <p className="text-[11px] md:text-sm font-medium text-blue-100">{getGreeting()}</p>
              </div>
              <h1 className="text-lg md:text-3xl font-bold mb-1 md:mb-2 leading-tight">
                Welcome, {user.full_name.split(' ')[0]}!
              </h1>
              <p className="text-xs md:text-base text-blue-100 leading-snug md:leading-relaxed">
                {isCEO 
                  ? "📊 Organization performance overview" 
                  : "🎯 Your dashboard for productivity"}
              </p>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full">
              <Button
                onClick={() => setShowSelfTaskModal(true)}
                className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-200 shadow-lg px-3 py-2.5 md:px-4 md:py-3 text-sm font-semibold rounded-lg md:rounded-xl flex items-center justify-center gap-2 min-h-[44px] md:min-h-[48px]"
              >
                <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                <span>Log Self Task</span>
              </Button>
              {isCEO && (
                <Button
                  onClick={() => setShowAssignModal(true)}
                  className="bg-white/20 hover:bg-white/30 active:bg-white/40 text-white backdrop-blur-sm border border-white/30 hover:border-white/40 transition-all duration-200 shadow-lg px-3 py-2.5 md:px-4 md:py-3 text-sm font-semibold rounded-lg md:rounded-xl flex items-center justify-center gap-2 min-h-[44px] md:min-h-[48px]"
                >
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Assign Task</span>
                </Button>
              )}
            </div>
            
            {/* Role Badge */}
            <div className="flex items-center">
              <div className="inline-flex items-center gap-1.5 md:gap-2 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1.5 md:px-3.5 md:py-2 text-xs md:text-sm font-medium">
                <Activity className="w-3 h-3 md:w-4 md:h-4" />
                <span>{user.role.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Modern Design - Mobile Optimized */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {/* Active Tasks - Premium Card */}
        <Link href="/tasks" className="group">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-blue-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                    <Target className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                    <p className="text-[10px] md:text-xs font-bold text-blue-600 uppercase tracking-wide">
                      {isCEO ? 'Total Active' : 'My Active'}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700">Tasks</p>
                </div>
                <div className="p-2 md:p-3 bg-blue-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                  <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-1.5">{stats.activeTasks}</p>
                  <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                    <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    View all tasks
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-blue-600 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </Link>

        {/* Self Tasks - Premium Card */}
        <Link href="/self-tasks" className="group">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-purple-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 md:w-4 md:h-4 text-purple-600" />
                    <p className="text-[10px] md:text-xs font-bold text-purple-600 uppercase tracking-wide">
                      {isCEO ? 'Total Self' : 'My Self'}
                    </p>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700">Tasks</p>
                </div>
                <div className="p-2 md:p-3 bg-purple-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                  <ClipboardList className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-1.5">{stats.selfTasksCount}</p>
                  <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    Log new task
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-purple-600 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </Link>

        {/* Pending Leaves - Premium Card */}
        <Link href="/leaves" className="group">
          <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-amber-200">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-600" />
                    <p className="text-[10px] md:text-xs font-bold text-amber-600 uppercase tracking-wide">
                      Pending
                    </p>
                  </div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700">Leave Requests</p>
                </div>
                <div className="p-2 md:p-3 bg-amber-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                  <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-1.5">{stats.pendingLeaves}</p>
                  <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                    <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                    {isCEO ? 'Review requests' : 'View leaves'}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-amber-600 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </Link>

        {/* CEO-specific stats */}
        {isCEO && (
          <>
            {/* Active Employees */}
            <Link href="/admin" className="group">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-emerald-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-600" />
                        <p className="text-[10px] md:text-xs font-bold text-emerald-600 uppercase tracking-wide">
                          Active
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700">Employees</p>
                    </div>
                    <div className="p-2 md:p-3 bg-emerald-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                      <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-1.5">{stats.totalEmployees}</p>
                      <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                        <Settings className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        Manage team
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Overdue Tasks */}
            <Link href="/tasks" className="group">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-red-50 to-red-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-red-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-600 animate-pulse" />
                        <p className="text-[10px] md:text-xs font-bold text-red-600 uppercase tracking-wide">
                          Overdue
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700">Tasks</p>
                    </div>
                    <div className="p-2 md:p-3 bg-red-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-1.5">{stats.overdueTasksCount}</p>
                      <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                        <Eye className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        Review urgently
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-red-600 group-hover:translate-x-1 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Completion Rate */}
            <Link href="/reports" className="group">
              <div className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 md:p-6 shadow-lg hover:shadow-2xl active:shadow-md transition-all duration-200 hover:-translate-y-1 active:translate-y-0 border border-indigo-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 md:gap-2 mb-1">
                        <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-600" />
                        <p className="text-[10px] md:text-xs font-bold text-indigo-600 uppercase tracking-wide">
                          Completion
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold text-gray-700">Rate</p>
                    </div>
                    <div className="p-2 md:p-3 bg-indigo-600 rounded-lg md:rounded-xl shadow-lg group-hover:scale-110 group-active:scale-100 transition-transform duration-200">
                      <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stats.completionRate}%</p>
                      {/* Progress Bar */}
                      <div className="w-full bg-indigo-200 rounded-full h-1.5 md:h-2 overflow-hidden mb-1.5 md:mb-2">
                        <div 
                          className="bg-gradient-to-r from-indigo-600 to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                      <p className="text-[11px] md:text-xs text-gray-600 flex items-center gap-1 md:gap-1.5 font-medium">
                        <BarChart3 className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        View analytics
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-indigo-600 group-hover:translate-x-1 transition-transform duration-200 ml-2" />
                  </div>
                </div>
              </div>
            </Link>
          </>
        )}
      </div>

      {/* Performance Summary - Only for CEO - Mobile Optimized */}
      {isCEO && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-xl p-5 md:p-8 border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between mb-5 md:mb-6 gap-3">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Performance Overview
              </h2>
              <p className="text-sm text-gray-600 mt-1.5">Key metrics at a glance</p>
            </div>
            <Link href="/reports" className="w-full sm:w-auto">
              <Button variant="ghost" size="sm" className="flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0">
                <span className="text-sm font-medium">Full Report</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
              <div className="flex flex-col gap-2 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg w-fit">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">Active Tasks</p>
              </div>
              <p className="text-3xl md:text-3xl font-bold text-gray-900 mb-2">{stats.activeTasks}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Activity className="w-3.5 h-3.5" />
                <span>In progress</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
              <div className="flex flex-col gap-2 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg w-fit">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">Team Members</p>
              </div>
              <p className="text-3xl md:text-3xl font-bold text-gray-900 mb-2">{stats.totalEmployees}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Activity className="w-3.5 h-3.5" />
                <span>Active now</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
              <div className="flex flex-col gap-2 mb-3">
                <div className="p-2 bg-red-100 rounded-lg w-fit">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">Overdue</p>
              </div>
              <p className="text-3xl md:text-3xl font-bold text-gray-900 mb-2">{stats.overdueTasksCount}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>Urgent</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6 shadow-md border border-gray-200">
              <div className="flex flex-col gap-2 mb-3">
                <div className="p-2 bg-indigo-100 rounded-lg w-fit">
                  <Award className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-xs font-semibold text-gray-600 leading-tight">Completion</p>
              </div>
              <p className="text-3xl md:text-3xl font-bold text-gray-900 mb-2">{stats.completionRate}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productivity Tips - Mobile Optimized */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 md:p-6 border border-cyan-200 shadow-md">
        <div className="flex items-start gap-4">
          <div className="p-2.5 md:p-3 bg-cyan-500 rounded-xl flex-shrink-0 shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">💡 Productivity Tip</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
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

      {/* Log Self Task Modal */}
      <Modal
        isOpen={showSelfTaskModal}
        onClose={() => {
          setShowSelfTaskModal(false)
          setSelfTaskForm({ task_date: getToday(), details: '' })
        }}
        title="✨ Log Self Task"
        size="lg"
      >
        <form onSubmit={handleSelfTaskSubmit} className="space-y-5">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-blue-600 p-2.5 rounded-lg shadow-md">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-base font-bold text-gray-900 mb-1">
                  Task Date
                </label>
                <p className="text-xs text-gray-600 mb-3">Select the date for this task</p>
              </div>
            </div>
            <Input
              type="date"
              value={selfTaskForm.task_date}
              onChange={(e) => setSelfTaskForm({ ...selfTaskForm, task_date: e.target.value })}
              required
              className="bg-white text-base"
            />
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="bg-purple-600 p-2.5 rounded-lg shadow-md">
                <Edit2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <label className="block text-base font-bold text-gray-900 mb-1">
                  Task Details
                </label>
                <p className="text-xs text-gray-600">
                  Share what you accomplished, challenges faced, or tasks completed
                </p>
              </div>
            </div>
            <Textarea
              value={selfTaskForm.details}
              onChange={(e) => setSelfTaskForm({ ...selfTaskForm, details: e.target.value })}
              required
              placeholder="✍️ Describe what you worked on today..."
              rows={8}
              className="bg-white border-purple-200 focus:ring-purple-500 text-base"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-5 border-t-2 border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowSelfTaskModal(false)
                setSelfTaskForm({ task_date: getToday(), details: '' })
              }}
              className="min-h-[48px] text-base font-medium"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={isSubmittingSelfTask}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-h-[48px] text-base font-medium"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Log Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
