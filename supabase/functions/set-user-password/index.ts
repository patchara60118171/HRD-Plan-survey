import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Admin client with service_role key (never exposed to frontend)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Server config missing: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey
    )

    // Verify caller is authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
    if (authErr || !user) throw new Error('Unauthorized: invalid token')

    // Check caller has admin role
    const { data: callerRole } = await supabaseAdmin
      .from('admin_user_roles')
      .select('role')
      .eq('email', user.email)
      .single()

    const callerRoleValue = String(callerRole?.role || '').toLowerCase()
    if (!callerRole || !['super_admin', 'superadmin', 'admin'].includes(callerRoleValue)) {
      throw new Error('Forbidden: requires admin or super_admin role')
    }

    const { email, password, action } = await req.json()
    const normalizedEmail = String(email || '').trim().toLowerCase()

    if (!normalizedEmail || !password) {
      throw new Error('Missing required fields: email, password')
    }

    // Action: create — create new auth user with email_confirm: true
    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
      })
      if (error) {
        const message = (error.message || '').toLowerCase()
        if (message.includes('checking email') || message.includes('already') || message.includes('duplicate')) {
          throw new Error(`อีเมลนี้มีอยู่แล้วหรือระบบตรวจสอบอีเมลไม่ผ่าน: ${normalizedEmail}`)
        }
        throw new Error(`สร้าง Auth user ไม่สำเร็จ: ${error.message}`)
      }

      return jsonResponse({ success: true, user_id: data.user.id })
    }

    // Action: update — change password for existing user
    if (action === 'update') {
      // Find user by email
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      if (listErr) throw listErr

      const targetUser = users.find((u: any) => String(u.email || '').toLowerCase() === normalizedEmail)
      if (!targetUser) throw new Error(`User not found: ${normalizedEmail}`)

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password }
      )
      if (error) throw new Error(`เปลี่ยนรหัสผ่านไม่สำเร็จ: ${error.message}`)

      return jsonResponse({ success: true })
    }

    throw new Error(`Invalid action: ${action}. Use 'create' or 'update'.`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return jsonResponse({ error: message }, 400)
  }
})
