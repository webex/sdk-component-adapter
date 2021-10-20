import {createLogger, format, transports} from 'winston';

const logFormat = format.printf((info) => {
  const {
    resourceType, resourceID, action, msg, error,
  } = info.message;

  let msgString = msg;

  if (Array.isArray(msg)) {
    msgString = msg.map((item) => (
      item instanceof MediaStream ? 'MediaStream()' : item
    )).join(' ');
  }

  return `${info.timestamp} ${info.level} ${resourceType} ${resourceID} ${action} ${msgString} ${error ? ` ${error.stack}` : ''}`;
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

const logger = createLogger({
  level: 'debug',
  transports: activeTransports,
});

// export our logger object
const ourLogger = {
  debug: (resourceType, resourceID, action, msg) => {
    logger.debug({
      resourceType, resourceID, action, msg,
    });
  },

  info: (resourceType, resourceID, action, msg) => {
    logger.info({
      resourceType, resourceID, action, msg,
    });
  },

  warn: (resourceType, resourceID, action, msg) => {
    logger.warn({
      resourceType, resourceID, action, msg,
    });
  },

  error: (resourceType, resourceID, action, msg, error) => {
    logger.error({
      resourceType, resourceID, action, msg, error,
    });
  },
};

export default ourLogger;
