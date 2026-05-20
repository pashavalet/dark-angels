export const errorCodes = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
} as const;

export type ErrorCode = keyof typeof errorCodes;

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode: number = errorCodes[code],
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}
