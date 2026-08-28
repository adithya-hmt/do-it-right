import { Tabs } from 'expo-router';
import React from 'react';
import type { ColorValue } from 'react-native';

import { Glyph, type GlyphName } from '@/components/ui/glyph';
import { COLORS } from '@/constants/theme';

function TabIcon({ name, color }: { name: GlyphName; color: ColorValue }) {
  return <Glyph name={name} color={color} size={19} />;
}

// Android uses the stable JS tabs navigator. The native tabs implementation is
// still used on iOS, but this avoids known Fabric/native-tabs crash paths on
// Android release builds while keeping the same routes and visual language.
export default function AndroidTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#AAB4A5',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 14,
          height: 70,
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: COLORS.contrast,
          borderTopWidth: 0,
          borderRadius: 24,
          boxShadow: '0 12px 28px rgba(17, 22, 15, 0.22)',
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '900' },
        tabBarItemStyle: { gap: 3 },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabIcon name="today" color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color }) => <TabIcon name="projects" color={color} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
