import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'
import type { DirDatabase } from '../_shared/database.ts'

const encoder = new TextEncoder()

function hex(bytes: Uint8Array) {
  return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
}

async function sha256(value: string) {
  return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))
}

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const userId = ctx.userClaims?.id
    if (!userId) return Response.json({ error: 'Authentication required' }, { status: 401 })
    const input = await req.json().catch(() => null) as { spaceId?: string; email?: string; role?: string } | null
    const email = input?.email?.trim().toLocaleLowerCase()
    const role = input?.role === 'admin' ? 'admin' : 'member'
    if (!input?.spaceId || !email || !email.includes('@')) return Response.json({ error: 'A valid space and email are required' }, { status: 400 })

    const { data: membership, error: membershipError } = await ctx.supabaseAdmin
      .from('dir_space_members')
      .select('role,status')
      .eq('space_id', input.spaceId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    if (membershipError || !['owner', 'admin'].includes(membership?.role)) return Response.json({ error: 'Only owners and admins can invite people' }, { status: 403 })

    const random = new Uint8Array(24)
    crypto.getRandomValues(random)
    const token = hex(random)
    const invitationId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error: invitationError } = await ctx.supabaseAdmin.from('dir_invitations').insert({
      id: invitationId,
      space_id: input.spaceId,
      email,
      role,
      invited_by: userId,
      token_hash: await sha256(token),
      expires_at: expiresAt,
    })
    if (invitationError) return Response.json({ error: invitationError.message }, { status: 400 })

    const redirectTo = `doitright://invite?token=${encodeURIComponent(token)}&invitation=${encodeURIComponent(invitationId)}`
    const { error: emailError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (emailError && !emailError.message.toLocaleLowerCase().includes('already')) {
      await ctx.supabaseAdmin.from('dir_invitations').delete().eq('id', invitationId)
      return Response.json({ error: emailError.message }, { status: 400 })
    }
    return Response.json({ invitationId, expiresAt, shareUrl: redirectTo })
  }),
}
