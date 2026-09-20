/**
 * In development the Vite proxy makes /api and /media same-origin, so we
 * leave this empty. In production set VITE_API_URL to the deployed API host.
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "";
