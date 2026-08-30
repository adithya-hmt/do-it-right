import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import React from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, FONTS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

const INVITE_ROLES = ['member', 'admin'] as const;

function parseEmails(value: string) {
  return [...new Set(value.split(/[\s,;]+/).map((email) => email.trim().toLocaleLowerCase()).filter(Boolean))];
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatExpiry(value: string, now: number) {
  const days = Math.max(1, Math.ceil((new Date(value).getTime() - now) / 86400000));
  return `${days}d left`;
}

export default function SpaceMembersScreen() {
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();
  const { spaces, memberships, invitations, session, createSpaceInvite, inviteMembers, manageInvitation, manageMember } = useTasks();
  const [now] = React.useState(() => Date.now());
  const space = spaces.find((item) => item.id === spaceId);
  const members = memberships.filter((member) => member.spaceId === spaceId && member.status === 'active');
  const pendingInvites = invitations.filter((invitation) => invitation.spaceId === spaceId && !invitation.acceptedAt && !invitation.revokedAt && new Date(invitation.expiresAt).getTime() > now);
  const currentRole = members.find((member) => member.userId === session?.user.id)?.role;
  const canInvite = currentRole === 'owner' || currentRole === 'admin';
  const [emailText, setEmailText] = React.useState('');
  const [role, setRole] = React.useState<'member' | 'admin'>('member');
  const [shareUrl, setShareUrl] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [showQr, setShowQr] = React.useState(false);
  const [busyAction, setBusyAction] = React.useState<string | null>(null);
  const emails = parseEmails(emailText);
  const invalidEmails = emails.filter((email) => !isEmail(email));

  async function createLink() {
    setBusyAction('create-link');
    const result = await createSpaceInvite(spaceId);
    setBusyAction(null);
    if (result.error || !result.shareUrl) return Alert.alert('Link not ready', result.error ?? 'DIR could not create the invite link.');
    setShareUrl(result.shareUrl);
    setCopied(false);
  }

  async function copyLink() {
    if (!shareUrl) return;
    await Clipboard.setStringAsync(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function shareLink() {
    let link = shareUrl;
    if (!link) {
      setBusyAction('share-link');
      const result = await createSpaceInvite(spaceId);
      setBusyAction(null);
      if (result.error || !result.shareUrl) return Alert.alert('Link not ready', result.error ?? 'DIR could not create the invite link.');
      link = result.shareUrl;
      setShareUrl(link);
    }
    try {
      await Share.share({ message: `Join ${space?.name ?? 'this DIR space'}: ${link}`, url: link });
    } catch {
      await Clipboard.setStringAsync(link);
      setCopied(true);
    }
  }

  async function inviteByEmail() {
    if (!emails.length || invalidEmails.length) return;
    setBusyAction('email');
    const result = await inviteMembers(spaceId, emails, role);
    setBusyAction(null);
    if (result.error) return Alert.alert('Invites not sent', result.error);
    setEmailText('');
    const sent = result.invitationIds?.length ?? emails.length;
    const partial = result.failed?.length ? ` ${result.failed.length} could not be sent.` : '';
    Alert.alert(sent === 1 ? 'Invite sent' : 'Invites sent', `${sent} ${sent === 1 ? 'person can' : 'people can'} join this space.${partial}`);
  }

  function confirmCancel(invitationId: string) {
    Alert.alert('Cancel invitation?', 'This link will stop working immediately.', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'Cancel invite', style: 'destructive', onPress: () => void runInvitationAction(invitationId, 'cancel') },
    ]);
  }

  function confirmRemove(userId: string, displayName: string) {
    Alert.alert(`Remove ${displayName}?`, 'They will lose access to this space, but their work stays here.', [
      { text: 'Keep member', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void runMemberAction(userId, displayName) },
    ]);
  }

  async function runInvitationAction(invitationId: string, action: 'cancel' | 'resend') {
    setBusyAction(`${action}-${invitationId}`);
    const result = await manageInvitation(invitationId, action);
    setBusyAction(null);
    if (result.error) return Alert.alert('Could not update invite', result.error);
    if (action === 'resend' && result.shareUrl) {
      setShareUrl(result.shareUrl);
      Alert.alert('Invite resent', 'The new link is ready to copy or share.');
    }
  }

  async function runMemberAction(userId: string, displayName: string) {
    setBusyAction(`remove-${userId}`);
    const result = await manageMember(spaceId, 'remove', userId);
    setBusyAction(null);
    if (result.error) Alert.alert(`Could not remove ${displayName}`, result.error);
  }

  function leaveSpace() {
    Alert.alert('Leave this space?', 'You will stop seeing its shared tasks until someone invites you again.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave space', style: 'destructive', onPress: () => void (async () => {
        setBusyAction('leave');
        const result = await manageMember(spaceId, 'leave');
        setBusyAction(null);
        if (result.error) return Alert.alert('Could not leave space', result.error);
        router.replace('/spaces');
      })() },
    ]);
  }

  return <><Stack.Screen options={{ title: 'People' }} /><KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}><ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: GUTTER, paddingBottom: 52, gap: 20 }}>
    <View style={{ gap: 6 }}><Text selectable style={{ color: COLORS.ink, fontSize: 28, fontWeight: '900', letterSpacing: -0.7 }}>{space?.name ?? 'Space'} people</Text><Text selectable style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Bring in the people who make the next right thing easier.</Text></View>

    {canInvite ? <SurfaceCard style={{ padding: 17, gap: 13, borderWidth: 1, borderColor: space?.color ?? COLORS.primary }}>
      <View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Add people</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>The fastest way is a link. It expires in 7 days and can be shared with the whole team.</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Create a share invite link" disabled={busyAction === 'create-link'} onPress={() => void createLink()} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: space?.color ?? COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: busyAction === 'create-link' ? 0.6 : 1 }, pressed && { opacity: 0.75 }]}><Glyph name="link" size={18} color="#FFFFFF" /><Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '900' }}>{busyAction === 'create-link' ? 'Making a link…' : 'Create invite link'}</Text></Pressable>
      {shareUrl ? <View style={{ gap: 10, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.small, padding: 12 }}><Text selectable numberOfLines={2} style={{ color: COLORS.ink, fontFamily: FONTS.mono, fontSize: 10, lineHeight: 15 }}>{shareUrl}</Text><View style={{ flexDirection: 'row', gap: 8 }}><Pressable accessibilityRole="button" onPress={() => void copyLink()} style={{ flex: 1, minHeight: 42, borderRadius: RADIUS.small, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>{copied ? 'Copied' : 'Copy link'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => void shareLink()} style={{ flex: 1, minHeight: 42, borderRadius: RADIUS.small, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.onAccent, fontSize: 12, fontWeight: '900' }}>Share</Text></Pressable></View><Pressable accessibilityRole="button" onPress={() => setShowQr((value) => !value)} style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>{showQr ? 'Hide QR code' : 'Show QR code'}</Text></Pressable>{showQr ? <View style={{ alignItems: 'center', gap: 9, paddingVertical: 8 }}><QRCode value={shareUrl} size={190} color={COLORS.ink} backgroundColor={COLORS.surface} /><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>Scan to join this space</Text></View> : null}</View> : null}
    </SurfaceCard> : <View style={{ backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.medium, padding: 16, gap: 4 }}><Text selectable style={{ color: COLORS.primary, fontSize: 13, fontWeight: '900' }}>Invite access is protected</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Ask the space owner or an admin to add someone.</Text></View>}

    {canInvite ? <SurfaceCard style={{ padding: 17, gap: 12 }}><View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 16, fontWeight: '900' }}>Invite by email</Text><Text selectable style={{ color: COLORS.muted, fontSize: 12, lineHeight: 18, fontWeight: '600' }}>Paste several addresses separated by commas, spaces, or new lines.</Text></View><TextInput accessibilityLabel="Invite email addresses" autoCapitalize="none" autoComplete="email" keyboardType="email-address" multiline value={emailText} onChangeText={setEmailText} placeholder="person@example.com, another@example.com" placeholderTextColor={COLORS.softMuted} style={{ minHeight: 78, borderRadius: RADIUS.medium, backgroundColor: COLORS.canvas, borderWidth: 1, borderColor: emailText && invalidEmails.length ? COLORS.coral : emailText ? COLORS.primary : COLORS.line, padding: 14, color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '700' }} />{invalidEmails.length ? <Text style={{ color: COLORS.coral, fontSize: 11, fontWeight: '700' }}>Check: {invalidEmails.join(', ')}</Text> : null}<View style={{ flexDirection: 'row', gap: 8 }}>{INVITE_ROLES.map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ selected: role === item }} onPress={() => setRole(item)} style={{ flex: 1, minHeight: 42, borderRadius: RADIUS.small, backgroundColor: role === item ? COLORS.primarySoft : COLORS.canvas, borderWidth: 1, borderColor: role === item ? COLORS.primary : COLORS.line, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: role === item ? COLORS.primary : COLORS.muted, fontSize: 12, fontWeight: '900', textTransform: 'capitalize' }}>{item}</Text></Pressable>)}</View><Pressable accessibilityRole="button" disabled={!emails.length || invalidEmails.length > 0 || busyAction === 'email'} onPress={() => void inviteByEmail()} style={({ pressed }) => [{ minHeight: 50, borderRadius: RADIUS.medium, backgroundColor: emails.length && !invalidEmails.length ? COLORS.primary : COLORS.line, alignItems: 'center', justifyContent: 'center', opacity: busyAction === 'email' ? 0.6 : 1 }, pressed && { opacity: 0.75 }]}><Text style={{ color: emails.length && !invalidEmails.length ? COLORS.onAccent : COLORS.muted, fontWeight: '900' }}>{busyAction === 'email' ? 'Sending…' : emails.length > 1 ? `Send ${emails.length} invites` : 'Send invite'}</Text></Pressable></SurfaceCard> : null}

    {canInvite ? <View style={{ gap: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ flex: 1, color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Pending invites</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>{pendingInvites.length}</Text></View>{pendingInvites.length ? <SurfaceCard style={{ paddingHorizontal: 15 }}>{pendingInvites.map((invitation) => <View key={invitation.id} style={{ minHeight: 69, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name={invitation.email ? 'send' : 'link'} size={15} color={COLORS.primary} /></View><View style={{ flex: 1, gap: 3 }}><Text selectable numberOfLines={1} style={{ color: COLORS.ink, fontSize: 12, fontWeight: '900' }}>{invitation.email ?? 'Share link'}</Text><Text style={{ color: COLORS.muted, fontSize: 10, fontWeight: '700' }}>{invitation.email ? 'Email invite' : 'Anyone with the link'} · {formatExpiry(invitation.expiresAt, now)}</Text></View>{invitation.email ? <Pressable accessibilityRole="button" disabled={busyAction === `resend-${invitation.id}`} onPress={() => void runInvitationAction(invitation.id, 'resend')} style={{ minHeight: 38, paddingHorizontal: 7, justifyContent: 'center' }}><Text style={{ color: COLORS.primary, fontSize: 10, fontWeight: '900' }}>Resend</Text></Pressable> : null}<Pressable accessibilityRole="button" disabled={busyAction === `cancel-${invitation.id}`} onPress={() => confirmCancel(invitation.id)} style={{ minHeight: 38, paddingHorizontal: 7, justifyContent: 'center' }}><Text style={{ color: COLORS.coral, fontSize: 10, fontWeight: '900' }}>Cancel</Text></Pressable></View>)}</SurfaceCard> : <Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Nothing waiting. A fresh link is ready whenever you are.</Text>}</View> : null}

    <View style={{ gap: 10 }}><View style={{ flexDirection: 'row', alignItems: 'center' }}><Text style={{ flex: 1, color: COLORS.ink, fontSize: 17, fontWeight: '900' }}>Members</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>{members.length}</Text></View><SurfaceCard style={{ paddingHorizontal: 15 }}>{members.map((member) => { const removable = canInvite && member.userId !== session?.user.id && member.role !== 'owner' && (currentRole === 'owner' || member.role === 'member'); return <View key={member.id} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: 1, borderBottomColor: COLORS.line }}><View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: member.avatarColor, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{member.displayName.slice(0, 1).toUpperCase()}</Text></View><View style={{ flex: 1, gap: 3 }}><Text selectable style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>{member.displayName}{member.userId === session?.user.id ? ' (you)' : ''}</Text><Text selectable style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700' }}>{member.email ?? 'DIR member'}</Text></View><Text style={{ color: member.role === 'owner' ? COLORS.primary : COLORS.muted, fontSize: 11, fontWeight: '900', textTransform: 'capitalize' }}>{member.role}</Text>{removable ? <Pressable accessibilityRole="button" disabled={busyAction === `remove-${member.userId}`} onPress={() => confirmRemove(member.userId, member.displayName)} style={{ minHeight: 38, paddingHorizontal: 4, justifyContent: 'center' }}><Text style={{ color: COLORS.coral, fontSize: 10, fontWeight: '900' }}>Remove</Text></Pressable> : null}</View> })}</SurfaceCard></View>
    {currentRole && currentRole !== 'owner' ? <Pressable accessibilityRole="button" disabled={busyAction === 'leave'} onPress={leaveSpace} style={({ pressed }) => [{ minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: busyAction === 'leave' ? 0.6 : 1 }, pressed && { opacity: 0.65 }]}><Text style={{ color: COLORS.coral, fontSize: 12, fontWeight: '900' }}>Leave this space</Text></Pressable> : null}
  </ScrollView></KeyboardAvoidingView></>;
}
