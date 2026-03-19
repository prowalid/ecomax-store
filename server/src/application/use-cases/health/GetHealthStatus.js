class GetHealthStatusUseCase {
  constructor({ pool, cacheStore, queueManager, getVersionPayload }) {
    this.pool = pool;
    this.cacheStore = cacheStore;
    this.queueManager = queueManager;
    this.getVersionPayload = getVersionPayload;
  }

  async execute({ requestId }) {
    const startedAt = Date.now();
    const checks = {};
    let overallStatus = 'ok';
    let databaseTime = null;

    try {
      const dbStartedAt = Date.now();
      const result = await this.pool.query('SELECT NOW()');
      databaseTime = result.rows[0]?.now || new Date().toISOString();
      checks.database = {
        status: 'ok',
        responseTimeMs: Date.now() - dbStartedAt,
      };
    } catch (error) {
      overallStatus = 'error';
      checks.database = {
        status: 'error',
        message: error.message,
      };
    }

    try {
      const cacheStartedAt = Date.now();
      const pingResult = this.cacheStore?.ping
        ? await this.cacheStore.ping()
        : 'UNSUPPORTED';

      checks.cache = {
        status: 'ok',
        driver: this.cacheStore?.constructor?.name || 'UnknownCacheStore',
        responseTimeMs: Date.now() - cacheStartedAt,
        ping: pingResult,
      };
    } catch (error) {
      overallStatus = 'error';
      checks.cache = {
        status: 'error',
        driver: this.cacheStore?.constructor?.name || 'UnknownCacheStore',
        message: error.message,
      };
    }

    try {
      const queueStartedAt = Date.now();
      const queueHealth = this.queueManager?.getHealthStatus
        ? await this.queueManager.getHealthStatus()
        : {
          status: 'ok',
          driver: 'unsupported',
        };

      checks.queue = {
        ...queueHealth,
        responseTimeMs: Date.now() - queueStartedAt,
      };

      if (queueHealth.status !== 'ok') {
        overallStatus = 'error';
      }
    } catch (error) {
      overallStatus = 'error';
      checks.queue = {
        status: 'error',
        driver: this.queueManager?.constructor?.name || 'UnknownQueueManager',
        message: error.message,
      };
    }

    return {
      status: overallStatus,
      time: databaseTime || new Date().toISOString(),
      database: checks.database?.status === 'ok' ? 'connected' : 'disconnected',
      cache: checks.cache?.status === 'ok' ? 'connected' : 'disconnected',
      queue: checks.queue?.status === 'ok' ? 'connected' : 'disconnected',
      requestId,
      uptimeSeconds: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      version: this.getVersionPayload(),
      responseTimeMs: Date.now() - startedAt,
      checks,
    };
  }
}

module.exports = {
  GetHealthStatusUseCase,
};
