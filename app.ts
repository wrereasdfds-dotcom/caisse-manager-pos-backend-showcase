import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import type { Server } from 'socket.io';
import { env } from './config/env';
import { errorHandler } from './common/middleware/errorHandler';
import { authRouter } from './features/auth/auth.routes';
import { healthRouter } from './features/health/health.routes';
import { tenantRouter } from './features/tenants/tenant.routes';
import { storeRouter } from './features/stores/store.routes';
import { buildOrderRouter } from './features/orders/order.routes';
import { inventoryRouter } from './features/inventory/inventory.routes';
import { buildIntegrationRouter } from './features/integrations/integration.routes';

export function buildApp(io: Server) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN, credentials: true }));
  app.use(compression());
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(rateLimit({ windowMs: 60_000, limit: 120 }));

  // Webhook routes require raw body before JSON middleware.
  app.use('/api/v1/integrations', buildIntegrationRouter(io));

  app.use(express.json({ limit: '1mb' }));

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/tenant', tenantRouter);
  app.use('/api/v1/stores', storeRouter);
  app.use('/api/v1/orders', buildOrderRouter(io));
  app.use('/api/v1/inventory', inventoryRouter);

  app.use(errorHandler);
  return app;
}
