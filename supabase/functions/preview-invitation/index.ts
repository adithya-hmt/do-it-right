import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'
import type { DirDatabase } from '../_shared/database.ts'

const encoder = new TextEncoder()
const hex = (bytes: Uint8Array) => [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
const sha256 = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'none' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const input = await req.json().catch(() => null) as { invitationId?: string; token?: string } | null
    if (!input?.invitationId || !input.token) return Response.json({ error: 'A complete invitation is required' }, { status: 400 })

    const { data: invitation, error } = await ctx.supabaseAdmin
      .from('dir_invitations')
      .select('id,space_id,role,invited_by,email,token_hash,expires_at,accepted_at,revoked_at')
      .eq('id', input.invitationId)
      .single()
    if (error || !invitation || (invitation.email && invitation.accepted_at) || invitation.revoked_at || new Date(invitation.expires_at).getTime() < Date.now() || invitation.token_hash !== await sha256(input.token)) {
      return Response.json({ error: 'This invitation is no longer available' }, { status: 410 })
    }

    const [{ data: space }, { data: inviter }] = await Promise.all([
      ctx.supabaseAdmin.from('dir_spaces').select('name,description,color').eq('id', invitation.space_id).single(),
      ctx.supabaseAdmin.from('dir_profiles').select('display_name,avatar_color').eq('user_id', invitation.invited_by).maybeSingle(),
    ])
    if (!space) return Response.json({ error: 'This space is no longer available' }, { status: 404 })
    return Response.json({
      invitationId: invitation.id,
      role: invitation.role,
      expiresAt: invitation.expires_at,
      space: { name: space.name, description: space.description, color: space.color },
      inviter: { displayName: inviter?.display_name ?? 'A DIR teammate', avatarColor: inviter?.avatar_color ?? '#E06A3D' },
    })
  }),
}
