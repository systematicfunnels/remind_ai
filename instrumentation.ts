export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWorker } = await import('./lib/queue');
    const { logger } = await import('./lib/logger');
    startWorker();
    logger.info('BullMQ worker started successfully.');
  }
}
