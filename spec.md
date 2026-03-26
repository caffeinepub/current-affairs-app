# Current Affairs App

## Current State
- DailyCurrentAffairs: Date picker, category filter pills, big card layout per news item with inline MCQ toggle
- MonthlyCurrentAffairs: List of all months as accordion cards, expand each month to see days, expand days to see news

## Requested Changes (Diff)

### Add
- Daily CA: Time filter row (Today / This Week / This Month / All Time + date picker)
- Daily CA: Date group headers with item count and left blue border accent (e.g. "Saturday, 15 January 2025 · 5 items")
- Daily CA: Accordion-style compact news rows (title + category badge + chevron; expand to show summary + MCQ)
- Daily CA: Quick Revision button in header
- Monthly CA: Single-month view with prev/next arrow navigation
- Monthly CA: Category stats cards row (National, International, Legal, Awards, Sports with counts and colors)
- Monthly CA: Important Highlights section (one story per category)
- Monthly CA: Category filter chips with counts (All, National(n), International(n), Legal(n), Awards(n), Sports(n))
- Monthly CA: Flat accordion list of all news in month, sorted by date

### Modify
- Daily CA: Replace large card layout with compact accordion rows grouped by date
- Daily CA: Header style — add icon, subtitle, Quick Revision button
- Monthly CA: Replace "all months list" with single-month navigation
- Monthly CA: News items shown as flat accordion list (not nested day > news)

### Remove
- Daily CA: Large card design with always-visible summary
- Monthly CA: Month list accordion with day-level expand inside

## Implementation Plan
1. Rewrite DailyCurrentAffairs.tsx with new layout: header, time filters, category filters, date-grouped accordion list
2. Rewrite MonthlyCurrentAffairs.tsx with single-month view: header, month nav, category stats cards, highlights, category filter chips, flat accordion list
3. Both pages keep existing data sources (static data files)
4. Accordion expand shows summary text + MCQ inline
