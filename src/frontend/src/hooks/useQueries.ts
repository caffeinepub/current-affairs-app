import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  NewsItem,
  UserProfile,
  UserProgress,
  UserStats,
} from "../backend.d";
import { useActor } from "./useActor";

const NEWS_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const NEWS_GC_TIME = 10 * 60 * 1000; // 10 minutes

export function useUserProgress() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProgress>({
    queryKey: ["userProgress"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getUserProgress();
    },
    enabled: !!actor && !isFetching,
    staleTime: NEWS_STALE_TIME,
  });
}

export function useNewsItems() {
  const { actor, isFetching } = useActor();
  // Use the same cache key as useAllNewsItems to avoid double fetch
  return useQuery<NewsItem[]>({
    queryKey: ["allNewsItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNewsItemsByDate();
    },
    enabled: !!actor && !isFetching,
    staleTime: NEWS_STALE_TIME,
    gcTime: NEWS_GC_TIME,
    select: (data) => data.slice(0, 5),
  });
}

export function useAllNewsItems() {
  const { actor, isFetching } = useActor();
  return useQuery<NewsItem[]>({
    queryKey: ["allNewsItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllNewsItemsByDate();
    },
    enabled: !!actor && !isFetching,
    staleTime: NEWS_STALE_TIME,
    gcTime: NEWS_GC_TIME,
  });
}

export function usePrepopulate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.prepopulateNewsItems();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allNewsItems"] });
    },
  });
}

export function useMarkDayCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      await actor.markDayCompleted();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
    },
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: NEWS_STALE_TIME,
  });
}

export function useMyStats() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats>({
    queryKey: ["myStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getMyStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: NEWS_STALE_TIME,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email }: { name: string; email: string }) => {
      if (!actor) throw new Error("No actor");
      await actor.saveProfile(name, email);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}

export function useIncrementTestsAttempted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (score: bigint) => {
      if (!actor) throw new Error("No actor");
      await actor.incrementTestsAttempted(score);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myStats"] });
      queryClient.invalidateQueries({ queryKey: ["myProfile"] });
    },
  });
}
