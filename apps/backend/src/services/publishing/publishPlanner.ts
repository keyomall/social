import { MediaAsset } from "../../domain/adapters/ISocialAdapter";
import { adapterRegistry } from "../../domain/adapters/adapterRegistry";
import { hasRequiredCredentials } from "./platformCredentials";

export type PlatformRejection = {
  platform: string;
  reason: string;
};

export type PublishDispatchTask = {
  platform: string;
  content: string;
  credentials: Record<string, unknown>;
};

export type PublishDispatchPlan = {
  dispatches: PublishDispatchTask[];
  rejectedPlatforms: PlatformRejection[];
  acceptedPlatforms: string[];
};

const platformPriority: Record<string, number> = {
  LinkedIn: 100,
  Facebook: 95,
  Instagram: 90,
  Twitter: 85,
  TikTok: 80,
  WhatsApp: 75,
};

export function normalizePlatformName(rawPlatform: string): string | null {
  const candidate = rawPlatform.trim().toLowerCase();
  if (!candidate) return null;

  const exact = Object.keys(adapterRegistry).find((platform) => platform.toLowerCase() === candidate);
  return exact ?? null;
}

export function normalizeCredentialAliases(platform: string, credentials: Record<string, unknown>): Record<string, unknown> {
  const normalized = { ...credentials };

  if (platform === "Instagram") {
    if (typeof normalized.igAccountId !== "string") {
      const alias = normalized.accountId ?? normalized.instagramAccountId;
      if (typeof alias === "string" && alias.trim().length > 0) {
        normalized.igAccountId = alias;
      }
    }
  }

  if (platform === "LinkedIn" && typeof normalized.linkedInId !== "string") {
    const alias = normalized.organizationUrn ?? normalized.companyUrn;
    if (typeof alias === "string" && alias.trim().length > 0) {
      normalized.linkedInId = alias;
    }
  }

  return normalized;
}

function isMediaCompatible(platform: string, mediaAssets: MediaAsset[]): { ok: boolean; reason?: string } {
  if (platform === "Instagram" && mediaAssets.length === 0) {
    return { ok: false, reason: "Instagram requiere al menos un asset multimedia." };
  }
  if (platform === "TikTok" && !mediaAssets.some((asset) => asset.type === "video")) {
    return { ok: false, reason: "TikTok requiere al menos un video en mediaAssets." };
  }
  return { ok: true };
}

function resolveCredentials(
  platform: string,
  socialCredentials: Record<string, unknown> | undefined,
  pageId: string | undefined,
): Record<string, unknown> {
  if (!socialCredentials || typeof socialCredentials !== "object") {
    return pageId ? { pageId } : {};
  }

  const byExact = socialCredentials[platform];
  const byLower = socialCredentials[platform.toLowerCase()];
  const credentials = (byExact ?? byLower) as Record<string, unknown> | undefined;
  return credentials ? { ...credentials } : pageId ? { pageId } : {};
}

export function buildPublishDispatchPlan(params: {
  variants: string[];
  targetPlatforms?: string[];
  socialCredentials?: Record<string, unknown>;
  pageId?: string;
  mediaAssets: MediaAsset[];
}): PublishDispatchPlan {
  const rawTargets =
    Array.isArray(params.targetPlatforms) && params.targetPlatforms.length > 0 ? params.targetPlatforms : ["Facebook"];

  const seen = new Set<string>();
  const accepted: Array<{ platform: string; credentials: Record<string, unknown>; priority: number }> = [];
  const rejectedPlatforms: PlatformRejection[] = [];

  for (const rawPlatform of rawTargets) {
    const normalizedPlatform = normalizePlatformName(String(rawPlatform ?? ""));
    if (!normalizedPlatform) {
      rejectedPlatforms.push({ platform: String(rawPlatform), reason: "Plataforma no soportada." });
      continue;
    }
    if (seen.has(normalizedPlatform)) {
      continue;
    }
    seen.add(normalizedPlatform);

    const baseCredentials = resolveCredentials(normalizedPlatform, params.socialCredentials, params.pageId);
    const credentials = normalizeCredentialAliases(normalizedPlatform, baseCredentials);
    if (!hasRequiredCredentials(normalizedPlatform, credentials)) {
      rejectedPlatforms.push({
        platform: normalizedPlatform,
        reason: `Faltan credenciales requeridas para ${normalizedPlatform}.`,
      });
      continue;
    }

    const compatibility = isMediaCompatible(normalizedPlatform, params.mediaAssets);
    if (!compatibility.ok) {
      rejectedPlatforms.push({
        platform: normalizedPlatform,
        reason: compatibility.reason || "Contenido incompatible con la plataforma.",
      });
      continue;
    }

    accepted.push({
      platform: normalizedPlatform,
      credentials,
      priority: platformPriority[normalizedPlatform] ?? 50,
    });
  }

  accepted.sort((a, b) => b.priority - a.priority);

  const dispatches: PublishDispatchTask[] = [];
  for (const content of params.variants) {
    for (const platformConfig of accepted) {
      dispatches.push({
        platform: platformConfig.platform,
        content,
        credentials: platformConfig.credentials,
      });
    }
  }

  return {
    dispatches,
    rejectedPlatforms,
    acceptedPlatforms: accepted.map((item) => item.platform),
  };
}
