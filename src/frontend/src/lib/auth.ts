import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

export function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was cancelled. Please try again.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection and try again.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please wait a moment and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/account-exists-with-different-credential":
      return "An account already exists with this email using a different sign-in method.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google sign-in. Please add it in Firebase Console → Authentication → Settings → Authorized Domains.";
    default:
      return `Sign-in failed (${code || "unknown error"}). Please try again.`;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleRedirectError, setGoogleRedirectError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Handle redirect result after Google sign-in — must surface errors to user
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          // onAuthStateChanged will pick this up automatically
          setGoogleRedirectError(null);
        }
      })
      .catch((err) => {
        const msg = getFirebaseErrorMessage(err?.code ?? "");
        setGoogleRedirectError(msg);
        setIsLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const signupWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithRedirect(auth, new GoogleAuthProvider());

  const logout = () => signOut(auth);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    googleRedirectError,
    clearGoogleRedirectError: () => setGoogleRedirectError(null),
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
  };
}
