import pino from 'pino';

let cachedLogger: ReturnType<typeof pino> | null = null;

export const useLogger = () => {
  if (cachedLogger) {
    return cachedLogger;
  }
  const config = useRuntimeConfig();
  cachedLogger = pino({
    level: config.pinoLevel || 'info',
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: { colorize: true }
          }
        : undefined
  });
  return cachedLogger;
};
