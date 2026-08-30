import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'
import type { DirDatabase } from '../_shared/database.ts'

const encoder = new TextEncoder()
const hex = (bytes: Uint8Array) => [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
const sha256 = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const userId = ctx.userClaims?.id
    const userEmail = String(ctx.userClaims?.email ?? '').toLocaleLowerCase()
    const input = await req.json().catch(() => null) as { invitationId?: string; token?: string } | null
    if (!userId || !userEmail || !input?.invitationId || !input.token) return Response.json({ error: 'A valid signed-in invitation is required' }, { status: 400 })
    const { data: invitation, error } = await ctx.supabaseAdmin.from('dir_invitations').select('*').eq('id', input.invitationId).single()
    if (error || !invitation) return Response.json({ error: 'Invitation not found' }, { status: 404 })
    if ((invitation.email && invitation.accepted_at) || invitation.revoked_at || new Date(invitation.expires_at).getTime() < Date.now()) return Response.json({ error: 'This invitation is no longer active' }, { status: 410 })
    if ((invitation.email && invitation.email.toLocaleLowerCase() !== userEmail) || invitation.token_hash !== await sha256(input.token)) return Response.json({ error: 'This invitation belongs to another account' }, { status: 403 })

    const { data: profile } = await ctx.supabaseAdmin.from('dir_profiles').select('display_name,avatar_color').eq('user_id', userId).maybeSingle()
    const { error: memberError } = await ctx.supabaseAdmin.from('dir_space_members').upsert({
      id: crypto.randomUUID(),
      space_id: invitation.space_id,
      user_id: userId,
      role: invitation.role,
      status: 'active',
      joined_at: new Date().toISOString(),
    }, { onConflict: 'space_id,user_id' })
    if (memberError) return Response.json({ error: memberError.message }, { status: 400 })
    if (invitation.email) await ctx.supabaseAdmin.from('dir_invitations').update({ accepted_at: new Date().toISOString() }).eq('id', invitation.id)
    return Response.json({ spaceId: invitation.space_id, displayName: profile?.display_name ?? userEmail.split('@')[0], avatarColor: profile?.avatar_color ?? '#E06A3D' })
  }),
}
