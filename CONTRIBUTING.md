# Contributing to Do It Right

Thanks for helping make a calmer, more useful personal tool.

## Before opening a pull request

- Keep the product private-by-default and avoid gamification that adds pressure.
- Put reusable business rules in `src/domain` and cover them with Jest tests.
- Keep device APIs behind `src/platform` adapters with a web fallback.
- Run `npm test`, `npx tsc --noEmit`, `npx expo lint`, and `npx expo export --platform web`.
- Explain user-facing behavior and any Supabase migration in the pull request description.

Small focused pull requests are easiest to review. Please do not include secrets, `.env.local`, or generated native folders.
