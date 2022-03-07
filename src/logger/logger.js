import {safeJsonStringify} from '../utils';

export const LEVELS = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export const createLogger = () => {
  const transports = [];
  let currentLevel = 'error';

  const log = (level, ...rest) => {
    if (LEVELS[level] <= LEVELS[currentLevel]) {
      const timestamp = new Date();

      for (const transport of transports) {
        transport(timestamp, level, ...rest);
      }
    }
  };

  const logger = {
    addTransport: (transportFunction) => { transports.push(transportFunction); },
    setLevel: (level) => { currentLevel = level; },
    info: (...args) => log('info', ...args),
    warn: (...args) => log('warn', ...args),
    error: (...args) => log('error', ...args),
    debug: (...args) => log('debug', ...args),
  };

  return logger;
};

export const format = (timestamp, level, resourceType, resourceID, action, message, error) => {
  let msgString = message;

  if (Array.isArray(message)) {
    msgString = message.map((item) => (
      (typeof item === 'string' && item)
      || safeJsonStringify(item, (key, value) => (
        (value instanceof MediaStream && `MediaStream([${value.getTracks().map((track) => track.kind)}])`)
        || value
      ), 2)
    )).join(' ');
  }

  return `${timestamp.toISOString()} ${level} ${resourceType} ${resourceID} ${action} ${msgString} ${error ? ` ${error.stack || error}` : ''}`;
};

export default {
  createLogger,
  format,
};
