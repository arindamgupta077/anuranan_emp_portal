import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import LeavesClient from './LeavesClient'

// Dynamic rendering to ensure fresh data after mutations
export const dynamic = 'force-dynamic'
// Disable caching for this page to show immediate updates
export const revalidate = 0

export default async function LeavesPage() {
  const supabase = await createServerClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*), profile_photo_url')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const isCEO = user.role.name === 'CEO'

  // Build leaves query
  let leavesQuery = supabase
    .from('leaves')
    .select(`
      *,
      user:users!user_id(id, full_name, email, profile_photo_url),
      approver:users!approved_by(id, full_name, profile_photo_url)
    `)
    .order('created_at', { ascending: false })

  if (!isCEO) {
    leavesQuery = leavesQuery.eq('user_id', user.id)
  }

  // Fetch leaves and employees in parallel for CEO
  let leaves: any[] = []
  let employees: any[] = []

  if (isCEO) {
    const [leavesResult, employeesResult] = await Promise.all([
      leavesQuery,
      supabase
        .from('users')
        .select('id, full_name')
        .eq('is_active', true)
        .order('full_name')
    ])
    leaves = leavesResult.data || []
    employees = employeesResult.data || []
  } else {
    const { data } = await leavesQuery
    leaves = data || []
  }

  return (
    <ProtectedLayout user={user}>
      <LeavesClient user={user} leaves={leaves} employees={employees} />
    </ProtectedLayout>
  )
}
