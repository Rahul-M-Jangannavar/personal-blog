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
| Hosting  | API and React static site on Render                           |

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

Backend:

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate          # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Then:

- Admin: http://127.0.0.1:8000/admin/ — add your Profile, Tags, and published Posts
- API docs: http://127.0.0.1:8000/api/docs/
- Login: `POST /api/auth/token/` with `{"username": "...", "password": "..."}`

Run tests with `python manage.py test`.

Frontend (Phase 4 — live API). Run Django first, then:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/. Vite proxies `/api` and `/media` to
`http://127.0.0.1:8000`. Log in with your superuser at `/login`, then write a
post at `/studio`.

## Deploy the API (Render)

The React app stays on localhost until the API has a public URL.

1. Push this repo to GitHub.
2. Sign up at https://dashboard.render.com and **New → Blueprint** (or Web Service).
3. Root directory: `backend`.
4. Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput`
5. Start: `gunicorn config.wsgi:application`
6. Add a **Postgres** database and copy its Internal Database URL into `DATABASE_URL`.
7. Env vars:
   - `DEBUG=False`
   - `SECRET_KEY` = a long random string (Render can generate it)
   - `PYTHON_VERSION=3.12.3`
8. After the first deploy, open `https://YOUR-SERVICE.onrender.com/api/docs/` and `/admin/`.
9. SSH is not available — use the Render shell, or `python manage.py createsuperuser` from a one-off job / the service shell.

Avatars and cover images on local disk will disappear when Render restarts. Cloudinary/S3 is a follow-up.

## Deploy the React app (Render static site)

The API and the SPA are separate hosts. Vite bakes `VITE_API_URL` in at build time.

1. Merge the latest `render.yaml` (or create **New → Static Site** from the dashboard).
2. Root directory: `frontend`.
3. Build: `npm ci && npm run build`
4. Publish directory: `dist`
5. Env var: `VITE_API_URL=https://personal-blog-oj84.onrender.com` (no trailing slash).
6. Redirects/Rewrites: source `/*`, destination `/index.html`, action **Rewrite** (so `/blog` and `/login` do not 404 on refresh).
7. After the first frontend URL exists, set `FRONTEND_ORIGIN=https://YOUR-STATIC-SITE.onrender.com` on the API service (optional once `*.onrender.com` CORS is in settings) and redeploy the API if you tightened CORS.
