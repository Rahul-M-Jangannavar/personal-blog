import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { createPost, fetchStudioPost, fetchTags, updatePost } from "../api/blog";
import { ApiError } from "../api/errors";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  status: "draft",
  tag_slugs: [],
};

export function PostEditor() {
  const { slug } = useParams();
  const isNew = !slug;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const tagsQuery = useQuery({ queryKey: ["tags"], queryFn: fetchTags });
  const postQuery = useQuery({
    queryKey: ["studio-post", slug],
    queryFn: () => fetchStudioPost(slug),
    enabled: !isNew,
  });

  useEffect(() => {
    if (!postQuery.data) return;
    const post = postQuery.data;
    setValues({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      status: post.status,
      tag_slugs: post.tags.map((tag) => tag.slug),
    });
  }, [postQuery.data]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title: values.title,
        excerpt: values.excerpt,
        body: values.body,
        status: values.status,
        tag_slugs: values.tag_slugs,
      };
      if (values.slug) payload.slug = values.slug;
      return isNew ? createPost(payload, file) : updatePost(slug, payload, file);
    },
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["studio-posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.slug] });
      queryClient.invalidateQueries({ queryKey: ["studio-post", post.slug] });
      navigate("/studio");
    },
    onError: (err) => {
      if (err instanceof ApiError) setFieldErrors(err.fieldErrors);
    },
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  function toggleTag(tagSlug) {
    setValues((current) => {
      const has = current.tag_slugs.includes(tagSlug);
      return {
        ...current,
        tag_slugs: has
          ? current.tag_slugs.filter((item) => item !== tagSlug)
          : [...current.tag_slugs, tagSlug],
      };
    });
  }

  if (!isNew && postQuery.isPending) return <Spinner />;
  if (!isNew && postQuery.isError) {
    return <ErrorMessage message={postQuery.error.message} />;
  }

  return (
    <div className="stack">
      <p>
        <Link to="/studio">← Studio</Link>
      </p>
      <h1>{isNew ? "New post" : "Edit post"}</h1>
      <ErrorMessage
        message={
          mutation.isError && Object.keys(fieldErrors).length === 0
            ? mutation.error.message
            : null
        }
      />

      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          setFieldErrors({});
          mutation.mutate();
        }}
      >
        <label className="field">
          Title
          <input name="title" value={values.title} onChange={handleChange} />
          {fieldErrors.title ? <span className="field-error">{fieldErrors.title}</span> : null}
        </label>
        <label className="field">
          Slug (optional)
          <input name="slug" value={values.slug} onChange={handleChange} />
          {fieldErrors.slug ? <span className="field-error">{fieldErrors.slug}</span> : null}
        </label>
        <label className="field">
          Excerpt
          <input name="excerpt" value={values.excerpt} onChange={handleChange} />
          {fieldErrors.excerpt ? (
            <span className="field-error">{fieldErrors.excerpt}</span>
          ) : null}
        </label>
        <label className="field">
          Body (Markdown)
          <textarea name="body" rows={16} value={values.body} onChange={handleChange} />
          {fieldErrors.body ? <span className="field-error">{fieldErrors.body}</span> : null}
        </label>
        <label className="field">
          Status
          <select name="status" value={values.status} onChange={handleChange}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
        <fieldset className="field">
          <legend>Tags</legend>
          <div className="tag-row">
            {(tagsQuery.data ?? []).map((tag) => (
              <label key={tag.slug} className="tag-check">
                <input
                  type="checkbox"
                  checked={values.tag_slugs.includes(tag.slug)}
                  onChange={() => toggleTag(tag.slug)}
                />
                {tag.name}
              </label>
            ))}
          </div>
          {fieldErrors.tag_slugs ? (
            <span className="field-error">{fieldErrors.tag_slugs}</span>
          ) : null}
        </fieldset>
        <label className="field">
          Cover image
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
          {postQuery.data?.cover_image && !file ? (
            <img className="cover" src={postQuery.data.cover_image} alt="" />
          ) : null}
        </label>
        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save"}
        </button>
      </form>
    </div>
  );
}
