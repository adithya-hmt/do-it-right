import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { Glyph } from '@/components/ui/glyph';
import { COLORS, GUTTER, RADIUS, SHADOW } from '@/constants/theme';

const BARS = [
  { day: 'M', value: 0.64 },
  { day: 'T', value: 0.84 },
  { day: 'W', value: 0.48 },
  { day: 'T', value: 0.91 },
  { day: 'F', value: 0.76 },
  { day: 'S', value: 0.3 },
  { day: 'S', value: 0.54 },
];

export default function InsightsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <ScrollView contentInsetAdjustmentBehavior="automatic" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: GUTTER, paddingTop: 23, paddingBottom: 124, gap: 24 }}>
        <Animated.View entering={FadeInDown.duration(420)} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Glyph name="trend" size={18} color={COLORS.coral} />
            <Text style={{ color: COLORS.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.3 }}>WEEKLY REFLECTION</Text>
          </View>
          <Text selectable style={{ color: COLORS.ink, fontSize: 34, lineHeight: 38, fontWeight: '900', letterSpacing: -1 }}>Notice the{ '\n' }rhythm.</Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, lineHeight: 20, fontWeight: '600' }}>A little signal from the week, so your next decision can be more intentional.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(80).duration(500)} style={{ borderRadius: RADIUS.large, backgroundColor: COLORS.lavender, padding: 22, gap: 20, boxShadow: SHADOW }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' }}><Glyph name="target" size={16} color={COLORS.lavenderInk} /></View>
              <Text style={{ color: COLORS.lavenderInk, fontSize: 12, fontWeight: '900' }}>FOCUS SCORE</Text>
            </View>
            <View style={{ backgroundColor: COLORS.mint, borderRadius: RADIUS.pill, paddingHorizontal: 10, paddingVertical: 6 }}><Text style={{ color: COLORS.mintInk, fontSize: 11, fontWeight: '900' }}>↑ 12% this week</Text></View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <Text selectable style={{ color: COLORS.ink, fontSize: 61, lineHeight: 63, fontWeight: '900', letterSpacing: -2, fontVariant: ['tabular-nums'] }}>74</Text>
            <Text style={{ color: COLORS.lavenderInk, fontSize: 13, fontWeight: '800', paddingBottom: 11 }}>out of 100</Text>
          </View>
          <View style={{ height: 7, borderRadius: RADIUS.pill, backgroundColor: '#D6D2FF', overflow: 'hidden' }}><View style={{ width: '74%', height: 7, borderRadius: RADIUS.pill, backgroundColor: COLORS.lavenderInk }} /></View>
          <Text style={{ color: COLORS.lavenderInk, fontSize: 13, lineHeight: 19, fontWeight: '600' }}>You are doing your best work when you choose one clear start before opening the rest of the tabs.</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(140).duration(500)} style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.medium, padding: 18, gap: 22, boxShadow: SHADOW }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4 }}><Text style={{ color: COLORS.ink, fontSize: 18, fontWeight: '900' }}>Your week in motion</Text><Text style={{ color: COLORS.muted, fontSize: 12, fontWeight: '600' }}>Deep work minutes by day</Text></View>
            <Glyph name="arrow" size={18} color={COLORS.primary} />
          </View>
          <View style={{ height: 134, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
            {BARS.map((bar, index) => <View key={`${bar.day}-${index}`} style={{ flex: 1, alignItems: 'center', gap: 8 }}><View style={{ width: '100%', height: 104, justifyContent: 'flex-end', alignItems: 'center' }}><View style={{ width: '76%', height: `${bar.value * 100}%`, minHeight: 15, borderRadius: 8, backgroundColor: index === 3 ? COLORS.primary : COLORS.primarySoft }} /></View><Text style={{ color: index === 3 ? COLORS.primary : COLORS.muted, fontSize: 11, fontWeight: '900' }}>{bar.day}</Text></View>)}
          </View>
        </Animated.View>

        <View style={{ gap: 13 }}>
          <Text style={{ color: COLORS.ink, fontSize: 20, fontWeight: '900' }}>A note for next week</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.ink, borderRadius: RADIUS.medium, padding: 17 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: COLORS.coral, alignItems: 'center', justifyContent: 'center' }}><Glyph name="spark" size={18} color={COLORS.white} /></View>
            <View style={{ flex: 1, gap: 4 }}><Text style={{ color: COLORS.white, fontSize: 14, lineHeight: 19, fontWeight: '800' }}>Protect your first hour.</Text><Text style={{ color: '#B8C4C9', fontSize: 12, lineHeight: 17, fontWeight: '600' }}>Your completion rate is highest before 11 AM.</Text></View>
            <Glyph name="arrow" size={18} color={COLORS.amber} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
