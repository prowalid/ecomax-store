const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
const serviceName = process.env.LOG_SERVICE_NAME || 'express-trade-kit';
const isProduction = process.env.NODE_ENV === 'production';

const enrichFormat = winston.format((info) => {
  info.service = info.service || serviceName;
  info.context = info.context || 'app';
  return info;
});

const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  enrichFormat(),
  winston.format.printf(({ level, message, timestamp, stack, ...metadata }) => {
    const meta = { ...metadata };
    delete meta.level;
    delete meta.message;
    delete meta.timestamp;
    let msg = `${timestamp} [${level.toUpperCase()}] [${meta.context || 'app'}]: ${message}`;
    if (stack) {
      msg += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  enrichFormat(),
  winston.format.json()
);

function withRequestContext(logger, requestId, extraMeta = {}) {
  if (!requestId) {
    return logger;
  }

  return logger.child({ requestId, ...extraMeta });
}

function withContext(logger, context, extraMeta = {}) {
  if (!context) {
    return logger;
  }

  return logger.child({ context, ...extraMeta });
}

// Define transport for daily rotation
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
});

// Create the logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  defaultMeta: {
    service: serviceName,
    context: 'app',
  },
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    fileRotateTransport,
    errorRotateTransport,
    new winston.transports.Console({
      format: isProduction
        ? productionFormat
        : winston.format.combine(
          winston.format.colorize(),
          developmentFormat
        )
    })
  ],
  exceptionHandlers: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '30d'
    })
  ]
});

// Stream for morgan integration
logger.stream = {
  write: (message) => {
    logger.child({ context: 'http' }).info('HTTP request log', {
      raw: message.trim(),
    });
  },
};

logger.withRequestContext = withRequestContext;
logger.withContext = withContext;

module.exports = logger;
