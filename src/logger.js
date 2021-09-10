import {createLogger, format, transports} from 'winston';
import Transport from 'winston-transport';

const activeTransports = [];

if (process.env.NODE_ENV !== 'production') {
  activeTransports.push(new transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple(),
    ),
  }));
}

export const setRequest = (request) => {
  module.request = request;
};
class MetricsTransport extends Transport {
  async log(info, callback) {
    module.request({
      service: 'metrics',
      resource: 'clientmetrics',
      method: 'POST',
      body: {
        metrics: [{
          metricName: info.message,
          fields: {success: true},
        }],
      },
    }).then((res) => res.body);
    this.emit('logged', info);
    callback();
  }
}

export const logger = createLogger({
  transports: activeTransports,
});
export const metrics = createLogger({
  transports: new MetricsTransport({level: 'info'}),
});
