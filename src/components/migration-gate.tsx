import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { COLORS, GUTTER, RADIUS } from '@/constants/theme';

export function MigrationGate({ error, onRetry, onExport }: { error: string | null; onRetry: () => void; onExport: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas, justifyContent: 'center', padding: GUTTER, gap: 20 }}>
      <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.large, padding: 24, gap: 14, borderCurve: 'continuous' }}>
        {error ? null : <ActivityIndicator color={COLORS.primary} size="large" accessibilityLabel="Preparing DIR workspace" />}
        <Text selectable style={{ color: COLORS.ink, fontSize: 24, lineHeight: 30, fontWeight: '900', textAlign: 'center' }}>{error ? 'Your workspace is still safe.' : 'Preparing DIR'}</Text>
        <Text selectable style={{ color: COLORS.muted, fontSize: 14, lineHeight: 21, fontWeight: '600', textAlign: 'center' }}>{error ?? 'Validating your local workspace before opening the new experience.'}</Text>
        {error ? <View style={{ gap: 10 }}><Pressable accessibilityRole="button" onPress={onRetry} style={({ pressed }) => [{ minHeight: 50, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '900' }}>Retry migration</Text></Pressable><Pressable accessibilityRole="button" onPress={onExport} style={({ pressed }) => [{ minHeight: 48, borderRadius: RADIUS.medium, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.line }, pressed && { opacity: 0.72 }]}><Text style={{ color: COLORS.ink, fontSize: 14, fontWeight: '800' }}>Export legacy workspace</Text></Pressable></View> : null}
      </View>
    </View>
  );
}
