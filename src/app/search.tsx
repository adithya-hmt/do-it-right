import { router, Stack } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { TaskRow } from '@/components/task-row';
import { Glyph } from '@/components/ui/glyph';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

const FILTERS = ['All', 'Open', 'Done'] as const;

export default function SearchScreen() {
  const { tasks, toggleTask } = useTasks();
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>('All');
  const normalizedQuery = query.trim().toLowerCase();
  const results = tasks.filter((task) => {
    const matchesQuery = !normalizedQuery || `${task.title} ${task.project} ${task.notes}`.toLowerCase().includes(normalizedQuery);
    const matchesFilter = filter === 'All' || (filter === 'Done' ? task.completed : !task.completed);
    return matchesQuery && matchesFilter;
  });

  return (
    <>
      <Stack.Screen options={{ title: 'Search', headerShown: true, headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '900' } }} />
      <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: GUTTER, paddingTop: 10, paddingBottom: 40, gap: 17 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: COLORS.surface, borderRadius: 15, borderWidth: 1, borderColor: query ? COLORS.primary : COLORS.line, paddingHorizontal: 14, minHeight: 53 }}>
            <Glyph name="search" size={17} color={COLORS.muted} />
            <TextInput autoFocus value={query} onChangeText={setQuery} placeholder="Search tasks, projects, notes" placeholderTextColor={COLORS.softMuted} style={{ flex: 1, color: COLORS.ink, fontSize: 15, fontWeight: '700' }} />
            <Pressable onPress={() => setQuery('')} hitSlop={8}><Glyph name="close" size={14} color={query ? COLORS.ink : COLORS.softMuted} /></Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7 }}>
            {FILTERS.map((item) => { const active = filter === item; return <Pressable key={item} onPress={() => setFilter(item)} style={({ pressed }) => [{ paddingHorizontal: 13, paddingVertical: 9, borderRadius: 12, backgroundColor: active ? COLORS.contrast : COLORS.surface, borderWidth: active ? 0 : 1, borderColor: COLORS.line }, pressed && { opacity: 0.7 }]}><Text style={{ color: active ? COLORS.contrastText : COLORS.muted, fontSize: 11, fontWeight: '900' }}>{item}</Text></Pressable>; })}
          </ScrollView>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}><Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>{query ? `Results for “${query}”` : 'All tasks'}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>{results.length} found</Text></View>
          <SurfaceCard style={{ paddingHorizontal: 16 }}>{results.length ? results.map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} onStart={() => router.push({ pathname: '/focus', params: { taskId: task.id } })} />) : <View style={{ alignItems: 'center', padding: 28, gap: 7 }}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '900' }}>No match yet.</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Try a project name or a smaller phrase.</Text></View>}</SurfaceCard>
          <Pressable onPress={() => router.push('/add-task')} style={({ pressed }) => [{ minHeight: 54, borderRadius: RADIUS.medium, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 }, pressed && { opacity: 0.78 }]}><Glyph name="plus" size={17} color={COLORS.contrastText} /><Text style={{ color: COLORS.contrastText, fontSize: 14, fontWeight: '900' }}>Capture a new task</Text></Pressable>
        </ScrollView>
      </View>
    </>
  );
}
