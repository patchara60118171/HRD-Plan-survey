import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Admin client with service_role key (never exposed to frontend)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
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

    if (!callerRole || !['super_admin', 'admin'].includes(callerRole.role)) {
      throw new Error('Forbidden: requires admin or super_admin role')
    }

    const { email, password, action } = await req.json()

    if (!email || !password) {
      throw new Error('Missing required fields: email, password')
    }

    // Action: create — create new auth user with email_confirm: true
    if (action === 'create') {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, user_id: data.user.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Action: update — change password for existing user
    if (action === 'update') {
      // Find user by email
      const { data: { users }, error: listErr } = await supabaseAdmin.auth.admin.listUsers()
      if (listErr) throw listErr

      const targetUser = users.find((u: any) => u.email === email)
      if (!targetUser) throw new Error(`User not found: ${email}`)

      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        targetUser.id,
        { password }
      )
      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error(`Invalid action: ${action}. Use 'create' or 'update'.`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
