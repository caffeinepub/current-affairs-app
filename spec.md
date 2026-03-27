# Current Affairs App

## Current State
- Performance.tsx has a hardcoded `TEST_HISTORY` array with 10 fake test entries and derived fake stats
- MockTest.tsx has a hardcoded `QUESTIONS` array with 25 fake/placeholder questions not from real CA data
- App.tsx sidebar shows "PYQ Tests", "Syllabus", "Flashcards" as "Coming Soon" items
- All 14 data files (Jan–Jul 2025, plus quiz extras) are statically imported at the top of DailyCurrentAffairs.tsx, CAQuiz.tsx, and MonthlyCurrentAffairs.tsx — this causes slow initial load as the entire bundle is huge

## Requested Changes (Diff)

### Add
- Empty state in Performance.tsx: "No tests attempted yet. Complete a Mock Test or CA Quiz to see your performance here." with an icon, centered, clean dark-themed card
- MockTest now builds its question pool from the real CA news MCQ data (same data source as CAQuiz) — randomly sample 50 questions from across all months for each test session

### Modify
- Performance.tsx: replace `TEST_HISTORY`, derived stats, and stat cards with empty state UI
- MockTest.tsx: replace fake `QUESTIONS` array with dynamic question pool built from the real CA data (all DayData arrays merged, then each news item's MCQ extracted, shuffled, and capped at 50 per session)
- App.tsx: remove "PYQ Tests" from `comingSoon` array; keep "Syllabus" and "Flashcards" if desired but remove PYQ entirely from sidebar render
- DailyCurrentAffairs.tsx, CAQuiz.tsx, MonthlyCurrentAffairs.tsx: change static top-level imports to lazy loading via useEffect + dynamic import() to reduce initial bundle size and load time

### Remove
- Fake `TEST_HISTORY` array and all derived constants in Performance.tsx
- Fake `QUESTIONS` array in MockTest.tsx
- "PYQ Tests" from sidebar comingSoon list in App.tsx

## Implementation Plan
1. **Performance.tsx**: Delete TEST_HISTORY, all derived vars (totalAttempted, overallAccuracy, bestPct, bestEntry, lastEntry, lastPct, STAT_CARDS), replace component body with empty state card
2. **MockTest.tsx**: Remove `QUESTIONS` array; add imports for all DayData arrays; add `buildMockQuestions()` function that flattens all days → all news → MCQ → shuffle → take first 50; wire into existing CBT test UI
3. **App.tsx**: Remove "PYQ Tests" from comingSoon array
4. **Data loading**: In DailyCurrentAffairs, CAQuiz, MonthlyCurrentAffairs — replace top-level static data imports with a single shared `useAllData` hook or inline `useEffect` that loads via dynamic import, sets state once loaded, and shows a skeleton/spinner while loading. This splits the data out of the main bundle chunk.
