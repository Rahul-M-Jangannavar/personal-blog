import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Same-origin in dev: the browser talks only to :5173. Vite forwards /api
// and /media to Django. CORS still exists for a production split-host deploy.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000",
      "/media": "http://127.0.0.1:8000",
    },
  },
});
