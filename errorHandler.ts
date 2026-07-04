import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: error.flatten()
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.name || 'APPLICATION_ERROR',
      message: error.message,
      details: error.details
    });
  }

  console.error(error);
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error'
  });
}
