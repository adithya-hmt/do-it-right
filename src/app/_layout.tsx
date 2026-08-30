import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { COLORS } from '@/constants/theme';
import { TaskProvider } from '@/context/task-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TaskProvider>
        {/*
         * THESIS: Make one mark at a time; this refuses the equal-weight backlog dashboard.
         * OWN-WORLD: Paper and ink, DIR terracotta as the foundry accent, large proof lines, mono measurements.
         * STORY: Capture a thought, see the next mark, then start or finish it without a guilt loop.
         * FIRST VIEWPORT: Inbox title, one dark NEXT MARK panel, inline capture line, then the quiet proof list.
         * FORM: Interactive type specimen, grounded direction 3, seed 2bcd52f7; raised with direct controls and discrete states.
         * FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
         */}
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: COLORS.canvas },
            headerShown: false,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: COLORS.canvas },
            headerTintColor: COLORS.ink,
            headerTitleStyle: { fontWeight: '800' },
          }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: 'card' }} />
        <Stack.Screen
          name="add-task"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'New task',
          }}
        />
        <Stack.Screen
          name="new-project"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'New project',
          }}
        />
        <Stack.Screen
          name="search"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Search',
          }}
        />
        <Stack.Screen name="focus" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Focus' }} />
        <Stack.Screen name="review" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Weekly review' }} />
        <Stack.Screen name="settings" options={{ headerShown: true, headerTitle: 'Settings' }} />
        <Stack.Screen name="account" options={{ presentation: 'modal', headerShown: true, headerTitle: 'Keep your workspace' }} />
        <Stack.Screen name="new-space" options={{ presentation: 'modal', headerShown: true, headerTitle: 'New space' }} />
        <Stack.Screen name="space/[id]" options={{ headerShown: true, headerTitle: 'Space' }} />
        <Stack.Screen name="space-members" options={{ presentation: 'modal', headerShown: true, headerTitle: 'People' }} />
        <Stack.Screen name="project/[id]" options={{ headerShown: true, headerTitle: 'Project' }} />
        <Stack.Screen name="task/[id]" options={{ headerShown: true, headerTitle: 'Task details' }} />
        <Stack.Screen name="daily-three" options={{ headerShown: true, headerTitle: 'Daily Three' }} />
        <Stack.Screen name="routines" options={{ headerShown: true, headerTitle: 'Routines' }} />
        <Stack.Screen name="completed" options={{ headerShown: true, headerTitle: 'Completed' }} />
        </Stack>
      </TaskProvider>
    </SafeAreaProvider>
  );
}
