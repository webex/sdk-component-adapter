import {Observable} from 'rxjs';

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

export default {chainWith};
