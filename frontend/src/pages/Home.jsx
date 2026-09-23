import { Link } from "react-router-dom";
import Markdown from "react-markdown";

import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { PostCard } from "../components/PostCard";
import { Spinner } from "../components/Spinner";
import { usePosts } from "../hooks/usePosts";
import { useProfile } from "../hooks/useProfile";

export function Home() {
  const { profile, status: profileStatus, error: profileError } = useProfile();
  const { posts, status: postsStatus, error: postsError } = usePosts({ pageSize: 3 });

  if (profileStatus === "loading" || postsStatus === "loading") {
    return <Spinner />;
  }

  if (profileError || postsError) {
    return <ErrorMessage message={profileError || postsError} />;
  }

  if (!profile) {
    return <EmptyState title="No profile yet" detail="Add one in Django admin." />;
  }

  return (
    <div className="stack">
      <section className="hero">
        {profile.avatar ? (
          <img className="avatar" src={profile.avatar} alt={profile.name} />
        ) : null}
        <h1>{profile.name}</h1>
        <div className="lede markdown">
          <Markdown>{profile.bio}</Markdown>
        </div>
      </section>
      <section className="stack">
        <h2>Latest posts</h2>
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" />
        ) : (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        )}
      </section>
    </div>
  );
}
