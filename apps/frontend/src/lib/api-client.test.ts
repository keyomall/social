import { describe, it, expect, vi, afterEach } from "vitest";
import { apiGet, getApiBaseUrl, apiRequest } from "./api-client";

describe("api-client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("usa localhost por defecto", () => {
    expect(getApiBaseUrl()).toBe("http://localhost:3001");
  });

  it("lanza error de backend si response no es ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: "invalid request" }),
      }),
    );

    await expect(apiGet("/api/test")).rejects.toThrow("invalid request");
  });

  it("inyecta x-organization-id desde store persistido", async () => {
    window.localStorage.setItem(
      "siag-config-store",
      JSON.stringify({ state: { organizationId: "org-test-headers" } }),
    );

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/ping");
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers["x-organization-id"]).toBe("org-test-headers");
  });
});
