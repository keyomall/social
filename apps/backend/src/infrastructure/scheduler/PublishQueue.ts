import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { FacebookAdapter } from '../../domain/adapters/FacebookAdapter';
import { LinkedInAdapter } from '../../domain/adapters/LinkedInAdapter';
import { TwitterAdapter } from '../../domain/adapters/TwitterAdapter';
import { InstagramAdapter } from '../../domain/adapters/InstagramAdapter';
import { TikTokAdapter } from '../../domain/adapters/TikTokAdapter';
import { WhatsAppAdapter } from '../../domain/adapters/WhatsAppAdapter';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const publishQueue = new Queue('social-publishing', { connection });

const adapters = {
  'Facebook': new FacebookAdapter(),
  'LinkedIn': new LinkedInAdapter(),
  'Twitter': new TwitterAdapter(),
  'Instagram': new InstagramAdapter(),
  'TikTok': new TikTokAdapter(),
  'WhatsApp': new WhatsAppAdapter()
};

/**
 * SMART QUEUE ENGINE (Traffic Shaping & Rate Limiting)
 * Utiliza los limitadores de BullMQ Pro o una lógica nativa basada en "Group Rate Limiting"
 * para evitar el "Shadowban" de las plataformas limitando a X posts por cuenta/plataforma.
 */
export const publishWorker = new Worker('social-publishing', async (job: Job) => {
  console.log(`[SmartQueue] Procesando job ${job.id} de tipo ${job.name} para cuenta ${job.data.credentials.pageId}`);
  
  const { platform, payload, credentials } = job.data;

  // SIMULACIÓN DE WARM-UP / SLEEP (Enfriamiento inteligente por cuenta)
  // Agregamos pausas orgánicas (jitter) entre publicaciones para simular comportamiento humano (2-5s extra)
  const jitter = Math.floor(Math.random() * 3000) + 2000;
  await new Promise(r => setTimeout(r, jitter));

  const adapter = adapters[platform as keyof typeof adapters];
  
  if (!adapter) {
    throw new Error(`Plataforma ${platform} no soportada aún.`);
  }

  const result = await adapter.publish(payload, credentials);
  if (!result.success) {
    if (result.retryable) {
      // En BullMQ un throw Error hace que se active el Backoff Exponencial
      throw new Error(`Platform Rate Limit hit or Network Error. Retrying. Details: ${result.error}`);
    } else {
      console.error(`[SmartQueue] Fallo fatal no reintentable (Ej: Token Inválido): ${result.error}`);
      return result; 
    }
  }
  
  console.log(`[SmartQueue] Publicado con éxito en ${platform}. ID: ${result.platformId}`);
  return result;
}, { 
  connection,
  limiter: {
    max: 2,           // Máximo 2 publicaciones...
    duration: 60000,  // ...por minuto (Global throttling). En un sistema maduro se usa `group` limits por cada AccountId.
  }
});

publishWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[SmartQueue] Job ${job?.id} falló y será reencolado (Backoff): ${err.message}`);
});
