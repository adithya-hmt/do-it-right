import { Tabs } from 'expo-router';
import React from 'react';
import { useWindowDimensions, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Glyph, type GlyphName } from '@/components/ui/glyph';
import { WebSidebar } from '@/components/web-sidebar';
import { COLORS } from '@/constants/theme';

function TabIcon({ name, color }: { name: GlyphName; color: ColorValue }) {
  return <Glyph name={name} color={color} size={19} />;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const desktop = process.env.EXPO_OS === 'web' && width >= 960;
  const tabs = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.contrastMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: desktop ? { display: 'none' } : {
          height: 68 + insets.bottom,
          paddingTop: 9,
          paddingBottom: Math.max(9, insets.bottom),
          backgroundColor: COLORS.contrast,
          borderTopWidth: 1,
          borderTopColor: COLORS.contrastLine,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '800' },
        tabBarItemStyle: { gap: 4 },
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
        name="spaces"
        options={{
          title: 'Spaces',
          tabBarIcon: ({ color }) => <TabIcon name="people" color={color} />,
        }}
      />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <TabIcon name="user" color={color} /> }} />
      <Tabs.Screen name="browse" options={{ href: null }} />
      <Tabs.Screen name="plan" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
    </Tabs>
  );

  if (desktop) {
    return <View style={{ flex: 1, flexDirection: 'row', backgroundColor: COLORS.canvas }}><WebSidebar /><View style={{ flex: 1, alignItems: 'center' }}><View style={{ flex: 1, width: '100%', maxWidth: 1120 }}>{tabs}</View></View></View>;
  }

  return tabs;
}
