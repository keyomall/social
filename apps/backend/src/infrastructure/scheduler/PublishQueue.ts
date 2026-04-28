import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { FacebookAdapter } from '../../domain/adapters/FacebookAdapter';

const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
});

export const publishQueue = new Queue('social-publishing', { connection });

// Instanciar adaptadores
const fbAdapter = new FacebookAdapter();

export const publishWorker = new Worker('social-publishing', async (job: Job) => {
  console.log(`[Worker] Procesando job ${job.id} de tipo ${job.name}`);
  
  const { platform, payload, credentials } = job.data;

  if (platform === 'Facebook') {
    const result = await fbAdapter.publish(payload, credentials);
    if (!result.success) {
      if (result.retryable) {
        throw new Error(result.error); // Provoca que BullMQ reintente
      } else {
        console.error(`[Worker] Fallo no reintentable: ${result.error}`);
        return result; // Termina el job pero lo marca como completado o manejado
      }
    }
    console.log(`[Worker] Éxito: Publicado con ID ${result.platformId}`);
    return result;
  }

  throw new Error(`Platform ${platform} not supported yet`);
}, { 
  connection,
  limiter: {
    max: 5, // Rate limit: max 5 jobs
    duration: 1000 // por segundo (global por worker)
  }
});

publishWorker.on('failed', (job: Job | undefined, err: Error) => {
  console.error(`[Worker] Job ${job?.id} falló por: ${err.message}`);
});
