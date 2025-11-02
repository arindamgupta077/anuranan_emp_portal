export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role_id: string | null
          is_active: boolean
          profile_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role_id?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role_id?: string | null
          is_active?: boolean
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          task_number: number
          title: string
          details: string | null
          status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          assigned_to: string | null
          created_by: string | null
          due_date: string | null
          execution_date: string | null
          recurring_task_id: string | null
          updated_by: string | null
          comment: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_number?: number
          title: string
          details?: string | null
          status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          execution_date?: string | null
          recurring_task_id?: string | null
          updated_by?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_number?: number
          title?: string
          details?: string | null
          status?: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED'
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          execution_date?: string | null
          recurring_task_id?: string | null
          updated_by?: string | null
          comment?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_history: {
        Row: {
          id: string
          task_id: string | null
          changed_by: string | null
          old_status: string | null
          new_status: string | null
          changed_at: string
        }
        Insert: {
          id?: string
          task_id?: string | null
          changed_by?: string | null
          old_status?: string | null
          new_status?: string | null
          changed_at?: string
        }
        Update: {
          id?: string
          task_id?: string | null
          changed_by?: string | null
          old_status?: string | null
          new_status?: string | null
          changed_at?: string
        }
      }
      self_tasks: {
        Row: {
          id: string
          user_id: string | null
          task_date: string
          details: string
          visibility: 'PUBLIC' | 'PRIVATE'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          task_date: string
          details: string
          visibility?: 'PUBLIC' | 'PRIVATE'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          task_date?: string
          details?: string
          visibility?: 'PUBLIC' | 'PRIVATE'
          created_at?: string
          updated_at?: string
        }
      }
      leaves: {
        Row: {
          id: string
          user_id: string | null
          start_date: string
          end_date: string
          reason: string | null
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          start_date: string
          end_date: string
          reason?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          start_date?: string
          end_date?: string
          reason?: string | null
          status?: 'PENDING' | 'APPROVED' | 'REJECTED'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recurring_tasks: {
        Row: {
          id: string
          title: string
          details: string | null
          assigned_to: string | null
          created_by: string | null
          recurrence_type: 'WEEKLY' | 'MONTHLY'
          recurrence_value: number
          start_date: string
          end_date: string | null
          is_active: boolean
          last_spawned_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          details?: string | null
          assigned_to?: string | null
          created_by?: string | null
          recurrence_type: 'WEEKLY' | 'MONTHLY'
          recurrence_value: number
          start_date: string
          end_date?: string | null
          is_active?: boolean
          last_spawned_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          details?: string | null
          assigned_to?: string | null
          created_by?: string | null
          recurrence_type?: 'WEEKLY' | 'MONTHLY'
          recurrence_value?: number
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          last_spawned_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_ceo: {
        Args: { user_id: string }
        Returns: boolean
      }
      calculate_completion_rate: {
        Args: { user_id: string; start_date: string; end_date: string }
        Returns: number
      }
      count_overdue_tasks: {
        Args: { user_id: string }
        Returns: number
      }
      spawn_recurring_tasks: {
        Args: Record<string, never>
        Returns: void
      }
    }
  }
}
