import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

export const refreshSchema = z.object({
  refresh_token: z.string(),
});

export const updateEmailSchema = z.object({
  new_email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(12, 'Password must be at least 12 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
