import http from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { buildApp } from './app';
import { connectMongo } from './infrastructure/mongo';
import { prisma } from './infrastructure/prisma';
import { redis } from './infrastructure/redis';
import { configureRealtime } from './realtime/socket';

async function bootstrap() {
  await connectMongo();
  await prisma.$connect();
  await redis.ping();

  const httpServer = http.createServer();
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN, credentials: true }
  });

  configureRealtime(io);
  const app = buildApp(io);
  httpServer.on('request', app);

  httpServer.listen(env.PORT, () => {
    console.log(`POS backend API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    httpServer.close();
    await prisma.$disconnect();
    redis.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
