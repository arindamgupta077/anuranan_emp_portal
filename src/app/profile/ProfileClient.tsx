'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Mail, Shield, CheckCircle, ClipboardList, Calendar, FileText, Camera, Upload, Edit2, Loader2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'

type UserData = {
  id: string
  full_name: string
  email: string
  status: string
  profile_photo_url?: string | null
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
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [fullName, setFullName] = useState(user.full_name)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState(user.profile_photo_url)
  const [imageError, setImageError] = useState(false)

  // Sync state with props when user data changes
  useEffect(() => {
    setProfilePhotoUrl(user.profile_photo_url)
    setFullName(user.full_name)
    setImageError(false) // Reset error state when URL changes
  }, [user.profile_photo_url, user.full_name])

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0

  const handlePhotoClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/profile', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to upload photo')
      }

      const data = await response.json()
      setProfilePhotoUrl(data.profile_photo_url)
      showToast('success', 'Profile photo updated successfully')
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to upload photo')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) {
      showToast('error', 'Name cannot be empty')
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update profile')
      }

      showToast('success', 'Profile updated successfully')
      setIsEditModalOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Update error:', error)
      showToast('error', error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = () => {
    return user.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button
          onClick={() => setIsEditModalOpen(true)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      {/* Profile Card */}
      <Card>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Photo with Upload */}
          <div className="relative group">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
              {profilePhotoUrl && !imageError ? (
                <Image
                  src={profilePhotoUrl}
                  alt={user.full_name}
                  fill
                  className="object-cover"
                  sizes="128px"
                  priority
                  onError={() => {
                    console.error('Failed to load profile photo:', profilePhotoUrl)
                    setImageError(true)
                  }}
                  unoptimized={profilePhotoUrl.includes('supabase')}
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                  {getInitials()}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <button
              onClick={handlePhotoClick}
              disabled={isUploading}
              className="absolute bottom-0 right-0 h-10 w-10 bg-primary text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-5 w-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-3">{user.full_name}</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <span className="text-base">{user.email}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-gray-600">
                  <Shield className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="font-semibold text-base">{user.role.name}</span>
                </div>
                <Badge status={user.status} />
              </div>
              {user.role.description && (
                <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-lg">
                  {user.role.description}
                </p>
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

      {/* Account Info */}
      <Card title="Account Information">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 mb-1">User ID</dt>
            <dd className="text-sm text-gray-900 font-mono break-all">{user.id}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 mb-1">Status</dt>
            <dd className="mt-1">
              <Badge status={user.status} />
            </dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 mb-1">Role</dt>
            <dd className="mt-1 text-sm text-gray-900 font-semibold">{user.role.name}</dd>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500 mb-1">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
        </dl>
      </Card>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              value={user.email}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email cannot be changed
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={() => setIsEditModalOpen(false)}
              variant="ghost"
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              variant="primary"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
