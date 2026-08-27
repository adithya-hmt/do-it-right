import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { COLORS } from '@/constants/theme';
import { TaskProvider } from '@/context/task-context';

export default function RootLayout() {
  return (
    <TaskProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: COLORS.canvas },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'New task',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: COLORS.canvas },
            headerTintColor: COLORS.ink,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      </Stack>
    </TaskProvider>
  );
}
