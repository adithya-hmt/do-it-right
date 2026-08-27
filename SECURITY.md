# Security policy

## Supported setup

The latest version on the default branch is the supported version.

## Reporting a vulnerability

Please report security issues privately to the repository maintainers instead of opening a public issue. Include the affected area, reproduction steps, and a suggested mitigation when possible.

Never commit `.env.local`, Supabase service-role keys, database passwords, or user exports. The mobile app must only use the public publishable key with Row Level Security enabled.
