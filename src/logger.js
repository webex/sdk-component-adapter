import {createLogger} from './logger/logger';
import consoleTransport from './logger/consoleTransport';

const logger = createLogger();

logger.setLevel('error');

if (process.env.NODE_ENV !== 'production') {
  logger.addTransport(consoleTransport());
}

if (typeof window !== 'undefined') {
  window.webexSDKAdapterSetLogLevel = (level) => logger.setLevel(level);
}

export default logger;
