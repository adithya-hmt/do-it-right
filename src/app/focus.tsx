import { router, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS } from '@/constants/theme';
import { useTasks } from '@/context/task-context';

export default function FocusScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { tasks, startFocus, finishFocus } = useTasks();
  const task = tasks.find((item) => item.id === taskId) ?? tasks.find((item) => !item.completed);
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
    setElapsed(0);
    setSessionId(startFocus(task?.id ?? null, task?.projectId ?? null));
  }

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const seconds = String(elapsed % 60).padStart(2, '0');
  const progress = Math.min(1, elapsed / (25 * 60));

  return <><Stack.Screen options={{ title: 'Focus' }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas, padding: GUTTER, justifyContent: 'space-between', paddingBottom: 38 }}><View style={{ gap: 19 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary }} /><Text style={{ color: COLORS.ink, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>FOCUS MODE</Text></View><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '800' }}>25 min timebox</Text></View><View style={{ backgroundColor: COLORS.contrast, borderRadius: RADIUS.large, minHeight: 245, padding: 21, justifyContent: 'space-between' }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ color: COLORS.contrastMuted, fontSize: 11, fontWeight: '800' }}>{sessionId ? 'IN SESSION' : 'READY WHEN YOU ARE'}</Text><View style={{ width: 36, height: 36, borderRadius: 13, backgroundColor: COLORS.contrastSurface, alignItems: 'center', justifyContent: 'center' }}><Glyph name="clock" size={17} color={COLORS.primary} /></View></View><View style={{ gap: 8 }}><Text selectable style={{ color: COLORS.contrastText, fontSize: 25, lineHeight: 29, fontWeight: '900', letterSpacing: -0.6 }}>{task?.title ?? 'Choose one clear thing.'}</Text><Text style={{ color: COLORS.contrastMuted, fontSize: 13, fontWeight: '700' }}>{task?.project ?? 'A few undisturbed minutes is enough.'}</Text></View></View></View><View style={{ alignItems: 'center', gap: 24 }}><View style={{ width: 224, height: 224, borderRadius: 112, borderWidth: 8, borderColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center' }}><View style={{ position: 'absolute', width: 224, height: 224, borderRadius: 112, borderWidth: 8, borderColor: COLORS.primary, borderLeftColor: 'transparent', borderBottomColor: progress > 0.5 ? COLORS.primary : 'transparent', transform: [{ rotate: `${-45 + progress * 360}deg` }] }} /><Text selectable style={{ color: COLORS.ink, fontSize: 54, lineHeight: 62, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -2 }}>{minutes}:{seconds}</Text><Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1.1 }}>{sessionId ? 'STAY WITH IT' : 'START SMALL'}</Text></View><Pressable onPress={toggle} style={({ pressed }) => [{ minHeight: 58, minWidth: 224, paddingHorizontal: 24, borderRadius: 17, backgroundColor: sessionId ? COLORS.ink : COLORS.primary, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }, pressed && { opacity: 0.78, transform: [{ scale: 0.98 }] }]}><Glyph name={sessionId ? 'pause' : 'play'} size={15} color={sessionId ? COLORS.contrastText : COLORS.ink} /><Text style={{ color: sessionId ? COLORS.contrastText : COLORS.ink, fontSize: 15, fontWeight: '900' }}>{sessionId ? 'Finish focus' : 'Start focus'}</Text></Pressable><Pressable onPress={() => router.back()}><Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '800' }}>Not now</Text></Pressable></View></View></>;
}
