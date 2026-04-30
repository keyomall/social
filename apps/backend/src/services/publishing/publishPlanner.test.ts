import test from "node:test";
import assert from "node:assert/strict";
import { buildPublishDispatchPlan, normalizePlatformName } from "./publishPlanner";

test("normalizePlatformName normaliza case-insensitive", () => {
  assert.equal(normalizePlatformName("linkedin"), "LinkedIn");
  assert.equal(normalizePlatformName("  TIKTOK "), "TikTok");
  assert.equal(normalizePlatformName("desconocida"), null);
});

test("buildPublishDispatchPlan rechaza plataformas inválidas e incompatibles y deduplica", () => {
  const plan = buildPublishDispatchPlan({
    variants: ["Post A", "Post B"],
    targetPlatforms: ["linkedin", "TikTok", "desconocida", "tiktok"],
    socialCredentials: {
      LinkedIn: { linkedInId: "urn:li:organization:1" },
      TikTok: { accessToken: "tok-tk" },
    },
    mediaAssets: [],
  });

  assert.deepEqual(plan.acceptedPlatforms, ["LinkedIn"]);
  assert.equal(plan.dispatches.length, 2);
  assert.equal(plan.rejectedPlatforms.length, 2);
  assert.ok(plan.rejectedPlatforms.some((item) => item.platform === "TikTok"));
  assert.ok(plan.rejectedPlatforms.some((item) => item.platform === "desconocida"));
});

test("buildPublishDispatchPlan aplica alias de credenciales para Instagram", () => {
  const plan = buildPublishDispatchPlan({
    variants: ["Post único"],
    targetPlatforms: ["instagram"],
    socialCredentials: {
      instagram: { accountId: "ig_123", accessToken: "ig_tok" },
    },
    mediaAssets: [{ url: "https://cdn.example.com/asset.jpg", type: "image" }],
  });

  assert.equal(plan.dispatches.length, 1);
  assert.equal(plan.dispatches[0].platform, "Instagram");
  assert.equal(plan.dispatches[0].credentials.igAccountId, "ig_123");
  assert.equal(plan.rejectedPlatforms.length, 0);
});
