import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

type WebhookPayload = {
  platform: string;
  eventType: string;
  postId?: string;
  platformPostId?: string;
  metrics?: {
    views?: number;
    clicks?: number;
    shares?: number;
  };
  raw?: unknown;
};

router.post("/social", async (req, res) => {
  try {
    const expectedSecret = process.env.WEBHOOK_SECRET;
    const receivedSecret = req.header("x-webhook-secret");
    if (expectedSecret && receivedSecret !== expectedSecret) {
      return res.status(401).json({ error: "Webhook no autorizado." });
    }

    const payload = req.body as WebhookPayload;
    if (!payload?.platform || !payload?.eventType) {
      return res.status(400).json({ error: "platform y eventType son obligatorios." });
    }

    let postId = payload.postId;
    if (!postId && payload.platformPostId) {
      const post = await prisma.post.findFirst({
        where: {
          platform: payload.platform,
          platformPostId: payload.platformPostId,
        },
        select: { id: true },
      });
      postId = post?.id;
    }

    await prisma.socialWebhookEvent.create({
      data: {
        platform: payload.platform,
        eventType: payload.eventType,
        externalId: payload.platformPostId || null,
        postId: postId || null,
        payload: JSON.stringify(payload.raw ?? payload),
      },
    });

    if (postId && payload.metrics) {
      await prisma.postMetric.create({
        data: {
          postId,
          platform: payload.platform,
          views: Math.max(0, Number(payload.metrics.views ?? 0)),
          clicks: Math.max(0, Number(payload.metrics.clicks ?? 0)),
          shares: Math.max(0, Number(payload.metrics.shares ?? 0)),
          source: "webhook",
        },
      });
    }

    return res.json({ success: true, linkedPost: !!postId });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Error procesando webhook." });
  }
});

export default router;
