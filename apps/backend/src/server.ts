import { app, env } from './app.js';
import { startBotPolling } from './routes/bot/bot-polling.js';

try {
  await app.listen({ port: env.PORT, host: env.HOST });
  startBotPolling(app);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
