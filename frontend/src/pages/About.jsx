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
      <div className="skills-grid">
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" />
          <span>PostgreSQL</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="Python" />
          <span>Python</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" alt="Django" />
          <span>Django</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" />
          <span>React</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS" />
          <span>CSS</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" alt="HTML" />
          <span>HTML</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java" />
          <span>Java</span>
        </div>
        <div className="skill-item">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" />
          <span>JavaScript</span>
        </div>
      </div>

    </article>
  );
}
