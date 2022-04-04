import {
  defer,
  of,
} from 'rxjs';
import {
  catchError,
  map,
} from 'rxjs/operators';

import {MetricsAdapter, MetricType} from '@webex/component-adapter-interfaces';
import logger from './logger';

/**
 * A Webex metric.
 *
 * @external Metric
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/MetricsAdapter.js#L6}
 */

/**
 * Returns a MetricType enum key from the given value.
 * If type does not match an enum key, it returns null.
 *
 * @private
 * @param {string} type Type of metric to be captured.
 * @returns {string} MetricType
 */
function getType(type) {
  const metricType = Object.keys(MetricType).find((key) => MetricType[key] === type);

  return metricType === undefined ? null : metricType;
}

/**
 * The `MetricsSDKAdapter` is an implementation of the `MetricsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to emit metrics.
 *
 * @implements {MetricsAdapter}
 */
export default class MetricsSDKAdapter extends MetricsAdapter {
  /**
   * Submit metrics to metric service
   * Returns an observable that emits metric data that was registered.
   *
   * @param {Metric} metric  metric object containing type, fields, tags
   * @param {string} [preLoginID]  ID of the person during onboarding
   * @returns {external:Observable.<Metric>} Observable stream that emits metric data
   */
  submitMetrics(metric, preLoginID) {
    logger.debug('METRIC', undefined, 'submitMetrics()', ['called with', {metric}]);

    return defer(
      () => this.datasource.internal.metrics.submitClientMetrics(metric.name, metric, preLoginID),
    )
      .pipe(
        catchError(() => of({type: null})),
        map((metricResponse) => ({...metricResponse, type: getType(metricResponse.type)})),
      );
  }
}
