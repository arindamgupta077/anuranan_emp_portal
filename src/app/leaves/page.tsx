import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import ProtectedLayout from '@/components/layout/ProtectedLayout'
import LeavesClient from './LeavesClient'

export default async function LeavesPage() {
  const supabase = await createServerClient()
  
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: user } = await supabase
    .from('users')
    .select('*, role:roles(*)')
    .eq('id', authUser.id)
    .single()

  if (!user) redirect('/login')

  const isCEO = user.role.name === 'CEO'

  // Fetch leaves
  let leavesQuery = supabase
    .from('leaves')
    .select(`
      *,
      user:users!user_id(id, full_name, email),
      approver:users!approved_by(id, full_name)
    `)
    .order('created_at', { ascending: false })

  if (!isCEO) {
    leavesQuery = leavesQuery.eq('user_id', user.id)
  }

  const { data: leaves } = await leavesQuery

  // Fetch all employees for CEO filter
  let employees: any[] = []
  if (isCEO) {
    const { data } = await supabase
      .from('users')
      .select('id, full_name')
      .eq('is_active', true)
      .order('full_name')
    employees = data || []
  }

  return (
    <ProtectedLayout user={user}>
      <LeavesClient user={user} leaves={leaves || []} employees={employees} />
    </ProtectedLayout>
  )
}
