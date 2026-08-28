import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const userId = ctx.userClaims?.id
    if (!userId) return Response.json({ error: 'Authentication required' }, { status: 401 })
    const { error } = await ctx.supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ deleted: true })
  }),
}
