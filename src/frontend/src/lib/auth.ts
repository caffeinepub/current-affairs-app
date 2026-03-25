import {
  GoogleAuthProvider,
  type User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

  const loginWithGoogle = () => signInWithPopup(auth, new GoogleAuthProvider());

  const logout = () => signOut(auth);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
    loginWithEmail,
    signupWithEmail,
    loginWithGoogle,
    logout,
  };
}
