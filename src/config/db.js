import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async () => {
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      logger.info('MongoDB connected successfully');
      return;
    } catch (err) {
      attempt++;
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        logger.error('Max MongoDB connection retries reached — exiting');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
};
