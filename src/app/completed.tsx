import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { TaskSection } from '@/components/workspace-list';
import { COLORS, GUTTER } from '@/constants/theme';
import { useTasks } from '@/context/task-context';
import { getCompletedTasks } from '@/domain/workspace-selectors';

export default function CompletedScreen() {
  const { tasks, toggleTask } = useTasks();
  const completed = getCompletedTasks(tasks);
  return <><Stack.Screen options={{ title: 'Completed' }} /><View style={{ flex: 1, backgroundColor: COLORS.canvas }}><ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ padding: GUTTER, gap: 20 }}><TaskSection title="Completed tasks" subtitle={`${completed.length} finished`} tasks={completed} onComplete={(task) => toggleTask(task.id)} emptyTitle="Nothing completed yet" emptyBody="Finished tasks will collect here." /></ScrollView></View></>;
}
