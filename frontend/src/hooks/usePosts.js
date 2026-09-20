import { useQuery } from "@tanstack/react-query";

import { fetchPost, fetchPosts } from "../api/blog";

export function usePosts({ page = 1, search = "", tag = "", pageSize = 10 } = {}) {
  const query = useQuery({
    queryKey: ["posts", { page, search, tag, pageSize }],
    queryFn: () => fetchPosts({ page, search, tag, pageSize }),
  });

  return {
    posts: query.data?.results ?? [],
    count: query.data?.count ?? 0,
    status: query.isPending ? "loading" : query.isError ? "error" : "success",
    error: query.error?.message ?? null,
  };
}

export function usePost(slug) {
  const query = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
    enabled: Boolean(slug),
    retry: (failureCount, error) => error?.status !== 404 && failureCount < 1,
  });

  const notFound = query.error?.status === 404;

  return {
    post: query.data ?? null,
    status: query.isPending
      ? "loading"
      : notFound
        ? "empty"
        : query.isError
          ? "error"
          : "success",
    error: notFound ? null : (query.error?.message ?? null),
  };
}
