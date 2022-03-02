import {safeJsonStringify} from './utils';

const LEVELS = {
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

let currentLevel = 'error';

const format = (level, resourceType, resourceID, action, message, error) => {
  const timestamp = new Date().toISOString();
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

  return `${timestamp} ${level} ${resourceType} ${resourceID} ${action} ${msgString} ${error ? ` ${error.stack || error}` : ''}`;
};

const log = (level, args) => {
  if (LEVELS[level] <= LEVELS[currentLevel]) {
    console.log(format(level, ...args));
  }
};

const logger = {
  setLevel: (level) => { currentLevel = level; },
  info: (...args) => log('info', args),
  warn: (...args) => log('warn', args),
  error: (...args) => log('error', args),
  debug: (...args) => log('debug', args),
};

if (typeof window !== 'undefined') {
  window.webexSDKAdapterSetLogLevel = (level) => logger.setLevel(level);
}

export default logger;
