import test from "node:test";
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
import { prisma } from "./lib/prisma";
import { createApp } from "./app";

test("GET /health responde ok", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.ok, true);
  } finally {
    server.close();
  }
});

test("POST /api/analyze-profile responde recomendación", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/analyze-profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profiles: [
          { name: "Perfil A", followers: "10K", engagement: "2%", reach: "80K", trend: "+1%" },
          { name: "Perfil B", followers: "5K", engagement: "7%", reach: "60K", trend: "+15%" },
        ],
      }),
    });

    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.match(data.recommendation, /Diagnóstico/i);
  } finally {
    server.close();
  }
});

test("GET /api/project-progress responde reporte con score", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/project-progress`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.ok(typeof data.report.overallScore === "number");
    assert.ok(Array.isArray(data.report.categories));
    assert.ok(data.report.categories.length > 0);
  } finally {
    server.close();
  }
});

test("POST /api/webhooks/social almacena evento", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/webhooks/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: "Facebook",
        eventType: "post.insight",
        platformPostId: "fb_123",
        metrics: { views: 10, clicks: 2, shares: 1 },
      }),
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
  } finally {
    server.close();
  }
});

test("POST /api/social/validate-credentials valida payload de plataforma", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/social/validate-credentials`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: "org-test-social",
        platform: "LinkedIn",
        credentials: { linkedInId: "urn:li:organization:1234" },
      }),
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.equal(data.valid, true);
  } finally {
    server.close();
  }
});

test("POST /api/generate-and-publish completa flujo manual con fallback", async () => {
  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/generate-and-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: "org-test-publish",
        seedIdea: "Post de prueba e2e",
        strategy: "manual",
        targetCount: 1,
        targetPlatforms: ["LinkedIn"],
        socialCredentials: {
          LinkedIn: { linkedInId: "urn:li:organization:9999" },
        },
      }),
    });
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(data.variantsGenerated));
    assert.ok(data.queueSummary.queued >= 1 || data.queueSummary.failed >= 1);
  } finally {
    server.close();
  }
});

test("GET /api/keys devuelve lista enmascarada por organización", async () => {
  const orgId = "org-keys-list-1";
  await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: { id: orgId, name: "Org Keys List" },
  });

  await prisma.aiKey.create({
    data: {
      provider: "OPENROUTER",
      apiKey: "sk-or-v1-abcdef123456",
      organizationId: orgId,
    },
  });

  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/keys?organizationId=${orgId}`);
    const data = await response.json();
    assert.equal(response.status, 200);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.keys));
    assert.ok(data.keys.length >= 1);
    assert.ok(typeof data.keys[0].maskedKey === "string");
    assert.ok(!data.keys[0].maskedKey.includes("abcdef123456"));
  } finally {
    server.close();
  }
});

test("RBAC estricto bloquea sin x-user-email y permite con membresía", async () => {
  process.env.ENFORCE_RBAC = "true";
  const orgId = "org-rbac-1";
  const email = "rbac-admin@siag.local";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "RBAC Admin",
      role: "ADMIN",
      hashedPassword: "hash-not-used-in-this-test",
    },
  });

  await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: { id: orgId, name: "Org RBAC" },
  });

  await prisma.organizationUser.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: orgId,
      },
    },
    update: { role: "OWNER" },
    create: {
      userId: user.id,
      organizationId: orgId,
      role: "OWNER",
    },
  });

  const app = createApp();
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;

  try {
    const blocked = await fetch(`http://127.0.0.1:${port}/api/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "OPENROUTER",
        apiKey: "sk-test",
        organizationId: orgId,
      }),
    });
    assert.equal(blocked.status, 401);

    const allowed = await fetch(`http://127.0.0.1:${port}/api/keys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": email,
      },
      body: JSON.stringify({
        provider: "OPENROUTER",
        apiKey: "sk-test-2",
        organizationId: orgId,
      }),
    });
    // Con RBAC aprobado, este caso cae en validación de preflight de API key (esperado 400 en test).
    assert.equal(allowed.status, 400);
  } finally {
    process.env.ENFORCE_RBAC = "false";
    server.close();
  }
});
