# Current Affairs App

## Current State
App has duplicate UI elements, redundant data fetches, and performance issues including timer-driven re-renders on MockTest and missing query cache configuration.

## Requested Changes (Diff)

### Add
- Shared utility file `src/frontend/src/lib/utils-ca.ts` with: `CATEGORY_COLORS`, `getCategoryColor`, `formatBigIntDate`, `calcProgressPct`
- `staleTime: 5 * 60 * 1000` on all news queries to prevent refetch-on-every-mount
- `React.memo` on MockTest palette button component and answer option buttons
- `useCallback` on MockTest handlers (saveAndNext, markAndNext, setCurrent)

### Modify
- `useQueries.ts`: make `useNewsItems` use `select` on the `allNewsItems` query instead of a separate fetch; add staleTime to all queries
- `Profile.tsx`: remove the bottom duplicate "Sign out of account" button; fix duplicate `data-ocid` on the 3 cards
- `App.tsx`: remove standalone desktop Profile icon button (Profile already in nav); remove `CATEGORY_COLORS`/`getCategoryColor`/`formatBigIntDate` — import from shared utils
- `DailyCurrentAffairs.tsx`: import shared utils, remove local duplicates
- `MonthlyCurrentAffairs.tsx`: import shared utils, remove local duplicates
- `MockTest.tsx`: memoize palette render to stop 60 re-renders/min from timer; combine desktop+mobile question palette into one memoized component with responsive CSS; fix duplicate data-ocid values

### Remove
- Local `CATEGORY_COLORS`, `getCategoryColor`, `formatBigIntDate` from App.tsx, DailyCurrentAffairs.tsx, MonthlyCurrentAffairs.tsx (moved to shared utils)
- Duplicate bottom Sign Out button from Profile.tsx
- Redundant standalone Profile icon `<button>` from desktop header in App.tsx
- Second `QUESTIONS.map` call in MockTest (mobile palette overlay) — replace with shared component

## Implementation Plan
1. Create `src/frontend/src/lib/utils-ca.ts` with shared constants and helpers
2. Update `useQueries.ts`: fix double-fetch with `select`, add staleTime
3. Update `MockTest.tsx`: memoize QuestionPalette and OptionButton components; use useCallback on all handlers
4. Update `Profile.tsx`: remove duplicate Sign Out, fix data-ocid
5. Update `App.tsx`, `DailyCurrentAffairs.tsx`, `MonthlyCurrentAffairs.tsx`: use shared utils, remove redundant profile icon button
