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

function createToken() {
  const random = new Uint8Array(24)
  crypto.getRandomValues(random)
  return hex(random)
}

function inviteUrl(invitationId: string, token: string) {
  const base = (Deno.env.get('DIR_WEB_URL') ?? 'https://do-it-right-nu.vercel.app').replace(/\/+$/, '')
  return `${base}/invite?token=${encodeURIComponent(token)}&invitation=${encodeURIComponent(invitationId)}`
}

function nativeInviteUrl(invitationId: string, token: string) {
  return `doitright://invite?token=${encodeURIComponent(token)}&invitation=${encodeURIComponent(invitationId)}`
}

type Input = { spaceId?: string; email?: string; emails?: string[]; role?: string; mode?: 'email' | 'link' }

export default {
  fetch: withSupabase<DirDatabase>({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 })
    const userId = ctx.userClaims?.id
    if (!userId) return Response.json({ error: 'Authentication required' }, { status: 401 })
    const input = await req.json().catch(() => null) as Input | null
    const spaceId = input?.spaceId?.trim()
    const role = input?.role === 'admin' ? 'admin' : 'member'
    if (!spaceId) return Response.json({ error: 'A valid space is required' }, { status: 400 })

    const { data: membership, error: membershipError } = await ctx.supabaseAdmin
      .from('dir_space_members')
      .select('role,status')
      .eq('space_id', spaceId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    if (membershipError || !['owner', 'admin'].includes(membership?.role)) return Response.json({ error: 'Only owners and admins can invite people' }, { status: 403 })
    if (input?.mode === 'link' && role === 'admin') return Response.json({ error: 'Share links can only invite members' }, { status: 400 })

    const emails = [...new Set([...(input?.emails ?? []), ...(input?.email ? [input.email] : [])]
      .map((email) => email.trim().toLocaleLowerCase())
      .filter((email) => email.includes('@')))]
    const linkOnly = input?.mode === 'link' || emails.length === 0
    const created: Array<{ invitationId: string; email: string | null; expiresAt: string; shareUrl: string }> = []
    const failed: Array<{ email: string; error: string }> = []

    for (const email of linkOnly ? [null] : emails) {
      const token = createToken()
      const invitationId = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const shareUrl = inviteUrl(invitationId, token)
      const { error: invitationError } = await ctx.supabaseAdmin.from('dir_invitations').insert({
        id: invitationId,
        space_id: spaceId,
        email,
        role,
        invited_by: userId,
        token_hash: await sha256(token),
        expires_at: expiresAt,
      })
      if (invitationError) {
        if (email) failed.push({ email, error: invitationError.message })
        continue
      }

      if (email) {
        const { error: emailError } = await ctx.supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo: nativeInviteUrl(invitationId, token) })
        if (emailError && !emailError.message.toLocaleLowerCase().includes('already')) {
          await ctx.supabaseAdmin.from('dir_invitations').delete().eq('id', invitationId)
          failed.push({ email, error: emailError.message })
          continue
        }
      }
      created.push({ invitationId, email, expiresAt, shareUrl })
    }

    if (!created.length) return Response.json({ error: failed[0]?.error ?? 'No invitation was created', failed }, { status: 400 })
    return Response.json({ invites: created, failed, shareUrl: created[0].shareUrl, expiresAt: created[0].expiresAt })
  }),
}
