import cache from './cache';
import {mockSDKRoom} from './mockSdk';
import mockActivities from './mockActivities';

describe('CacheMeOutside', () => {
  it('should return single cache instance', () => {
    expect(cache).toBeTruthy();
  });
  it('set - should set value in cache', () => {
    expect(cache.set('name', 'some-value')).toBeTruthy();
  });
  it('get - should get value in cache by key', () => {
    expect(cache.get('name')).toEqual('some-value');
  });
  it('size - returns the size of the cache', () => {
    expect(cache.size()).toEqual(1);
  });
  it('values - returns all the values in cache', () => {
    expect([...cache.values()][0]).toEqual('some-value');
  });
  it('keys - returns all the keys in cache', () => {
    expect([...cache.keys()][0]).toEqual('name');
  });
  it('has - should return true if key in cache', () => {
    expect(cache.has('name')).toBeTruthy();
  });
  it('remove - should remove in cache by key', () => {
    expect(cache.remove('name')).toBeTruthy();
  });
  it('has - should return false if key not in cache', () => {
    expect(cache.has('name')).toBeFalsy();
  });

  describe('cachActivities', () => {
    it('should set each activity in cache', () => {
      cache.cachActivities(mockActivities);
      expect(cache.get(mockActivities[0].id)).toBeTruthy();
    });
  });
  describe('cacheConversations', () => {
    it('should set each convo in cache', () => {
      cache.cacheConversations([mockSDKRoom]);
      expect(cache.get(mockSDKRoom.id)).toBeTruthy();
    });
  });
});
