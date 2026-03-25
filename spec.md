# Current Affairs App

## Current State
- Authentication uses Internet Identity (ICP-native)
- LoginScreen shows a single "Sign In with Internet Identity" button
- Auth state managed via `useInternetIdentity` hook in `src/frontend/src/lib/auth.ts`
- App shows login screen if not authenticated, main app if authenticated

## Requested Changes (Diff)

### Add
- Firebase SDK (firebase package) installed as a dependency
- `src/frontend/src/lib/firebase.ts` -- Firebase app initialization with provided config
- Email/Password sign-up and sign-in forms in the LoginScreen
- Google Sign-In button using Firebase Google Auth provider
- Toggle between "Sign In" and "Sign Up" modes on the login screen
- Persistent auth session via Firebase (onAuthStateChanged) -- user stays logged in until they manually log out

### Modify
- `src/frontend/src/lib/auth.ts` -- Replace useInternetIdentity with Firebase auth (onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup GoogleAuthProvider, signOut)
- `src/frontend/src/App.tsx` -- Update LoginScreen to show email/password fields + Google button; show error messages for wrong credentials; show loading states

### Remove
- All references to `useInternetIdentity` and Internet Identity login

## Implementation Plan
1. Install `firebase` npm package
2. Create `src/frontend/src/lib/firebase.ts` with Firebase config initialization
3. Rewrite `src/frontend/src/lib/auth.ts` to use Firebase auth with persistent sessions
4. Update `LoginScreen` in `App.tsx`:
   - Email input + Password input
   - Sign In / Sign Up toggle
   - Google Sign-In button
   - Error display
   - Loading states
5. Remove Internet Identity imports/usage
6. Validate and build
