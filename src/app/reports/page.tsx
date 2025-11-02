import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ReportsClient from './ReportsClient'
import ProtectedLayout from '@/components/layout/ProtectedLayout'

// Cache for 15 minutes with automatic revalidation
export const revalidate = 900
// Auto: Let Next.js decide based on request
export const fetchCache = 'default-cache'

export default async function ReportsPage() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*), profile_photo_url')
    .eq('id', authUser.id)
    .single()

  if (!user || (user.role as any)?.name !== 'CEO') {
    redirect('/dashboard')
  }

  // Fetch all data in parallel for better performance
  const [
    { data: employees },
    { data: tasks },
    { data: selfTasks },
    { data: leaves }
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, full_name, email, status, profile_photo_url, role:roles(name)')
      .order('full_name'),
    supabase
      .from('tasks')
      .select('*, assigned_to_user:users!assigned_to(id, full_name, profile_photo_url), created_by_user:users!created_by(id, full_name, profile_photo_url)')
      .order('created_at', { ascending: false }),
    supabase
      .from('self_tasks')
      .select('*, user:users(id, full_name, profile_photo_url)')
      .order('date', { ascending: false }),
    supabase
      .from('leaves')
      .select('*, user:users(id, full_name, profile_photo_url)')
      .order('created_at', { ascending: false })
  ])

  return (
    <ProtectedLayout user={user}>
      <ReportsClient
        employees={employees || []}
        tasks={tasks || []}
        selfTasks={selfTasks || []}
        leaves={leaves || []}
      />
    </ProtectedLayout>
  )
}
