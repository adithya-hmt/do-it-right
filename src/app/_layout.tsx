import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { COLORS } from '@/constants/theme';
import { TaskProvider } from '@/context/task-context';

export default function RootLayout() {
  return (
    <TaskProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: COLORS.canvas },
          headerShown: false,
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'card', headerShown: false }} />
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
        <Stack.Screen
          name="new-project"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'New project',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: COLORS.canvas },
            headerTintColor: COLORS.ink,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Search',
            headerShadowVisible: false,
            headerStyle: { backgroundColor: COLORS.canvas },
            headerTintColor: COLORS.ink,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
        <Stack.Screen name="focus" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Focus', headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '800' } }} />
        <Stack.Screen name="review" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Weekly review', headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '800' } }} />
        <Stack.Screen name="settings" options={{ headerShown: true, headerTitle: 'Settings', headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '800' } }} />
        <Stack.Screen name="account" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Keep your workspace', headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '800' } }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: true, headerTitle: 'Project', headerShadowVisible: false, headerStyle: { backgroundColor: COLORS.canvas }, headerTintColor: COLORS.ink, headerTitleStyle: { fontWeight: '800' } }} />
      </Stack>
    </TaskProvider>
  );
}
