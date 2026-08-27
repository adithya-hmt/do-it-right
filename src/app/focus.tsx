import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function FocusScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { tasks, startFocus, finishFocus } = useTasks();
  const task = tasks.find((item) => item.id === taskId);
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    if (!sessionId) return;
    const timer = setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [sessionId]);

  function toggle() {
    if (sessionId) {
      finishFocus(sessionId);
      setSessionId(null);
      router.back();
      return;
    }
    setSessionId(startFocus(task?.id ?? null, task?.projectId ?? null));
  }

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');

  return <><Stack.Screen options={{ title: 'Focus' }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, justifyContent: 'space-between', alignItems: 'center', paddingBottom: 40 }}><View style={{ alignItems: 'center', gap: 13, marginTop: 54 }}><View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Glyph name={sessionId ? 'pause' : 'play'} size={26} color={COLORS.primary} /></View><Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 }}>{sessionId ? 'IN FOCUS' : 'A QUIET START'}</Text><Text selectable style={{ color: COLORS.ink, fontSize: 29, lineHeight: 34, fontWeight: '900', textAlign: 'center' }}>{task?.title ?? 'Choose one clear thing.'}</Text><Text style={{ color: COLORS.muted, fontSize: 14, fontWeight: '600' }}>{task?.project ?? 'A few undisturbed minutes is enough.'}</Text></View><View style={{ alignItems: 'center', gap: 25 }}><Text selectable style={{ color: COLORS.ink, fontSize: 64, lineHeight: 70, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -2 }}>{minutes}:{seconds}</Text><Pressable onPress={toggle} style={{ minHeight: 58, minWidth: 220, paddingHorizontal: 24, borderRadius: RADIUS.medium, backgroundColor: sessionId ? COLORS.contrast : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }}><Glyph name={sessionId ? 'pause' : 'play'} size={16} color={COLORS.white} /><Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '900' }}>{sessionId ? 'Finish focus' : 'Start focus'}</Text></Pressable><Pressable onPress={() => router.back()}><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '800' }}>Not now</Text></Pressable></View></View></>;
}
