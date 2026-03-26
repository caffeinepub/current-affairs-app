# Current Affairs App

## Current State
MonthlyCurrentAffairs.tsx already has prev/next month navigation, category stat cards, Important Highlights section, category filter pills, and accordion news list grouped by day. The design exists but doesn't precisely match the reference screenshot.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Category stat cards: Make numbers much larger/bolder (text-3xl+), display only 5 categories in a row (National, International, Legal, Awards, Sports -- remove Economy from stat cards row OR include it but ensure they fit in one row on desktop). Match screenshot: dark card bg, colored large number, category label below.
- Important Highlights: Always show cards expanded by default (no toggle needed -- the subtitle 'One representative story per category' stays visible). Each highlight card: category colored badge top-left, bold title, 2-line summary visible without clicking.
- Overall layout: Match the reference screenshot's clean dark aesthetic with proper card proportions.

### Remove
- Nothing

## Implementation Plan
1. Update stat card grid to show all 6 categories (or match the 5 in screenshot) in a single row with large bold colored numbers.
2. Make the Important Highlights section always show the news cards (keep the collapse toggle but default open and ensure cards show summary text without needing to click).
3. Ensure the highlight cards match screenshot: colored category badge, bold title, truncated summary in muted text.
