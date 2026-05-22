import type { FastifyInstance } from 'fastify';
import crypto from 'node:crypto';
import path from 'node:path';
import { loadEnv } from '../../config/env.js';

export default async function uploadRoutes(app: FastifyInstance) {
  const env = loadEnv();

  await app.register(import('@fastify/multipart'), {
    limits: {
      fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
    },
  });

  app.post('/', { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) {
      return reply.code(400).send({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' },
      });
    }

    const allowedTypes = env.ALLOWED_IMAGE_TYPES.split(',').map((t: string) => t.trim());
    if (!allowedTypes.includes(data.mimetype)) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid file type. Allowed: ${env.ALLOWED_IMAGE_TYPES}`,
        },
      });
    }

    const buffer = await data.toBuffer();
    if (buffer.length > env.MAX_FILE_SIZE_MB * 1024 * 1024) {
      return reply.code(400).send({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `File size exceeds ${env.MAX_FILE_SIZE_MB} MB limit`,
        },
      });
    }

    const ext = path.extname(data.filename) || '.png';
    const filename = `${crypto.randomUUID()}-${Date.now()}${ext}`;

    const { error } = await app.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(filename, buffer, { contentType: data.mimetype, upsert: false });

    if (error) {
      return reply.code(400).send({
        success: false,
        error: { code: 'UPLOAD_ERROR', message: error.message },
      });
    }

    const publicUrl = app.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(filename).data.publicUrl;

    return { success: true, data: { url: publicUrl, filename } };
  });

  app.delete('/:filename', { onRequest: [app.authenticate] }, async (request, reply) => {
    const { filename } = request.params as { filename: string };

    const { error } = await app.supabase.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .remove([filename]);

    if (error) {
      return reply.code(400).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      });
    }

    return { success: true };
  });
}
