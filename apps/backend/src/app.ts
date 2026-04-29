import express from "express";
import cors from "cors";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { AiKeyCarousel } from "./domain/ai-vault/AiKeyCarousel";
import { PromptStrategyEngine } from "./domain/ai-vault/PromptStrategy";
import { MediaAsset } from "./domain/adapters/ISocialAdapter";
import mediaRoutes from "./routes/media";
import analyticsRoutes from "./routes/analytics";
import profileRoutes from "./routes/profile";

const prisma = new PrismaClient();

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "siag-backend" });
  });

  app.use("/api/media", mediaRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api", profileRoutes);

  app.post("/api/keys", async (req, res) => {
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

  app.post("/api/generate-and-publish", async (req, res) => {
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
      const platformsToQueue = Array.isArray(targetPlatforms) && targetPlatforms.length > 0 ? targetPlatforms : ["Facebook"];
      let queued = 0;
      let failed = 0;

      for (const content of variants) {
        for (const platform of platformsToQueue) {
          const post = await prisma.post.create({
            data: {
              content,
              organizationId,
              platform: String(platform),
              mediaUrls: JSON.stringify(parsedMediaAssets),
              status: "SCHEDULED",
            },
          });
          try {
            const { publishQueue } = await import("./infrastructure/scheduler/PublishQueue");
            const credentialsByPlatform =
              socialCredentials && typeof socialCredentials === "object"
                ? (socialCredentials[String(platform)] as Record<string, unknown> | undefined)
                : undefined;
            await publishQueue.add(
              "publish-post",
              {
                platform,
                payload: { content, mediaAssets: parsedMediaAssets },
                credentials: credentialsByPlatform || { pageId },
                postId: post.id,
              },
              {
                attempts: 3,
                backoff: { type: "exponential", delay: 2000 },
              },
            );
            queued += 1;
          } catch (err) {
            console.error(`Queue add error for ${platform} (ignoring for SQLite fallback):`, err);
            await prisma.post.update({
              where: { id: post.id },
              data: {
                status: "FAILED",
                lastError: "No se pudo encolar la publicación (Redis/cola no disponible).",
              },
            });
            failed += 1;
          }
        }
      }

      return res.json({
        message: "Posts generados y programados con éxito",
        variantsGenerated: variants,
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
