# Current Affairs App

## Current State
App uses a dark NTA CBT theme (deep navy/dark background, blue accent). Header shows only logo. No profile info in the header. Logout is in the Profile page.

## Requested Changes (Diff)

### Add
- User avatar (colored circle with initials) in top-right of header
- User name and email displayed beside the avatar in the header
- Logout button in the header (top-right)

### Modify
- Switch from dark theme to light/white theme matching reference screenshot:
  - White/light gray background
  - White cards with subtle borders and shadows
  - Dark text on light background
  - Blue primary accent (same hue, adjusted for light mode)
  - Light sidebar with dark text and blue active highlight
  - Light gray input backgrounds
- Header: white background, light border, logo on left, user info + logout on right
- Sidebar: white/light background, active item has blue pill highlight
- Category pills and badges: adapt to light theme (same colors, light backgrounds)

### Remove
- Nothing removed

## Implementation Plan
1. Update `index.css` OKLCH tokens to light theme (white background, dark foreground, blue primary)
2. Update `AppShell` header in `App.tsx` to add user avatar (initials), name, email, and Logout button on the right side
3. Add `useAuth` hook usage in `AppShell` to get user info and logout function
4. Ensure `input[type="date"]` color-scheme changed to `light`
5. Ensure sidebar and all page components look correct in light mode (they use semantic tokens so should work automatically)
