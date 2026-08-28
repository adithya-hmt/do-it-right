let inTransaction = false;

type MockDatabase = {
  getFirstAsync: (sql: string) => Promise<{ user_version: number } | null>;
  getAllAsync: () => Promise<unknown[]>;
  runAsync: () => Promise<void>;
  execAsync: (sql: string) => Promise<void>;
  withTransactionAsync: (operation: () => Promise<unknown>) => Promise<unknown>;
};

const mockDb: MockDatabase = {
  getFirstAsync: jest.fn(async (sql: string) => sql.includes('user_version') ? { user_version: 0 } : null),
  getAllAsync: jest.fn(async () => []),
  runAsync: jest.fn(async () => undefined),
  execAsync: jest.fn(async (sql: string) => {
    if (inTransaction && /journal_mode\s*=\s*WAL/i.test(sql)) {
      throw new Error('cannot change into wal mode from within a transaction');
    }
  }),
  withTransactionAsync: jest.fn(async (operation: () => Promise<unknown>): Promise<unknown> => {
    if (inTransaction) throw new Error('cannot start a transaction within a transaction');
    inTransaction = true;
    try {
      return await operation();
    } finally {
      inTransaction = false;
    }
  }),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => mockDb),
}));

import { workspaceV3Storage } from '@/lib/workspace-v3-storage.native';

describe('native WorkspaceV3Storage initialization', () => {
  test('configures WAL before initializing the schema', async () => {
    await expect(workspaceV3Storage.load('guest')).resolves.toBeNull();

    expect(mockDb.execAsync).toHaveBeenCalledWith(expect.stringMatching(/journal_mode\s*=\s*WAL/i));
    expect(mockDb.withTransactionAsync).not.toHaveBeenCalled();
  });

  test('serializes concurrent workspace transactions', async () => {
    const events: string[] = [];
    let releaseFirst!: () => void;
    let firstStarted!: () => void;
    const firstCanFinish = new Promise<void>((resolve) => { releaseFirst = resolve; });
    const firstIsRunning = new Promise<void>((resolve) => { firstStarted = resolve; });

    const first = workspaceV3Storage.transaction(async () => {
      events.push('first-start');
      firstStarted();
      await firstCanFinish;
      events.push('first-end');
    });
    await firstIsRunning;
    const second = workspaceV3Storage.transaction(async () => {
      events.push('second');
    });

    releaseFirst();
    await Promise.all([first, second]);

    expect(events).toEqual(['first-start', 'first-end', 'second']);
    expect(mockDb.withTransactionAsync).toHaveBeenCalledTimes(2);
  });
});
