import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { serve } from 'inngest/express';
import { env } from './config/env.js';
import { morganStream } from './config/logger.js';
import { globalLimiter, authLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { inngest } from './inngest/client.js';
import { inngestFunctions } from './inngest/index.js';

import authRoutes from './modules/auth/auth.routes.js';
import ticketRoutes from './modules/tickets/ticket.routes.js';
import userRoutes from './modules/users/user.routes.js';
import moderatorRoutes from './modules/moderators/moderator.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import orgRoutes from './modules/organizations/org.routes.js';

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
    if (!allowed?.length) {
      callback(null, true);
      return;
    }
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

// ─── Global Middleware ───────────────────────────────
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('combined', { stream: morganStream }));
app.use(globalLimiter);

// ─── Inngest Serve Endpoint ──────────────────────────
app.use('/api/inngest', serve({ client: inngest, functions: inngestFunctions }));

// ─── API Routes ──────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/moderators', moderatorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/org', orgRoutes);

// ─── Health Check ────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Error Handling ──────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
