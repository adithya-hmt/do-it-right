import '@supabase/functions-js/edge-runtime.d.ts'
import { withSupabase } from '@supabase/server'
import type { DirDatabase } from '../_shared/database.ts'

const encoder = new TextEncoder()
const hex = (bytes: Uint8Array) => [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('')
const sha256 = async (value: string) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value))))
const createToken = () => {
  const random = new Uint8Array(24)
  crypto.getRandomValues(random)
  return hex(random)
}
const inviteUrl = (invitationId: string, token: string) => `${(Deno.env.get('DIR_WEB_URL') ?? 'https://do-it-right-nu.vercel.app').replace(/\/+$/, '')}/invite?token=${encodeURIComponent(token)}&invitation=${encodeURIComponent(invitationId)}`
const nativeInviteUrl = (invitationId: string, token: string) => `doitright://invite?token=${encodeURIComponent(token)}&invitation=${encodeURIComponent(invitationId)}`

type Input = { action?: 'cancel' | 'resend'; invitationId?: string }

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const userId = ctx.userClaims?.id
    const input = await req.json().catch(() => null) as Input | null
    if (!userId || !input?.invitationId || !input.action) return Response.json({ error: 'A valid invitation action is required' }, { status: 400 })
    const { data: invitation } = await ctx.supabaseAdmin.from('dir_invitations').select('*').eq('id', input.invitationId).single()
    if (!invitation) return Response.json({ error: 'Invitation not found' }, { status: 404 })
    const { data: membership } = await ctx.supabaseAdmin.from('dir_space_members').select('role').eq('space_id', invitation.space_id).eq('user_id', userId).eq('status', 'active').single()
    if (!membership || !['owner', 'admin'].includes(membership.role)) return Response.json({ error: 'Only owners and admins can manage invitations' }, { status: 403 })
    if (invitation.accepted_at) return Response.json({ error: 'This invitation has already been accepted' }, { status: 409 })

    if (input.action === 'cancel') {
      const { error } = await ctx.supabaseAdmin.from('dir_invitations').update({ revoked_at: new Date().toISOString() }).eq('id', invitation.id)
      if (error) return Response.json({ error: error.message }, { status: 400 })
      return Response.json({ ok: true })
    }

    if (!invitation.email) return Response.json({ error: 'Share links do not need resending' }, { status: 400 })
    const token = createToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const shareUrl = inviteUrl(invitation.id, token)
    const { error: emailError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(invitation.email, { redirectTo: nativeInviteUrl(invitation.id, token) })
    if (emailError && !emailError.message.toLocaleLowerCase().includes('already')) return Response.json({ error: emailError.message }, { status: 400 })
    const { error } = await ctx.supabaseAdmin.from('dir_invitations').update({ token_hash: await sha256(token), expires_at: expiresAt, revoked_at: null }).eq('id', invitation.id)
    if (error) return Response.json({ error: error.message }, { status: 400 })
    return Response.json({ ok: true, shareUrl, expiresAt })
  }),
}
