import { Link } from "react-router-dom";

export function PostCard({ post }) {
  const published = new Date(post.published_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <article className="card">
      {post.cover_image ? (
        <img className="cover" src={post.cover_image} alt="" />
      ) : null}
      <p className="muted">
        {post.published_at ? `${published} · ` : "Draft · "}
        {post.reading_time_minutes} min read
      </p>
      <h2>
        <Link to={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      <p>{post.excerpt}</p>
      <p className="tag-row">
        {post.tags.map((tag) => (
          <span key={tag.slug} className="tag">
            {tag.name}
          </span>
        ))}
      </p>
    </article>
  );
}
