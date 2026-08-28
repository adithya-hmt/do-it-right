import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import { MigrationGate } from '@/components/migration-gate';

describe('MigrationGate', () => {
  test('shows a focused loading state while local data is validated', async () => {
    await render(<MigrationGate error={null} onRetry={() => {}} onExport={() => {}} />);
    expect(screen.getByText('Preparing FocusFlow')).toBeTruthy();
    expect(screen.getByLabelText('Preparing FocusFlow workspace')).toBeTruthy();
    expect(screen.queryByText('Retry migration')).toBeNull();
  });

  test('offers retry and legacy export without hiding the migration error', async () => {
    const onRetry = jest.fn();
    const onExport = jest.fn();
    await render(<MigrationGate error="Legacy FocusFlow workspace could not be migrated." onRetry={onRetry} onExport={onExport} />);
    expect(screen.getByText('Legacy FocusFlow workspace could not be migrated.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Retry migration'));
    await fireEvent.press(screen.getByText('Export legacy workspace'));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});
