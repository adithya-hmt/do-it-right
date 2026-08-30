import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

let mockTaskContext: Record<string, unknown>;

jest.mock('expo-router', () => ({
  Stack: { Screen: () => null },
  router: { replace: jest.fn(), push: jest.fn() },
  useLocalSearchParams: () => ({ invitation: 'invitation-1', token: 'token-1' }),
}));
jest.mock('@/context/task-context', () => ({ useTasks: () => mockTaskContext }));

import { router } from 'expo-router';
import InviteScreen from '@/app/invite';

describe('Invite screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('refreshes the workspace before opening an accepted space', async () => {
    const acceptInvitation = jest.fn().mockResolvedValue({ spaceId: 'space-1', error: null });
    const syncNow = jest.fn().mockResolvedValue(undefined);
    const previewInvitation = jest.fn().mockResolvedValue({ data: null, error: null });
    mockTaskContext = { session: { user: { id: 'user-1' } }, acceptInvitation, previewInvitation, syncNow };

    const view = await render(<InviteScreen />);
    fireEvent.press(view.getByText('Join space'));

    await waitFor(() => expect(syncNow).toHaveBeenCalledTimes(1));
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/space/[id]', params: { id: 'space-1' } });
  });
});
