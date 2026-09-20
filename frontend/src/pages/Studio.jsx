import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";

import { deletePost, fetchStudioPosts } from "../api/blog";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";

export function Studio() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["studio-posts"],
    queryFn: fetchStudioPosts,
  });
  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-posts"] }),
  });

  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorMessage message={query.error.message} />;

  const posts = query.data?.results ?? [];

  return (
    <div className="stack">
      <h1>Studio</h1>
      <p>
        <Link to="/studio/new">Write a post</Link>
      </p>
      {posts.length === 0 ? (
        <EmptyState title="No posts yet" detail="Create one and publish it from here." />
      ) : (
        posts.map((post) => (
          <article key={post.slug} className="card">
            <p className="muted">
              {post.status}
              {post.published_at
                ? ` · ${new Date(post.published_at).toLocaleDateString("en-IN")}`
                : ""}
            </p>
            <h2>
              <Link to={`/studio/${post.slug}`}>{post.title}</Link>
            </h2>
            <p>{post.excerpt}</p>
            <p className="tag-row">
              <Link to={`/studio/${post.slug}`}>Edit</Link>
              {post.status === "published" ? (
                <Link to={`/blog/${post.slug}`}>View</Link>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete “${post.title}”?`)) remove.mutate(post.slug);
                }}
              >
                Delete
              </button>
            </p>
          </article>
        ))
      )}
    </div>
  );
}
