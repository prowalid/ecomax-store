const { Queue, Worker } = require('bullmq');

class BullMQQueueManager {
  constructor({ config, logger, deadLetterQueueService = null, QueueClass = Queue, WorkerClass = Worker }) {
    this.config = config;
    this.logger = logger;
    this.deadLetterQueueService = deadLetterQueueService;
    this.QueueClass = QueueClass;
    this.WorkerClass = WorkerClass;
    this.handlers = new Map();
    this.queue = null;
    this.worker = null;
  }

  getConnection() {
    return {
      host: this.config.redis.host,
      port: this.config.redis.port,
      password: this.config.redis.password || undefined,
      db: this.config.redis.db,
    };
  }

  registerEventHandler(eventName, handler) {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName).push(handler);
  }

  hasEventHandlers(eventName) {
    return (this.handlers.get(eventName) || []).length > 0;
  }

  async start() {
    if (this.queue && this.worker) {
      return;
    }

    const connection = this.getConnection();
    this.queue = new this.QueueClass(this.config.queueName, {
      connection,
      prefix: this.config.redis.keyPrefix,
      defaultJobOptions: {
        removeOnComplete: 500,
        removeOnFail: 1000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.worker = new this.WorkerClass(
      this.config.queueName,
      async (job) => {
        const handlers = this.handlers.get(job.name) || [];
        const results = await Promise.allSettled(
          handlers.map((handler) => Promise.resolve().then(() => handler(job.data)))
        );

        const failure = results.find((result) => result.status === 'rejected');
        if (failure) {
          throw failure.reason instanceof Error
            ? failure.reason
            : new Error(String(failure.reason));
        }
      },
      {
        connection,
        prefix: this.config.redis.keyPrefix,
        concurrency: this.config.workerConcurrency,
      }
    );

    this.worker.on('failed', (job, error) => {
      const attemptsMade = job?.attemptsMade ?? null;
      const maxAttempts = job?.opts?.attempts ?? null;

      this.logger?.error?.('[Queue:bullmq] Event job failed', {
        queueName: this.config.queueName,
        jobId: job?.id || null,
        eventName: job?.name || null,
        attemptsMade,
        maxAttempts,
        payload: job?.data || null,
        error: error instanceof Error ? error.message : String(error),
      });

      if (this.deadLetterQueueService && maxAttempts !== null && attemptsMade >= maxAttempts) {
        void this.deadLetterQueueService.recordBestEffort({
          driver: 'bullmq',
          eventName: job?.name || 'unknown',
          jobId: job?.id || null,
          payload: job?.data || {},
          error: error instanceof Error ? error.message : String(error),
          attemptsMade,
          maxAttempts,
        });
      }
    });

    this.worker.on('completed', (job) => {
      this.logger?.info?.('[Queue:bullmq] Event job completed', {
        queueName: this.config.queueName,
        jobId: job?.id || null,
        eventName: job?.name || null,
      });
    });
  }

  async enqueueEvent(eventName, payload) {
    if (!this.queue) {
      await this.start();
    }

    await this.queue.add(eventName, payload, {
      jobId: payload?.eventId ? `${eventName}:${payload.eventId}` : undefined,
    });
  }

  async shutdown() {
    await this.worker?.close();
    await this.queue?.close();
    this.worker = null;
    this.queue = null;
  }

  async getHealthStatus() {
    if (!this.queue || !this.worker) {
      return {
        status: 'error',
        driver: 'bullmq',
        queueName: this.config.queueName,
        message: 'Queue manager is not started',
      };
    }

    try {
      if (typeof this.queue.waitUntilReady === 'function') {
        await this.queue.waitUntilReady();
      }

      if (typeof this.worker.waitUntilReady === 'function') {
        await this.worker.waitUntilReady();
      }

      return {
        status: 'ok',
        driver: 'bullmq',
        queueName: this.config.queueName,
        workerConcurrency: this.config.workerConcurrency,
      };
    } catch (error) {
      return {
        status: 'error',
        driver: 'bullmq',
        queueName: this.config.queueName,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

module.exports = {
  BullMQQueueManager,
};
