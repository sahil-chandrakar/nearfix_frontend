import { env } from "@/config/env";

export function apiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  if (path.startsWith("/api/v1")) {
    const origin = env.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
    return `${origin}${path}`;
  }

  return `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
