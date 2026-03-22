import { useInternetIdentity } from "@/hooks/useInternetIdentity";

export function useAuth() {
  const { identity, login, clear, isInitializing } = useInternetIdentity();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  return {
    isAuthenticated,
    isLoading: isInitializing,
    login,
    logout: clear,
    principal: identity?.getPrincipal(),
  };
}
