import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from "../api/blog";

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  return {
    profile: query.data ?? null,
    status: query.isPending ? "loading" : query.isError ? "error" : "success",
    error: query.error?.message ?? null,
  };
}
