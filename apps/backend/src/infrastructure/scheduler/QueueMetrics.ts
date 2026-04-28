import { publishQueue } from './PublishQueue';

export async function getQueueMetrics() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    publishQueue.getWaitingCount(),
    publishQueue.getActiveCount(),
    publishQueue.getCompletedCount(),
    publishQueue.getFailedCount(),
    publishQueue.getDelayedCount()
  ]);

  // Simulamos un límite diario seguro para este cluster (basado en IPs y Warmup Status)
  const safeDailyLimit = 150; 
  const availableNow = safeDailyLimit - (completed + active + waiting);

  return {
    metrics: { waiting, active, completed, failed, delayed },
    limits: {
      safeDailyLimit,
      availableNow: availableNow < 0 ? 0 : availableNow,
      status: availableNow < 10 ? 'CRITICAL' : availableNow < 50 ? 'WARNING' : 'HEALTHY'
    }
  };
}
