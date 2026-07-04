import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthUser } from '../common/middleware/auth';

export type RealtimeServer = Server;

export function configureRealtime(io: Server) {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing socket token'));

    try {
      socket.data.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
      return next();
    } catch {
      return next(new Error('Invalid socket token'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthUser;

    socket.on('store:join', ({ storeId }: { storeId: string }) => {
      if (user.storeId && user.storeId !== storeId) return;
      socket.join(`tenant:${user.tenantId}:store:${storeId}`);
      socket.emit('store:joined', { storeId });
    });

    socket.on('disconnect', () => {
      // Central place to plug metrics / audit logging.
    });
  });
}

export function emitOrderUpdate(io: Server, payload: {
  tenantId: string;
  storeId: string;
  orderId: string;
  status: string;
  event: 'created' | 'updated' | 'paid' | 'cancelled';
}) {
  io.to(`tenant:${payload.tenantId}:store:${payload.storeId}`).emit('order:update', payload);
}
