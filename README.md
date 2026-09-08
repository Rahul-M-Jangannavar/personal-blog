# Personal blog — React + Django

My personal blog, whose front page is my introduction. Built as a learning project:
a Django REST Framework API serving JSON, and a separate React single-page app
consuming it.

This README is the **spec** — it describes what the finished site does, decided up front
so the later phases are mechanical.

The six-phase learning roadmap, with progress tracking, lives in a Cursor canvas. Open it
from Cursor with File → Open File:

```
C:\Users\rahulja\.cursor\projects\c-Users-rahulja-LearnRctAndPython\canvases\react-django-blog-path.canvas.tsx
```

## Stack

| Layer    | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Backend  | Python 3.12, Django 5, Django REST Framework                  |
| Auth     | JWT via `djangorestframework-simplejwt`                       |
| Database | SQLite in development, Postgres in production                 |
| Frontend | React 19 + Vite, React Router, TanStack Query                 |
| Styling  | Tailwind CSS                                                  |
| Hosting  | API on Render, frontend on Vercel                             |

## Pages

| Path         | Page                  | What it shows                                          |
| ------------ | --------------------- | ------------------------------------------------------ |
| `/`          | Home                  | Intro hero plus the three latest posts                 |
| `/about`     | About                 | Full bio, skills, links                                |
| `/blog`      | Post list             | Paginated posts with search and tag filters            |
| `/blog/:slug`| Post detail           | One post, its tags, and approved comments              |
| `/contact`   | Contact               | Form that emails me via the API                        |
| `/login`     | Login                 | JWT login, just for me                                 |
| `/studio`    | Post editor (private) | Write, edit, publish posts and upload cover images     |

## Features

- Read my introduction without any login or JavaScript-heavy interaction
- Browse posts, filter by tag, search by keyword
- Read a single post rendered from Markdown
- Leave a comment, held for my moderation before it appears
- Send me a message through a rate-limited contact form
- Write and publish posts from my own UI, not the Django admin
- Draft posts stay invisible to the public until published

## Data model

| Model            | Fields                                                             |
| ---------------- | ------------------------------------------------------------------ |
| `Profile`        | name, headline, bio, avatar, location, email, socials              |
| `Post`           | title, slug, excerpt, body, cover_image, status, published_at, tags|
| `Tag`            | name, slug                                                         |
| `Comment`        | post, author_name, email, body, approved, created_at               |
| `ContactMessage` | name, email, subject, message, created_at                          |

`Post.status` is `draft` or `published`. `Comment.approved` defaults to `False`.

## API

| Method           | Path                          | Auth   |
| ---------------- | ----------------------------- | ------ |
| `GET`            | `/api/profile/`               | Public |
| `GET`            | `/api/posts/`                 | Public |
| `GET`            | `/api/posts/{slug}/`          | Public |
| `POST`           | `/api/posts/`                 | JWT    |
| `PATCH` `DELETE` | `/api/posts/{slug}/`          | JWT    |
| `GET`            | `/api/tags/`                  | Public |
| `POST`           | `/api/posts/{slug}/comments/` | Public |
| `POST`           | `/api/contact/`               | Public |
| `POST`           | `/api/auth/token/`            | Public |
| `POST`           | `/api/auth/token/refresh/`    | Public |

`/api/posts/` supports `?page=`, `?search=` and `?tag=`.

## Repository layout

```
LearnRctAndPython/
├─ backend/     # Django project and apps
├─ frontend/    # Vite React app
└─ practice/    # Phase 0 language exercises, not part of the site
```

## Running locally

Not yet — the backend arrives in Phase 1 and the frontend in Phase 3. This section gets
filled in as each half exists.
