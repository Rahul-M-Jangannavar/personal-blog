import { api } from "./client";

export function fetchProfile() {
  return api("/api/profile/", { auth: false });
}

export function fetchPosts({ page = 1, search = "", tag = "", pageSize = 10 } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("page_size", String(pageSize));
  if (search) params.set("search", search);
  if (tag) params.set("tag", tag);
  return api(`/api/posts/?${params.toString()}`, { auth: false });
}

export function fetchPost(slug) {
  return api(`/api/posts/${slug}/`, { auth: false });
}

export function fetchStudioPosts() {
  return api("/api/posts/?page_size=50");
}

export function fetchStudioPost(slug) {
  return api(`/api/posts/${slug}/`);
}

export async function fetchTags() {
  const data = await api("/api/tags/", { auth: false });
  return Array.isArray(data) ? data : (data.results ?? []);
}

export function createComment(slug, payload) {
  return api(`/api/posts/${slug}/comments/`, {
    method: "POST",
    json: payload,
    auth: false,
  });
}

export function sendContact(payload) {
  return api("/api/contact/", { method: "POST", json: payload, auth: false });
}

function toFormData(fields, file) {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (key === "tag_slugs") {
      value.forEach((slug) => data.append("tag_slugs", slug));
      continue;
    }
    if (value !== undefined && value !== null) data.append(key, value);
  }
  if (file) data.append("cover_image", file);
  return data;
}

export function createPost(fields, file) {
  if (file) {
    return api("/api/posts/", { method: "POST", formData: toFormData(fields, file) });
  }
  return api("/api/posts/", { method: "POST", json: fields });
}

export function updatePost(slug, fields, file) {
  if (file) {
    return api(`/api/posts/${slug}/`, {
      method: "PATCH",
      formData: toFormData(fields, file),
    });
  }
  return api(`/api/posts/${slug}/`, { method: "PATCH", json: fields });
}

export function deletePost(slug) {
  return api(`/api/posts/${slug}/`, { method: "DELETE" });
}
