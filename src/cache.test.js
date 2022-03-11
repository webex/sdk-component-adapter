import cache from './cache';
import {mockSDKRoom} from './mockSdk';
import mockActivities from './mockActivities';

describe('CacheMeOutside', () => {
  test('should return single cache instance', () => {
    expect(cache).toBeTruthy();
  });
  test('set - should set value in cache', () => {
    expect(cache.set('name', 'some-value')).toBeTruthy();
  });
  test('get - should get value in cache by key', () => {
    expect(cache.get('name')).toEqual('some-value');
  });
  test('size - returns the size of the cache', () => {
    expect(cache.size()).toEqual(1);
  });
  test('values - returns all the values in cache', () => {
    expect([...cache.values()][0]).toEqual('some-value');
  });
  test('keys - returns all the keys in cache', () => {
    expect([...cache.keys()][0]).toEqual('name');
  });
  test('has - should return true if key in cache', () => {
    expect(cache.has('name')).toBeTruthy();
  });
  test('remove - should remove in cache by key', () => {
    expect(cache.remove('name')).toBeTruthy();
  });
  test('has - should return false if key not in cache', () => {
    expect(cache.has('name')).toBeFalsy();
  });

  describe('cachActivities', () => {
    test('should set each activity in cache', () => {
      cache.cachActivities(mockActivities);
      expect(cache.get(mockActivities[0].id)).toBeTruthy();
    });
  });
  describe('cacheConversations', () => {
    test('should set each convo in cache', () => {
      cache.cacheConversations([mockSDKRoom]);
      expect(cache.get(mockSDKRoom.id)).toBeTruthy();
    });
  });
});
