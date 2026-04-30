import { test, expect, Page } from "@playwright/test";

async function mockBackendApi(page: Page) {
  await page.route("http://localhost:3001/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.endsWith("/health")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }
    if (url.includes("/api/queue-status")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          metrics: { waiting: 0, active: 0, completed: 3, failed: 0, delayed: 0 },
          limits: { safeDailyLimit: 50, availableNow: 47, status: "HEALTHY" },
        }),
      });
    }
    if (url.includes("/api/project-progress")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          report: {
            overallScore: 74,
            maturityLevel: "MVP avanzado",
            completedWeight: 20,
            totalWeight: 27,
            categories: [
              { id: "core", name: "Core Backend", score: 82, items: [] },
              { id: "quality", name: "Calidad y Testing", score: 63, items: [] },
            ],
            nextPriorities: ["Completar OAuth por plataforma"],
          },
        }),
      });
    }
    if (url.includes("/api/keys") && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, keyId: "k-1" }) });
    }
    if (url.includes("/api/keys") && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, keys: [] }) });
    }
    if (url.includes("/api/generate-and-publish") && method === "POST") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          variantsGenerated: ["Variante 1", "Variante 2", "Variante 3"],
          queueSummary: { queued: 3, failed: 0 },
        }),
      });
    }
    if (url.includes("/api/analytics")) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: [] }) });
    }
    if (url.includes("/api/analyze-profile")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ recommendation: "Buen perfil, mejora CTA." }),
      });
    }

    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
}

test("flujo E2E: login, onboarding, publish y dashboard", async ({ page }) => {
  await mockBackendApi(page);
  await page.goto("/");

  await expect(page.getByText("Acceso Seguro")).toBeVisible();
  await page.getByPlaceholder("admin@empresa.com").fill("admin@empresa.com");
  await page.getByPlaceholder("Contraseña").fill("Admin123!");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Configuración del Motor de IA")).toBeVisible();
  await page.getByPlaceholder("sk-or-v1-...").fill("sk-or-v1-e2e");
  await page.getByRole("button", { name: "Conectar y Autoconfigurar" }).click();
  await expect(page.getByText("Sistema Listo")).toBeVisible({ timeout: 7000 });
  await page.getByRole("button", { name: "Entrar al Dashboard Principal" }).click();

  await expect(page.getByRole("heading", { name: "Motor Generativo" })).toBeVisible();
  await page.getByPlaceholder("Ej: Lanzamiento del nuevo producto X...").fill("Lanzamiento del nuevo servicio");
  await page.getByRole("button", { name: "Generar Spintax (IA) y Encolar" }).click();

  await expect(page.getByText("Cola: 3 encolados, 0 fallidos.")).toBeVisible();
  await expect(page.getByText("Progreso del Proyecto")).toBeVisible();
});
