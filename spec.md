# Current Affairs App

## Current State
Monthly Current Affairs shows a flat accordion list of all news for the selected month, grouped only by small inline date headers within a single card container.

## Requested Changes (Diff)

### Add
- Day-level collapsible sections in Monthly CA: each date becomes its own expandable section card (date header button shows date + news count, click to expand/collapse)

### Modify
- Replace the flat `bg-card` container with individual per-day cards
- Each day card: header row (date string, news count badge, chevron), body (news accordion rows when expanded)
- First day of the month defaults to expanded; rest collapsed by default

### Remove
- Flat single-container list with inline date sub-headers

## Implementation Plan
1. Change `sortedFilteredNews` to be grouped by date: `{ date: string; items: {item, date}[] }[]`
2. Add `expandedDays` state (Set of date strings); default first date open
3. Render each day as its own rounded card with a toggle header
4. Inside each day card, render `AccordionRow` items as before
