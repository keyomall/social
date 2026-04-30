import express from "express";
import cors from "cors";
import path from "path";
import { AiKeyCarousel } from "./domain/ai-vault/AiKeyCarousel";
import { PromptStrategyEngine } from "./domain/ai-vault/PromptStrategy";
import { MediaAsset } from "./domain/adapters/ISocialAdapter";
import { adapterRegistry } from "./domain/adapters/adapterRegistry";
import { prisma } from "./lib/prisma";
import { publishDirectly } from "./services/publishing/directPublisher";
import { hasRequiredCredentials } from "./services/publishing/platformCredentials";
import {
  buildPublishDispatchPlan,
  normalizeCredentialAliases,
  normalizePlatformName,
} from "./services/publishing/publishPlanner";
import { generateProjectProgressReport } from "./services/diagnostics/projectProgress";
import { requestLogger } from "./middleware/requestLogger";
import { otelHttpTrace } from "./middleware/otelHttpTrace";
import { requireOrgAccess } from "./middleware/orgAccess";
import mediaRoutes from "./routes/media";
import analyticsRoutes from "./routes/analytics";
import profileRoutes from "./routes/profile";
import webhookRoutes from "./routes/webhooks";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(otelHttpTrace);
  app.use(requestLogger);
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "siag-backend" });
  });

  app.get("/api/project-progress", async (_req, res) => {
    try {
      let redisOperational = false;
      if (process.env.NODE_ENV !== "test") {
        try {
          const { getQueueMetrics } = await import("./infrastructure/scheduler/QueueMetrics");
          await getQueueMetrics();
          redisOperational = true;
        } catch {
          redisOperational = false;
        }
      }

      const report = generateProjectProgressReport({ redisOperational });
      return res.json({ success: true, report });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error generando progreso del proyecto." });
    }
  });

  app.use("/api/media", mediaRoutes);
  app.use("/api/analytics", requireOrgAccess(), analyticsRoutes);
  app.use("/api/webhooks", webhookRoutes);
  app.use("/api", profileRoutes);

  app.post("/api/social/validate-credentials", requireOrgAccess(["OWNER", "ADMIN"]), async (req, res) => {
    try {
      const { platform, credentials } = req.body as {
        platform?: string;
        credentials?: Record<string, unknown>;
      };

      if (!platform || !credentials || typeof credentials !== "object") {
        return res.status(400).json({ error: "platform y credentials son obligatorios." });
      }

      const normalizedPlatform = normalizePlatformName(platform);
      if (!normalizedPlatform) {
        return res.status(400).json({ error: "Plataforma no soportada." });
      }

      const normalizedCredentials = normalizeCredentialAliases(normalizedPlatform, credentials);
      if (!hasRequiredCredentials(normalizedPlatform, normalizedCredentials)) {
        return res.status(400).json({ error: "Faltan campos mínimos de credenciales para la plataforma." });
      }

      const adapter = adapterRegistry[normalizedPlatform];
      const isValid = await adapter.validateCredentials(normalizedCredentials);
      return res.json({ success: true, valid: isValid, platform: normalizedPlatform });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error validando credenciales." });
    }
  });

  app.get("/api/keys", requireOrgAccess(["OWNER", "ADMIN"]), async (req, res) => {
    try {
      const organizationId =
        (typeof req.query.organizationId === "string" ? req.query.organizationId : undefined) ||
        req.header("x-organization-id");

      if (!organizationId) {
        return res.status(400).json({ error: "organizationId es obligatorio." });
      }

      const keys = await prisma.aiKey.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          provider: true,
          isActive: true,
          createdAt: true,
          apiKey: true,
        },
      });

      return res.json({
        success: true,
        keys: keys.map((key: { id: string; provider: string; isActive: boolean; createdAt: Date; apiKey: string }) => ({
          id: key.id,
          provider: key.provider,
          isActive: key.isActive,
          createdAt: key.createdAt,
          maskedKey: key.apiKey.length > 6 ? `${key.apiKey.slice(0, 4)}***${key.apiKey.slice(-2)}` : "***",
        })),
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || "Error consultando API keys." });
    }
  });

  app.post("/api/keys", requireOrgAccess(["OWNER", "ADMIN"]), async (req, res) => {
    try {
      const { provider, apiKey, organizationId } = req.body;
      if (!provider || !apiKey || !organizationId) {
        return res.status(400).json({ error: "provider, apiKey y organizationId son obligatorios" });
      }
      const normalizedProvider = String(provider).toUpperCase();
      const allowedProviders = ["OPENROUTER", "DEEPSEEK", "OPENAI", "ANTHROPIC"];
      if (!allowedProviders.includes(normalizedProvider)) {
        return res.status(400).json({ error: "Proveedor no soportado." });
      }

      let org = await prisma.organization.findUnique({ where: { id: organizationId } });

      if (!org) {
        org = await prisma.organization.create({ data: { id: organizationId, name: "Default Org" } });
      }

      const preflightCarousel = new AiKeyCarousel([
        {
          id: "preflight",
          provider: normalizedProvider as "OPENROUTER" | "DEEPSEEK" | "OPENAI" | "ANTHROPIC",
          apiKey,
          priority: 1,
          isActive: true,
          isExhausted: false,
        },
      ]);
      const isValid = await preflightCarousel.preFlightCheck({
        id: "preflight",
        provider: normalizedProvider as "OPENROUTER" | "DEEPSEEK" | "OPENAI" | "ANTHROPIC",
        apiKey,
        priority: 1,
        isActive: true,
        isExhausted: false,
      });
      if (!isValid) {
        return res.status(400).json({ error: "La API key no superó la validación con el proveedor." });
      }

      const newKey = await prisma.aiKey.create({
        data: { provider: normalizedProvider, apiKey, organizationId },
      });

      res.json({ success: true, keyId: newKey.id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/generate-and-publish", requireOrgAccess(["OWNER", "ADMIN", "MEMBER"]), async (req, res) => {
    try {
      const {
        seedIdea,
        targetCount,
        pageId,
        organizationId,
        targetPlatforms,
        strategy,
        customPrompt,
        mediaAssets,
        socialCredentials,
      } = req.body;
      const parsedMediaAssets: MediaAsset[] = Array.isArray(mediaAssets) ? mediaAssets : [];

      if (!organizationId || !seedIdea) {
        return res.status(400).json({ error: "organizationId y seedIdea son obligatorios." });
      }

      let org = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (!org) {
        org = await prisma.organization.create({ data: { id: organizationId, name: "Default Org" } });
      }

      let keys: any[] = [];
      if (strategy !== "manual") {
        keys = await prisma.aiKey.findMany({ where: { organizationId, isActive: true } });
        if (keys.length === 0) {
          return res.status(400).json({ error: "No hay API keys activas para esta organización." });
        }
      }

      const carousel = new AiKeyCarousel(
        keys.map((k) => ({
          ...k,
          provider: k.provider as any,
        })),
      );
      const aiEngine = new PromptStrategyEngine(carousel);

      const variants = await aiEngine.generateViralPosts(seedIdea, targetCount, strategy, customPrompt);
      const dispatchPlan = buildPublishDispatchPlan({
        variants,
        targetPlatforms,
        socialCredentials,
        pageId,
        mediaAssets: parsedMediaAssets,
      });

      if (dispatchPlan.dispatches.length === 0) {
        return res.status(400).json({
          error: "No hay despachos válidos para publicar. Revisa plataformas, credenciales y media.",
          rejectedPlatforms: dispatchPlan.rejectedPlatforms,
        });
      }

      let queued = 0;
      let failed = 0;

      for (const rejected of dispatchPlan.rejectedPlatforms) {
        for (const content of variants) {
          await prisma.post.create({
            data: {
              content,
              organizationId,
              platform: rejected.platform,
              mediaUrls: JSON.stringify(parsedMediaAssets),
              status: "FAILED",
              lastError: rejected.reason,
            },
          });
          failed += 1;
        }
      }

      for (const dispatch of dispatchPlan.dispatches) {
        const post = await prisma.post.create({
          data: {
            content: dispatch.content,
            organizationId,
            platform: dispatch.platform,
            mediaUrls: JSON.stringify(parsedMediaAssets),
            status: "SCHEDULED",
          },
        });
        try {
          const jobData = {
            platform: dispatch.platform,
            payload: { content: dispatch.content, mediaAssets: parsedMediaAssets },
            credentials: dispatch.credentials,
            postId: post.id,
          };
          if (process.env.NODE_ENV === "test") {
            const fallback = await publishDirectly({
              platform: dispatch.platform,
              payload: { content: dispatch.content, mediaAssets: parsedMediaAssets },
              credentials: dispatch.credentials,
              postId: post.id,
            });
            if (fallback.success) {
              queued += 1;
            } else {
              failed += 1;
            }
          } else {
            const { publishQueue } = await import("./infrastructure/scheduler/PublishQueue");
            await publishQueue.add("publish-post", jobData, {
              attempts: 3,
              backoff: { type: "exponential", delay: 2000 },
            });
            queued += 1;
          }
        } catch (_err) {
          const fallback = await publishDirectly({
            platform: dispatch.platform,
            payload: { content: dispatch.content, mediaAssets: parsedMediaAssets },
            credentials: dispatch.credentials,
            postId: post.id,
          });
          if (fallback.success) {
            queued += 1;
          } else {
            failed += 1;
          }
        }
      }

      return res.json({
        message: "Posts generados y programados con éxito",
        variantsGenerated: variants,
        planning: {
          acceptedPlatforms: dispatchPlan.acceptedPlatforms,
          rejectedPlatforms: dispatchPlan.rejectedPlatforms,
        },
        queueSummary: { queued, failed },
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/queue-status", async (_req, res) => {
    try {
      const { getQueueMetrics } = await import("./infrastructure/scheduler/QueueMetrics");
      const status = await getQueueMetrics();
      return res.json(status);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return app;
}
