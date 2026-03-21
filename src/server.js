import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import logger from './config/logger.js';
import app from './app.js';

const PORT = env.PORT;

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`SmartSupport server running on port ${PORT} [${env.NODE_ENV}]`);
    logger.info(`Inngest endpoint: http://localhost:${PORT}/api/inngest`);
  });
}

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
