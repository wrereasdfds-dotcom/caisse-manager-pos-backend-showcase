import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { AppError } from '../errors/AppError';

export type AuthUser = {
  userId: string;
  tenantId: string;
  storeId?: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Missing bearer token');
  }

  try {
    req.user = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser;
    return next();
  } catch {
    throw new AppError(401, 'Invalid or expired token');
  }
}
