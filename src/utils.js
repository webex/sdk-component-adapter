import {combineLatest, Observable} from 'rxjs';
import {startWith} from 'rxjs/operators';

/**
 * Custom rxjs operator for chaining dependent observables.
 * Usage:
 ```js
  obs.pipe(
    chainWith((lastMessage) => createDependentObservable(lastMessage),
  );
  ```
 *
 * @param {function(lastMessage): Observable} createDependentObservable  Function that is passed the last message emitted by the source observable and returns a new observable
 * @returns {Observable} observable
 */
export function chainWith(createDependentObservable) {
  return (source) => new Observable((subscriber) => {
    let lastValue;
    let subscription;

    subscription = source.subscribe(
      (value) => {
        subscriber.next(value);
        lastValue = value;
      },
      (error) => subscriber.error(error),
      () => {
        subscription = createDependentObservable(lastValue).subscribe(
          (value) => subscriber.next(value),
          (error) => subscriber.error(error),
          () => subscriber.complete(),
        );
      },
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  });
}

/**
 * Custom rxjs operator that works like combineLatest, but emits even if some of the source observables haven't emitted yet.
 * Usage:
 ```js
  combineLatestImmediate(obs1, obs2, ...);
  ```
 *
 * @param {ObservableInput} [observables] An array of input Observables to combine with each other.
 * @returns {Observable} Observable that emits arrays containing the last emitted value from each of the observables defined above.
 */
export function combineLatestImmediate(...observables) {
  return combineLatest(observables.map((obs) => obs.pipe(startWith(undefined))));
}

/**
 * Helper function for deep merge on objects.
 *
 * @param {object} dest - The destination object.
 * @param {object} src - The source object.
 */
export function deepMerge(dest, src) {
  const result = dest;

  for (const [key, val] of Object.entries(src || {})) {
    if (val && val.constructor === Object) {
      deepMerge(result[key], val);
    } else {
      result[key] = val;
    }
  }
}

/**
 * Safe JSON stringifier that:
 * - replaces circular references with the text [circular-reference]
 * - catches any JSON.stringify error and returns [error-stringifying:<ERROR-MESSAGE>]
 *
 * @param {any} data  Data to be stringified
 * @param {Function} [replacer]  JSON.stringify() replacer parameter
 * @param {string|number} [space]  JSON.stringify() space parameter
 * @returns {string} The string result
 */
export function safeJsonStringify(data, replacer, space) {
  const seen = new WeakSet();
  let str;

  try {
    str = JSON.stringify(data, (key, value) => {
      let replaced = replacer ? replacer(key, value) : value;

      if (typeof replaced === 'object' && replaced !== null) {
        if (seen.has(replaced)) {
          replaced = '[circular-reference]';
        } else {
          seen.add(replaced);
        }
      }

      return replaced;
    }, space);
  } catch (error) {
    str = `[error-stringifying:${error.message}]`;
  }

  return str;
}

export default {
  chainWith,
  combineLatestImmediate,
  deepMerge,
  safeJsonStringify,
};

// Checks for the existence of setSinkId on a media element.
export const isSpeakerSupported = !!document.createElement('audio').setSinkId;
