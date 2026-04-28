import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { AiKeyCarousel } from './domain/ai-vault/AiKeyCarousel';
import { PromptStrategyEngine } from './domain/ai-vault/PromptStrategy';
import { publishQueue } from './infrastructure/scheduler/PublishQueue';
import { getQueueMetrics } from './infrastructure/scheduler/QueueMetrics';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/keys', async (req, res) => {
  try {
    const { provider, apiKey, organizationId } = req.body;
    let org = await prisma.organization.findUnique({ where: { id: organizationId } });
    
    if (!org) {
      org = await prisma.organization.create({ data: { id: organizationId, name: 'Default Org' } });
    }

    const newKey = await prisma.aiKey.create({
      data: { provider, apiKey, organizationId }
    });

    res.json({ success: true, keyId: newKey.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate-and-publish', async (req, res) => {
  try {
    const { seedIdea, targetCount, pageId, organizationId } = req.body;
    
    // Obtener keys de DB real
    const keys = await prisma.aiKey.findMany({ where: { organizationId, isActive: true } });
    if (keys.length === 0) {
      return res.status(400).json({ error: "No hay API keys activas para esta organización." });
    }

    const carousel = new AiKeyCarousel(keys.map(k => ({
      ...k,
      provider: k.provider as any
    })));
    const aiEngine = new PromptStrategyEngine(carousel);

    // 1. Generar Variantes
    const variants = await aiEngine.generateViralPosts(seedIdea, targetCount);
    
    // 2. Guardar en DB y Encolar para publicación
    for (const content of variants) {
      const post = await prisma.post.create({
        data: {
          content,
          organizationId,
          status: 'SCHEDULED'
        }
      });

      try {
        await publishQueue.add('publish-post', {
          platform: 'Facebook',
          payload: { content },
          credentials: { pageId },
          postId: post.id
        }, {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        });
      } catch (err) {
        console.error("Queue add error (ignoring for SQLite fallback):", err);
      }
    }

    res.json({
      message: 'Posts generados y programados con éxito',
      variantsGenerated: variants
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/queue-status', async (req, res) => {
  try {
    const status = await getQueueMetrics();
    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SIAG] Backend inicializado en puerto ${PORT}`);
});
