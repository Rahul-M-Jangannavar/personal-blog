import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import { fetchTags } from "../api/blog";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { PostCard } from "../components/PostCard";
import { Spinner } from "../components/Spinner";
import { TagFilter } from "../components/TagFilter";
import { usePosts } from "../hooks/usePosts";

const PAGE_SIZE = 10;

export function Blog() {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const tag = params.get("tag") ?? "";
  const page = Number(params.get("page") || 1);

  const { posts, count, status, error } = usePosts({
    page,
    search,
    tag,
    pageSize: PAGE_SIZE,
  });
  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function update(next) {
    const merged = {
      search,
      tag,
      page: String(page),
      ...next,
    };
    const nextParams = new URLSearchParams();
    if (merged.search) nextParams.set("search", merged.search);
    if (merged.tag) nextParams.set("tag", merged.tag);
    if (merged.page && merged.page !== "1") nextParams.set("page", merged.page);
    setParams(nextParams);
  }

  if (status === "loading") return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="stack">
      <h1>Blog</h1>

      <label className="field">
        Search
        <input
          type="search"
          value={search}
          onChange={(event) => update({ search: event.target.value, page: "1" })}
          placeholder="Title or excerpt"
        />
      </label>

      <TagFilter
        tags={tagsQuery.data ?? []}
        selected={tag || null}
        onChange={(slug) => update({ tag: slug ?? "", page: "1" })}
      />

      {posts.length === 0 ? (
        <EmptyState
          title="No posts match"
          detail="Try another tag or clear the search box."
        />
      ) : (
        posts.map((post) => <PostCard key={post.slug} post={post} />)
      )}

      {pageCount > 1 ? (
        <p className="pager">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => update({ page: String(page - 1) })}
          >
            Previous
          </button>
          <span className="muted">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            disabled={page >= pageCount}
            onClick={() => update({ page: String(page + 1) })}
          >
            Next
          </button>
        </p>
      ) : null}
    </div>
  );
}
