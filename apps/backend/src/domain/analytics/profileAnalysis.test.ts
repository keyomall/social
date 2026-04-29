import test from "node:test";
import assert from "node:assert/strict";
import { generateProfileRecommendation } from "./profileAnalysis";

test("generateProfileRecommendation devuelve texto base si no hay perfiles", () => {
  const result = generateProfileRecommendation([]);
  assert.match(result, /No hay perfiles suficientes/i);
});

test("generateProfileRecommendation prioriza perfil con mejor score", () => {
  const result = generateProfileRecommendation([
    { name: "Facebook", followers: "120K", engagement: "3.2%", reach: "500K", trend: "+2%" },
    { name: "LinkedIn", followers: "15K", engagement: "8.1%", reach: "300K", trend: "+25%" },
  ]);

  assert.match(result, /LinkedIn/i);
  assert.match(result, /Diagnóstico estratégico/i);
});
