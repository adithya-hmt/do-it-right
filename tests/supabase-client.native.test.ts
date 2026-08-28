const mockProcessLock = jest.fn();
const mockStartAutoRefresh = jest.fn();
const mockStopAutoRefresh = jest.fn();
const mockCreateClient = jest.fn(() => ({ auth: { startAutoRefresh: mockStartAutoRefresh, stopAutoRefresh: mockStopAutoRefresh } }));
const mockStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

jest.mock('@supabase/supabase-js', () => ({ createClient: mockCreateClient, processLock: mockProcessLock }));
jest.mock('expo-sqlite/kv-store', () => ({ Storage: mockStorage }));
jest.mock('react-native', () => ({ AppState: { currentState: 'active', addEventListener: jest.fn() } }));

describe('native Supabase client', () => {
  const originalUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  afterEach(() => {
    jest.resetModules();
    mockCreateClient.mockClear();
    if (originalUrl === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_URL;
    else process.env.EXPO_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  it('passes direct SQLite KV storage to Supabase Auth', () => {
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test_key';

    require('@/lib/supabase-client.native');

    const call = mockCreateClient.mock.calls[0] as unknown[] | undefined;
    const options = call?.[2] as { auth?: { storage?: unknown; lock?: unknown }} | undefined;
    expect(options?.auth?.storage).toBe(mockStorage);
    expect(options?.auth?.lock).toBe(mockProcessLock);
  });
});
