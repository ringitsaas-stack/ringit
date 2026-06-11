import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export class AppError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode = 400, code?: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function handleRouteError(error: Error | AppError | ZodError | unknown): NextResponse {
  console.error('Centralized Error caught:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { 
        error: 'Validation failed', 
        details: error.issues.map(err => ({
          path: err.path.join('.'),
          message: err.message
        })) 
      },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
