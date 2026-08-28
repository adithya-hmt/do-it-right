import { render, screen } from '@testing-library/react-native';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

let mockTaskContext: Record<string, unknown>;

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('@/context/task-context', () => ({ useTasks: () => mockTaskContext }));
jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  const animation = { duration: () => animation, delay: () => animation };
  return { __esModule: true, default: { View }, FadeIn: animation, FadeOut: animation };
});

import SpacesScreen from '@/app/(tabs)/spaces';

async function renderScreen() {
  return render(<SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } }}><SpacesScreen /></SafeAreaProvider>);
}

describe('Spaces screen', () => {
  test('explains that collaboration needs an account without blocking personal work', async () => {
    mockTaskContext = { spaces: [], memberships: [], tasks: [], session: null };
    await renderScreen();
    expect(screen.getByText('Sign in to collaborate')).toBeTruthy();
    expect(screen.getByText(/Your personal tasks still work offline/)).toBeTruthy();
  });

  test('shows shared spaces and the creation action for authenticated users', async () => {
    mockTaskContext = {
      spaces: [{ id: 'space-1', name: 'Design studio', description: 'Launch work', color: '#C44F2B' }],
      memberships: [{ id: 'member-1', spaceId: 'space-1', status: 'active' }],
      tasks: [{ id: 'task-1', spaceId: 'space-1', completed: false, status: 'planned' }],
      session: { user: { id: 'user-1' } },
    };
    await renderScreen();
    expect(screen.getByText('Design studio')).toBeTruthy();
    expect(screen.getByLabelText('Create a shared space')).toBeTruthy();
  });
});
