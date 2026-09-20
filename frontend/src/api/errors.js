/** DRF returns either {detail: "..."} or {field: ["msg", ...]}. */

export class ApiError extends Error {
  constructor(status, body) {
    const detail = extractDetail(body);
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.body = body ?? {};
    this.fieldErrors = extractFields(body);
  }
}

function extractDetail(body) {
  if (!body || typeof body !== "object") return "Request failed.";
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.non_field_errors)) return body.non_field_errors.join(" ");
  return "Request failed.";
}

function extractFields(body) {
  if (!body || typeof body !== "object") return {};
  const fields = {};
  for (const [key, value] of Object.entries(body)) {
    if (key === "detail" || key === "non_field_errors") continue;
    if (Array.isArray(value)) fields[key] = value.join(" ");
    else if (typeof value === "string") fields[key] = value;
  }
  return fields;
}
