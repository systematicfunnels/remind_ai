export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startWorker } = await import('./lib/queue');
    startWorker();
    console.log('BullMQ worker started successfully.');
  }
}
