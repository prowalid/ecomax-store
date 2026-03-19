const { z } = require('zod');

const RuntimeEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  PORT: z.coerce.number().int().positive().default(3001),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  CORS_ORIGINS: z.string().min(1),
  CACHE_DRIVER: z.string().optional(),
  RATE_LIMIT_STORE: z.string().optional(),
  QUEUE_DRIVER: z.string().optional(),
  REDIS_HOST: z.string().optional(),
  METRICS_ENABLED: z.string().optional(),
  METRICS_TOKEN: z.string().optional(),
});

function parseBoolean(value, defaultValue = false) {
  if (value == null || value === '') {
    return defaultValue;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function maskSecret(value) {
  if (!value) {
    return '';
  }

  if (value.length <= 8) {
    return `${value.slice(0, 1)}***${value.slice(-1)}`;
  }

  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

function validateRuntimeEnv(rawEnv = process.env) {
  const parsed = RuntimeEnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid runtime environment: ${details}`);
  }

  const env = parsed.data;
  const issues = [];
  const warnings = [];

  if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
    issues.push('JWT_SECRET must be at least 32 characters in production.');
  }

  const needsRedis = ['redis'].includes((env.CACHE_DRIVER || '').toLowerCase())
    || ['redis'].includes((env.RATE_LIMIT_STORE || '').toLowerCase())
    || ['bullmq'].includes((env.QUEUE_DRIVER || '').toLowerCase());

  if (needsRedis && !env.REDIS_HOST) {
    issues.push('REDIS_HOST is required when Redis-backed cache, queue, or rate limiting is enabled.');
  }

  const metricsEnabled = parseBoolean(env.METRICS_ENABLED, true);
  if (env.NODE_ENV === 'production' && metricsEnabled && !env.METRICS_TOKEN) {
    warnings.push('METRICS_TOKEN is empty in production; /api/metrics is publicly reachable.');
  }

  if (issues.length > 0) {
    throw new Error(`Runtime validation failed: ${issues.join(' ')}`);
  }

  return {
    env,
    warnings,
    summary: {
      nodeEnv: env.NODE_ENV,
      port: env.PORT,
      dbHost: env.DB_HOST,
      dbName: env.DB_NAME,
      cacheDriver: env.CACHE_DRIVER || 'memory',
      rateLimitStore: env.RATE_LIMIT_STORE || 'auto',
      queueDriver: env.QUEUE_DRIVER || 'inline',
      metricsEnabled,
      metricsProtected: Boolean(env.METRICS_TOKEN),
      maskedJwtSecret: maskSecret(env.JWT_SECRET),
    },
  };
}

module.exports = {
  validateRuntimeEnv,
  maskSecret,
};
