import Markdown from "react-markdown";

import { EmptyState } from "../components/EmptyState";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";
import { useProfile } from "../hooks/useProfile";

export function About() {
  const { profile, status, error } = useProfile();

  if (status === "loading") return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!profile) {
    return <EmptyState title="No profile yet" />;
  }

  return (
    <article className="stack">
      <h1>Hello, I'm Rahul</h1>
      <div className="markdown">
        <Markdown>{profile.about}</Markdown>
      </div>
      {/* {profile.location ? <p className="muted">{profile.location}</p> : null} */}

      <h2>Skills</h2>
      <p className="tag-row">
        {(profile.skills_list ?? []).map((skill) => (
          <span key={skill} className="tag">
            {skill}
          </span>
        ))}
      </p>

      <h2>Links</h2>
      <ul className="plain-list">
        <li>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </li>
        {profile.github_url ? (
          <li>
            <a href={profile.github_url}>{profile.github_url}</a>
          </li>
        ) : null}
        {profile.linkedin_url ? (
          <li>
            <a href={profile.linkedin_url}>{profile.linkedin_url}</a>
          </li>
        ) : null}
        {profile.website_url ? (
          <li>
            <a href={profile.website_url}>{profile.website_url}</a>
          </li>
        ) : null}
      </ul>
    </article>
  );
}
