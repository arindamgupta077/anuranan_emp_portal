'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface AssignTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AssignTaskModal({ isOpen, onClose, onSuccess }: AssignTaskModalProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [employees, setEmployees] = useState<{ id: string; full_name: string }[]>([])
  const [formData, setFormData] = useState({
    title: '',
    details: '',
    assigned_to: '',
    due_date: ''
  })

  // Fetch employees when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEmployees()
    }
  }, [isOpen])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/admin/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          details: '',
          assigned_to: '',
          due_date: ''
        })
        
        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }
        
        // Close modal
        onClose()
        
        // Refresh the page to show updated data
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to assign task')
      }
    } catch (error) {
      console.error('Error assigning task:', error)
      alert('An error occurred while assigning the task')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: '',
        details: '',
        assigned_to: '',
        due_date: ''
      })
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Assign New Task"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100 mb-4">
          <p className="text-sm text-gray-700">
            Create and assign a new task to team members. Fill in all required fields to proceed.
          </p>
        </div>

        <div className="space-y-1">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter a clear and concise task title"
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <Textarea
            label="Task Details"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            placeholder="Provide detailed description of the task requirements and expectations..."
            rows={4}
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <Select
            label="Assign To"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            required
            options={[
              { value: '', label: 'Select an employee' },
              ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
            ]}
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <Input
            type="date"
            label="Due Date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleClose}
            className="px-6"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            className="px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            Assign Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
