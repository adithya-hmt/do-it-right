export type SupabaseAuthSettings = {
  email: boolean;
  google: boolean;
};

function readBooleanOverride(value: string | undefined): boolean | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

export function parseSupabaseAuthSettings(value: unknown): SupabaseAuthSettings | null {
  if (!value || typeof value !== 'object') return null;
  const external = (value as { external?: unknown }).external;
  if (!external || typeof external !== 'object') return null;
  const providers = external as { email?: unknown; google?: unknown };
  if (typeof providers.email !== 'boolean' && typeof providers.google !== 'boolean') return null;
  return { email: providers.email === true, google: providers.google === true };
}

export async function getSupabaseAuthSettings(): Promise<SupabaseAuthSettings | null> {
  // Keep these accesses static so Expo inlines them into standalone builds.
  const emailOverride = readBooleanOverride(process.env.EXPO_PUBLIC_SUPABASE_EMAIL_ENABLED);
  const googleOverride = readBooleanOverride(process.env.EXPO_PUBLIC_SUPABASE_GOOGLE_ENABLED);

  // An explicit local override is useful when the project settings endpoint is
  // unavailable on a device (for example, while offline). It also prevents a
  // disabled provider from ever opening a browser that can only show a raw
  // Supabase error response.
  if (emailOverride !== undefined || googleOverride !== undefined) {
    return { email: emailOverride ?? true, google: googleOverride ?? true };
  }

  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetch(`${url.replace(/\/$/, '')}/auth/v1/settings`, { headers: { apikey: key } });
    if (!response.ok) return null;
    return parseSupabaseAuthSettings(await response.json());
  } catch {
    return null;
  }
}
