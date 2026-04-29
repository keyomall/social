export interface ProfileInput {
  id?: string | number;
  name: string;
  followers: string;
  engagement: string;
  reach: string;
  trend?: string;
}

interface NormalizedProfile {
  name: string;
  followers: number;
  engagementRate: number;
  reach: number;
  trend: number;
  score: number;
}

function toNumber(raw: string): number {
  const value = raw.trim().toUpperCase();

  if (value.endsWith("K")) {
    return Number.parseFloat(value.replace("K", "")) * 1000;
  }

  if (value.endsWith("M")) {
    return Number.parseFloat(value.replace("M", "")) * 1_000_000;
  }

  return Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
}

function toPercent(raw: string): number {
  return Number.parseFloat(raw.replace("%", "").trim());
}

function normalizeProfiles(profiles: ProfileInput[]): NormalizedProfile[] {
  return profiles.map((profile) => {
    const followers = toNumber(profile.followers);
    const engagementRate = toPercent(profile.engagement);
    const reach = toNumber(profile.reach);
    const trend = profile.trend ? toPercent(profile.trend) : 0;

    // Score simple para priorizar impacto potencial de contenido.
    const score =
      engagementRate * 0.55 +
      (reach / Math.max(followers, 1)) * 10 * 0.25 +
      trend * 0.2;

    return {
      name: profile.name,
      followers,
      engagementRate,
      reach,
      trend,
      score,
    };
  });
}

export function generateProfileRecommendation(profiles: ProfileInput[]): string {
  if (!profiles.length) {
    return "No hay perfiles suficientes para análisis.";
  }

  const normalized = normalizeProfiles(profiles).sort((a, b) => b.score - a.score);
  const winner = normalized[0];
  const lagger = normalized[normalized.length - 1];

  if (!winner || !lagger) {
    return "No hay perfiles suficientes para análisis.";
  }

  if (winner.name === lagger.name || normalized.length === 1) {
    return `Diagnóstico: ${winner.name} es el único perfil analizado. Mantén constancia y mide semanalmente engagement (${winner.engagementRate.toFixed(1)}%) y alcance (${Math.round(winner.reach).toLocaleString()}).`;
  }

  const scoreGap = winner.score - lagger.score;
  const budgetShift = scoreGap > 5 ? 35 : scoreGap > 2 ? 25 : 15;

  return `Diagnóstico estratégico: prioriza ${winner.name}, que lidera por rendimiento relativo (engagement ${winner.engagementRate.toFixed(1)}%, alcance ${Math.round(winner.reach).toLocaleString()}). Reduce exposición en ${lagger.name} y redistribuye ~${budgetShift}% del esfuerzo editorial hacia formatos que ya funcionan en ${winner.name}.`;
}
