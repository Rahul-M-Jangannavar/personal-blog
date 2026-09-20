import { useQuery } from "@tanstack/react-query";

import { fetchProfile } from "../api/blog";

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  return {
    profile: query.data ?? null,
    status: query.isPending ? "loading" : query.isError ? "error" : "success",
    error: query.error?.message ?? null,
  };
}
