import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError';

export function requireTenant(req: Request, _res: Response, next: NextFunction) {
  if (!req.user?.tenantId) throw new AppError(401, 'Tenant context is required');
  return next();
}
