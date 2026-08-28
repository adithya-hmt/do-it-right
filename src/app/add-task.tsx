import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph } from '@/components/ui/glyph';
import { VoiceCaptureSheet } from '@/components/voice-capture-sheet';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks, type TaskCategory, type TaskPriority } from '@/context/task-context';
import { parseQuickAdd } from '@/domain/quick-add';
import { getDayKey } from '@/domain/workspace';

const CATEGORIES: TaskCategory[] = ['Work', 'Personal'];
const PRIORITIES: TaskPriority[] = ['high', 'medium', 'low'];
const TIMEBOXES = [15, 25, 50, 90];

function Pill({ active, icon, label, onPress }: { active: boolean; icon?: React.ComponentProps<typeof Glyph>['name']; label: string; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [{ minHeight: 44, paddingHorizontal: 14, borderRadius: RADIUS.pill, backgroundColor: active ? COLORS.primarySoft : COLORS.surface, borderWidth: 1, borderColor: active ? COLORS.primary : COLORS.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, pressed && { opacity: 0.68 }]}>{icon ? <Glyph name={icon} size={14} color={active ? COLORS.primary : COLORS.muted} /> : null}<Text style={{ color: active ? COLORS.ink : COLORS.muted, fontSize: 12, fontWeight: '900' }}>{label}</Text></Pressable>;
}

export default function AddTaskScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ projectId?: string; spaceId?: string }>();
  const { addTask, projects, spaces, memberships } = useTasks();
  const initialProject = projects.find((project) => project.id === params.projectId);
  const [title, setTitle] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [category, setCategory] = React.useState<TaskCategory>('Personal');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [estimateMinutes, setEstimateMinutes] = React.useState(25);
  const [selectedSpaceId, setSelectedSpaceId] = React.useState<string | null>(params.spaceId ?? initialProject?.spaceId ?? null);
  const [projectId, setProjectId] = React.useState<string | null>(initialProject?.id ?? null);
  const [assigneeId, setAssigneeId] = React.useState<string | null>(null);
  const [dueDate, setDueDate] = React.useState<string | null>(null);
  const [dueTime, setDueTime] = React.useState<string | null>(null);
  const [voiceVisible, setVoiceVisible] = React.useState(false);
  const scopedProjects = React.useMemo(() => projects.filter((project) => project.status === 'active' && project.spaceId === selectedSpaceId), [projects, selectedSpaceId]);
  const scopedMembers = React.useMemo(() => memberships.filter((member) => member.status === 'active' && member.spaceId === selectedSpaceId), [memberships, selectedSpaceId]);
  const parsed = React.useMemo(() => parseQuickAdd(title, { projects: scopedProjects, members: scopedMembers.map((member) => ({ id: member.userId, displayName: member.displayName })) }), [scopedMembers, scopedProjects, title]);
  const canSave = parsed.tasks.length > 0;
  const quickDates = React.useMemo(() => {
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return [{ label: 'No date', value: null }, { label: 'Today', value: getDayKey(today) }, { label: 'Tomorrow', value: getDayKey(tomorrow) }];
  }, []);

  function parseOptions(value: string) {
    return parseQuickAdd(value, { projects: scopedProjects, members: scopedMembers.map((member) => ({ id: member.userId, displayName: member.displayName })) });
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    const proposal = parseOptions(value).tasks[0];
    if (!proposal) return;
    if (proposal.dueDate) setDueDate(proposal.dueDate);
    if (proposal.dueTime) setDueTime(proposal.dueTime);
    if (proposal.projectId) setProjectId(proposal.projectId);
    if (proposal.assigneeId) setAssigneeId(proposal.assigneeId);
  }

  function selectSpace(id: string | null) {
    setSelectedSpaceId(id);
    setProjectId(null);
    setAssigneeId(null);
  }

  function handleSave() {
    if (!canSave) return;
    parsed.tasks.forEach((proposal, index) => {
      const resolvedProjectId = proposal.projectId ?? projectId;
      const project = projects.find((item) => item.id === resolvedProjectId);
      addTask({ title: proposal.title, notes: index === 0 ? notes.trim() : '', category, priority, estimateMinutes, projectId: resolvedProjectId, project: project?.name, spaceId: selectedSpaceId, assigneeId: proposal.assigneeId ?? assigneeId, dueDate: proposal.dueDate ?? dueDate, dueTime: proposal.dueTime ?? dueTime, plannedDate: proposal.dueDate ?? dueDate });
    });
    router.back();
  }

  return <>
    <Stack.Screen options={{ title: 'Quick Add' }} />
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.canvas }} behavior={process.env.EXPO_OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 18, paddingBottom: insets.bottom + 28, gap: 22 }}>
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primarySoft }}><Glyph name="plus" size={17} color={COLORS.primary} /></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }}>GET IT OUT OF YOUR HEAD</Text></View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}><Text selectable style={{ flex: 1, color: COLORS.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7 }}>What needs doing?</Text><Pressable accessibilityRole="button" accessibilityLabel="Add tasks with your voice" accessibilityHint="Opens voice capture; you review the transcript before saving" onPress={() => setVoiceVisible(true)} style={({ pressed }) => [{ width: 48, height: 48, borderRadius: 17, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }, pressed && { opacity: 0.72, transform: [{ scale: 0.96 }] }]}><Glyph name="mic" size={21} color={COLORS.white} /></Pressable></View>
          <Text style={{ color: COLORS.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>Say it naturally. Separate several tasks with a new line or semicolon. DIR always lets you review first.</Text>
        </View>

        <View style={{ gap: 10 }}>
          <TextInput autoFocus accessibilityLabel="Task title" value={title} onChangeText={handleTitleChange} placeholder="Send the draft today 3pm #Launch @Maya" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 112, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: title ? COLORS.primary : COLORS.line, padding: 17, color: COLORS.ink, fontSize: 17, lineHeight: 25, fontWeight: '700' }} />
          {parsed.tasks.length > 1 ? <View style={{ padding: 12, borderRadius: RADIUS.small, backgroundColor: COLORS.primarySoft, gap: 5 }}><Text style={{ color: COLORS.primary, fontSize: 12, fontWeight: '900' }}>{parsed.tasks.length} tasks ready to review</Text>{parsed.tasks.map((task, index) => <Text key={`${task.title}-${index}`} style={{ color: COLORS.ink, fontSize: 12, fontWeight: '700' }}>• {task.title}</Text>)}</View> : null}
          {parsed.tokens.length ? <View accessibilityLabel="Recognized task details" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{parsed.tokens.map((token, index) => <View key={`${token.kind}-${index}`} style={{ minHeight: 36, paddingHorizontal: 11, borderRadius: RADIUS.pill, backgroundColor: COLORS.primarySoft, flexDirection: 'row', alignItems: 'center', gap: 6 }}><Glyph name={token.kind === 'date' ? 'calendar' : token.kind === 'time' ? 'clock' : token.kind === 'assignee' ? 'people' : 'projects'} size={13} color={COLORS.primary} /><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900' }}>{token.text}</Text></View>)}</View> : null}
        </View>

        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Lives in</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Pill active={selectedSpaceId === null} icon="user" label="Just me" onPress={() => selectSpace(null)} />{spaces.map((space) => <Pill key={space.id} active={selectedSpaceId === space.id} icon="people" label={space.name} onPress={() => selectSpace(space.id)} />)}</ScrollView></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Project</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Pill active={!projectId} icon="inbox" label="Inbox" onPress={() => setProjectId(null)} />{scopedProjects.map((project) => <Pill key={project.id} active={projectId === project.id} icon="projects" label={project.name} onPress={() => setProjectId(project.id)} />)}</ScrollView></View>
        {selectedSpaceId ? <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Assign to</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}><Pill active={!assigneeId} label="Anyone" onPress={() => setAssigneeId(null)} />{scopedMembers.map((member) => <Pill key={member.id} active={assigneeId === member.userId} icon="user" label={member.displayName} onPress={() => setAssigneeId(member.userId)} />)}</ScrollView></View> : null}

        <View style={{ gap: 9 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Helpful context <Text style={{ color: COLORS.muted, fontWeight: '700' }}>· optional</Text></Text><TextInput value={notes} onChangeText={setNotes} placeholder="What will make this easier to start?" placeholderTextColor={COLORS.softMuted} multiline style={{ minHeight: 72, borderRadius: RADIUS.medium, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, padding: 14, color: COLORS.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' }} /></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>When</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{quickDates.map((option) => <Pill key={option.label} active={dueDate === option.value} icon={option.value ? 'calendar' : undefined} label={option.label} onPress={() => setDueDate(option.value)} />)}</ScrollView><View style={{ flexDirection: 'row', gap: 8 }}><TextInput accessibilityLabel="Custom due date" value={dueDate ?? ''} onChangeText={(value) => setDueDate(value.trim() || null)} placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.softMuted} style={{ flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, color: COLORS.ink, fontWeight: '700' }} /><TextInput accessibilityLabel="Due time" value={dueTime ?? ''} onChangeText={(value) => setDueTime(value.trim() || null)} placeholder="HH:MM" placeholderTextColor={COLORS.softMuted} style={{ width: 110, minHeight: 48, borderRadius: 14, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.line, paddingHorizontal: 14, color: COLORS.ink, fontWeight: '700' }} /></View></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Energy</Text><View style={{ flexDirection: 'row', gap: 8 }}>{PRIORITIES.map((item) => <Pill key={item} active={priority === item} label={item === 'high' ? 'Must' : item === 'medium' ? 'Should' : 'Could'} onPress={() => setPriority(item)} />)}</View></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Small enough to start</Text><View style={{ flexDirection: 'row', gap: 8 }}>{TIMEBOXES.map((minutes) => <Pill key={minutes} active={estimateMinutes === minutes} label={`${minutes}m`} onPress={() => setEstimateMinutes(minutes)} />)}</View></View>
        <View style={{ gap: 10 }}><Text style={{ color: COLORS.ink, fontSize: 13, fontWeight: '900' }}>Kind</Text><View style={{ flexDirection: 'row', gap: 8 }}>{CATEGORIES.map((item) => <Pill key={item} active={category === item} label={item} onPress={() => setCategory(item)} />)}</View></View>

        <Pressable accessibilityRole="button" onPress={handleSave} disabled={!canSave} style={({ pressed }) => [{ minHeight: 58, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9, backgroundColor: canSave ? COLORS.primary : COLORS.line }, pressed && { opacity: 0.75 }]}><Text style={{ color: canSave ? COLORS.white : COLORS.muted, fontSize: 14, fontWeight: '900' }}>{parsed.tasks.length > 1 ? `Add ${parsed.tasks.length} tasks` : 'Add task'}</Text><Glyph name="arrow" size={18} color={canSave ? COLORS.white : COLORS.muted} /></Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
    <VoiceCaptureSheet visible={voiceVisible} onClose={() => setVoiceVisible(false)} onTranscript={handleTitleChange} />
  </>;
}
