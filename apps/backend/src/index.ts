import express from 'express';
import dotenv from 'dotenv';
import { AiKeyCarousel, AiKeyRecord } from './domain/ai-vault/AiKeyCarousel';
import { PromptStrategyEngine } from './domain/ai-vault/PromptStrategy';
import { publishQueue } from './infrastructure/scheduler/PublishQueue';

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configuración inicial de IA Bóveda
const initialKeys: AiKeyRecord[] = [
  { id: 'key_1', provider: 'OPENAI', apiKey: 'sk-fail...', priority: 1, isActive: true, isExhausted: false },
  { id: 'key_2', provider: 'OPENROUTER', apiKey: 'sk-or-good...', priority: 2, isActive: true, isExhausted: false }
];
const carousel = new AiKeyCarousel(initialKeys);
const aiEngine = new PromptStrategyEngine(carousel);

app.post('/api/generate-and-publish', async (req, res) => {
  try {
    const { seedIdea, targetCount, pageId } = req.body;
    
    // 1. Generar Variantes usando el Carrusel de IA (Resiliencia)
    const variants = await aiEngine.generateViralPosts(seedIdea, targetCount);
    
    // 2. Encolar para publicación (Resiliencia de Redes)
    for (const content of variants) {
      await publishQueue.add('publish-post', {
        platform: 'Facebook',
        payload: { content },
        credentials: { pageId }
      }, {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 }
      });
    }

    res.json({
      message: 'Posts generados y encolados con éxito',
      variantsGenerated: variants
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[SIAG] Backend inicializado en puerto ${PORT}`);
  console.log(`[SIAG] Motor de IA y Worker de BullMQ listos.`);
});
