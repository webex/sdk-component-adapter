import {isObservable} from 'rxjs';

import MetricsSDKAdapter from './MetricsSDKAdapter';
import createMockSDK, {mockSDKMetric} from './mockSdk';

describe('Metrics SDK Adapter', () => {
  let mockSDK;
  let metricsSDKAdapter;

  beforeEach(() => {
    mockSDK = createMockSDK();
    metricsSDKAdapter = new MetricsSDKAdapter(mockSDK);
  });

  describe('submitMetrics()', () => {
    test('returns an observable', () => {
      expect(isObservable(metricsSDKAdapter.submitMetrics())).toBeTruthy();
    });

    test('emits a Metric object on subscription', (done) => {
      metricsSDKAdapter.submitMetrics(mockSDKMetric, '').subscribe((metric) => {
        expect(metric).toMatchObject({
          fields: {
            testField: 123,
          },
          tags: {
            testTag: 'tag value',
          },
          metricName: 'testMetric',
          type: 'BEHAVIORAL',
          eventPayload: {value: 'splunk business metric payload'},
        });
        done();
      });
    });

    test('emits a Metric object with null type on metric plug-in error', (done) => {
      const errorMessage = 'Unable to emit metrics';

      mockSDK.internal.metrics.submitClientMetrics =
      jest.fn(() => Promise.reject(new Error(errorMessage)));

      metricsSDKAdapter.submitMetrics(mockSDKMetric, '').subscribe((metric) => {
        expect(metric).toMatchObject({
          type: null,
        });
        done();
      });
    });

    test('completes after one emission', (done) => {
      metricsSDKAdapter.submitMetrics(mockSDKMetric, '').subscribe(
        () => {},
        () => {},
        () => {
          expect(true).toBeTruthy();
          done();
        },
      );
    });
  });
});
