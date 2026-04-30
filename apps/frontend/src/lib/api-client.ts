type ApiOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  headers?: Record<string, string>;
};

export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
}

function getDefaultHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const defaultEmail = process.env.NEXT_PUBLIC_DEFAULT_USER_EMAIL;
  const localUserEmail =
    typeof window !== "undefined" ? window.localStorage.getItem("siag-auth-user-email") : null;
  if (localUserEmail) {
    headers["x-user-email"] = localUserEmail;
  } else if (defaultEmail) {
    headers["x-user-email"] = defaultEmail;
  }

  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("siag-config-store");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { state?: { organizationId?: string } };
        const organizationId = parsed.state?.organizationId;
        if (organizationId) {
          headers["x-organization-id"] = organizationId;
        }
      } catch {
        // Ignore corrupted local storage and continue without contextual headers.
      }
    }
  }

  return headers;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...getDefaultHeaders(),
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { error?: string }).error || `Error HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body });
}
