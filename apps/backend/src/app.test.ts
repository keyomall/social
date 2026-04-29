import test from "node:test";
import assert from "node:assert/strict";
import { AddressInfo } from "node:net";
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
