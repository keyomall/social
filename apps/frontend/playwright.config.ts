import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    cwd: __dirname,
    url: "http://127.0.0.1:3100",
    timeout: 120000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: "file:../backend/prisma/dev.db",
      NEXTAUTH_SECRET: "siag-local-secret",
      NEXTAUTH_URL: "http://127.0.0.1:3100",
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:3001",
      NEXT_PUBLIC_DEFAULT_USER_EMAIL: "admin@empresa.com",
      NEXT_PUBLIC_E2E_AUTH_BYPASS: "true",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
