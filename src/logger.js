import winston from 'winston';

const {createLogger, format, transports} = winston;
const logFormat = format.printf(({
  timestamp, level, resourceType, resourceID, action, message, error,
}) => {
  let msgString = message;

  if (Array.isArray(message)) {
    msgString = message.map((item) => (
      (typeof item === 'string' && item)
      || JSON.stringify(item, (key, value) => (
        (value instanceof MediaStream && `MediaStream([${value.getTracks().map((track) => track.kind)}])`)
        || value
      ), 2)
    )).join(' ');
  }

  return `${timestamp} ${level} ${resourceType} ${resourceID} ${action} ${msgString} ${error ? ` ${error.stack || error}` : ''}`;
});

const activeTransports = [];

if (process.env.NODE_ENV !== 'production') {
  activeTransports.push(new transports.Console({
    format: format.combine(
      format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
      format.colorize(),
      format.simple(),
      logFormat,
    ),
  }));
}

const winstonLogger = createLogger({
  level: 'debug',
  transports: activeTransports,
});

// create a custom logger and export it
const logger = {
  setLevel: (level) => {
    winstonLogger.level = level;
  },
};

for (const level of ['info', 'warn', 'error', 'debug']) {
  logger[level] = (resourceType, resourceID, action, message, error) => (
    winstonLogger[level]({
      resourceType, resourceID, action, message, error,
    })
  );
}

export default logger;
