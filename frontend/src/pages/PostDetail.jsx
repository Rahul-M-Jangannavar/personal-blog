import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Markdown from "react-markdown";
import { Link, useParams } from "react-router-dom";

import { createComment } from "../api/blog";
import { ApiError } from "../api/errors";
import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";
import { usePost } from "../hooks/usePosts";

export function PostDetail() {
  const { slug } = useParams();
  const { post, status, error } = usePost(slug);

  if (status === "loading") return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) {
    return <EmptyState title="Post not found" detail="That slug is not on the API." />;
  }

  const published = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unpublished";

  return (
    <article className="stack">
      <p>
        <Link to="/blog">← All posts</Link>
      </p>
      {post.cover_image ? (
        <img className="cover cover-hero" src={post.cover_image} alt="" />
      ) : null}
      <h1>{post.title}</h1>
      <p className="muted">
        {published} · {post.reading_time_minutes} min · {post.author}
      </p>
      <p className="tag-row">
        {post.tags.map((tag) => (
          <span key={tag.slug} className="tag">
            {tag.name}
          </span>
        ))}
      </p>
      <div className="markdown body-text">
        <Markdown>{post.body}</Markdown>
      </div>

      <section className="stack">
        <h2>Comments</h2>
        {(post.comments ?? []).length === 0 ? (
          <EmptyState title="No comments yet" detail="Approved comments appear here." />
        ) : (
          post.comments.map((comment) => (
            <blockquote key={comment.id} className="comment">
              <p>{comment.body}</p>
              <footer className="muted">— {comment.author_name}</footer>
            </blockquote>
          ))
        )}
        <CommentForm slug={slug} />
      </section>
    </article>
  );
}

function CommentForm({ slug }) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState({ author_name: "", email: "", body: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: () => createComment(slug, values),
    onSuccess: () => {
      setDone(true);
      setValues({ author_name: "", email: "", body: "" });
      setFieldErrors({});
      queryClient.invalidateQueries({ queryKey: ["post", slug] });
    },
    onError: (err) => {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setDone(false);
    mutation.mutate();
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      <h3>Leave a comment</h3>
      <p className="muted">Held for moderation until it is approved.</p>
      {done ? (
        <p className="status status-success" role="status">
          Thanks — it will show once it is approved.
        </p>
      ) : null}
      <ErrorMessage message={mutation.isError ? mutation.error.message : null} />
      <label className="field">
        Name
        <input name="author_name" value={values.author_name} onChange={handleChange} />
        {fieldErrors.author_name ? (
          <span className="field-error">{fieldErrors.author_name}</span>
        ) : null}
      </label>
      <label className="field">
        Email
        <input name="email" type="email" value={values.email} onChange={handleChange} />
        {fieldErrors.email ? <span className="field-error">{fieldErrors.email}</span> : null}
      </label>
      <label className="field">
        Comment
        <textarea name="body" rows={4} value={values.body} onChange={handleChange} />
        {fieldErrors.body ? <span className="field-error">{fieldErrors.body}</span> : null}
      </label>
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : "Post comment"}
      </button>
    </form>
  );
}
