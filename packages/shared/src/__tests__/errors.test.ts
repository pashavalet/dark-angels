import { describe, it, expect } from 'vitest';
import { AppError, errorCodes } from '../utils/errors.js';

describe('AppError', () => {
  it('creates error with code and status', () => {
    const err = new AppError('NOT_FOUND', 'Resource not found');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Resource not found');
  });

  it('uses default status code from errorCodes', () => {
    const err = new AppError('VALIDATION_ERROR', 'Bad input');
    expect(err.statusCode).toBe(400);
  });
});
