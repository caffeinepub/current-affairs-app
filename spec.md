# Current Affairs App

## Current State
- MonthlyCurrentAffairs.tsx has a non-functional Download button (placeholder only)
- Quick Revision toggle exists and works (shows only important/exam-likely news)
- News cards are expandable with title, summary, category tag, key insight
- Category filter pills and month navigation are implemented

## Requested Changes (Diff)

### Add
- **Download as Image** functionality using `html2canvas` (or Canvas API)
- Two download options:
  1. **Download All** - captures all news for the current month as a long image
  2. **Download Filtered** - captures only the currently filtered/quick revision news
- Download generates a clean, shareable notes-style image:
  - Dark background matching the app theme
  - Month title header
  - Each news item: title, category tag (color-coded), summary, key insight/explanation
  - Footer: "TS LAWCET Current Affairs - [Month Year]"
- Download button in header replaced with a dropdown showing both options
- Quick Revision also works as download scope (if quick mode on, Filtered = only important/exam-likely)

### Modify
- Replace the existing placeholder Download button with a functional dropdown button

### Remove
- Nothing

## Implementation Plan
1. Install `html2canvas` for image generation (or use Canvas API directly to avoid dependency)
2. Create a `generateNotesImage(newsItems, monthLabel)` utility function that:
   - Creates an off-screen canvas
   - Draws a dark-themed notes layout (dark bg, white text, colored category badges)
   - Each news item as a card: title bold, category pill, summary, explanation indented
   - Saves as PNG download
3. Add a download dropdown in MonthlyCurrentAffairs header with "Download All" and "Download Filtered"
4. Wire both buttons to the image generator with respective news lists
