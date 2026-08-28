import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph, type GlyphName } from '@/components/ui/glyph';
import { COLORS } from '@/constants/theme';

function TabIcon({ name, color }: { name: GlyphName; color: ColorValue }) {
  return <Glyph name={name} color={color} size={19} />;
}

// Android uses the stable JS tabs navigator. The native tabs implementation is
// still used on iOS, but this avoids known Fabric/native-tabs crash paths on
// Android release builds while keeping the same routes and visual language.
export default function AndroidTabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottom = Math.max(14, insets.bottom + 10);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.contrastMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: tabBarBottom,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: COLORS.contrast,
          borderTopWidth: 0,
          borderRadius: 24,
          boxShadow: '0 12px 28px rgba(37, 30, 56, 0.22)',
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '900' },
        tabBarItemStyle: { gap: 3 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <TabIcon name="inbox" color={color} />,
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color }) => <TabIcon name="projects" color={color} />,
        }}
      />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
      <Tabs.Screen name="you" options={{ href: null }} />
    </Tabs>
  );
}
