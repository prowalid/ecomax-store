class DeadLetterQueueService {
  constructor({ pool, logger }) {
    this.pool = pool;
    this.logger = logger;
  }

  async record(entry) {
    const payload = {
      driver: entry.driver,
      eventName: entry.eventName,
      jobId: entry.jobId || null,
      payload: entry.payload || {},
      error: entry.error,
      attemptsMade: Number.isFinite(Number(entry.attemptsMade)) ? Number(entry.attemptsMade) : 1,
      maxAttempts: Number.isFinite(Number(entry.maxAttempts)) ? Number(entry.maxAttempts) : null,
    };

    await this.pool.query(
      `
        INSERT INTO dead_letter_queue (
          driver,
          event_name,
          job_id,
          payload,
          error,
          attempts_made,
          max_attempts
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        payload.driver,
        payload.eventName,
        payload.jobId,
        payload.payload,
        payload.error,
        payload.attemptsMade,
        payload.maxAttempts,
      ]
    );
  }

  async recordBestEffort(entry) {
    try {
      await this.record(entry);
    } catch (error) {
      this.logger?.warn?.('[Queue] Failed to persist dead letter entry', {
        driver: entry?.driver || null,
        eventName: entry?.eventName || null,
        jobId: entry?.jobId || null,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

module.exports = {
  DeadLetterQueueService,
};
