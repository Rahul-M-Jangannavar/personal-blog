# Frontend

Vite + React. In development the app proxies `/api` and `/media` to Django
at `http://127.0.0.1:8000`, so run **both** servers.

```bash
# terminal 1
cd backend
.\.venv\Scripts\activate
python manage.py runserver

# terminal 2
cd frontend
npm install
npm run dev
```

Open http://localhost:5173/

| Path | Page |
| ---- | ---- |
| `/` | Home from `/api/profile/` + latest posts |
| `/about` | Bio and skills |
| `/blog` | Search, tag, `?page=` against the API |
| `/blog/:slug` | Markdown post + comment form |
| `/contact` | `POST /api/contact/` |
| `/login` | JWT |
| `/studio` | Create / edit / publish (protected) |

Copy `.env.example` to `.env` only if you need a non-proxied `VITE_API_URL`.
