import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'
import type { DirDatabase } from '../_shared/database.ts'

type Input = { action?: 'leave' | 'remove'; spaceId?: string; userId?: string }

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const actorId = ctx.userClaims?.id
    const input = await req.json().catch(() => null) as Input | null
    if (!actorId || !input?.spaceId || !input.action) return Response.json({ error: 'A valid membership action is required' }, { status: 400 })
    const targetId = input.action === 'leave' ? actorId : input.userId
    if (!targetId) return Response.json({ error: 'A member is required' }, { status: 400 })
    const [{ data: actor }, { data: target }] = await Promise.all([
      ctx.supabaseAdmin.from('dir_space_members').select('role').eq('space_id', input.spaceId).eq('user_id', actorId).eq('status', 'active').single(),
      ctx.supabaseAdmin.from('dir_space_members').select('role').eq('space_id', input.spaceId).eq('user_id', targetId).eq('status', 'active').single(),
    ])
    if (!actor || !target) return Response.json({ error: 'That member is not active in this space' }, { status: 404 })
    if (input.action === 'leave' && target.role === 'owner') return Response.json({ error: 'The owner cannot leave. Transfer ownership first.' }, { status: 403 })
    if (input.action === 'remove' && (actor.role === 'member' || target.role === 'owner' || (actor.role === 'admin' && target.role !== 'member'))) return Response.json({ error: 'You cannot remove this member' }, { status: 403 })
    const { error } = await ctx.supabaseAdmin.from('dir_space_members').update({ status: 'removed', updated_at: new Date().toISOString() }).eq('space_id', input.spaceId).eq('user_id', targetId)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ ok: true })
  }),
}
