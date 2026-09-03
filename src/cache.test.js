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

  describe('scope()', () => {
    it('cross-tenant cache isolation', () => {
      const tenantAScope = cache.scope('tenant-a');
      const tenantBScope = cache.scope('tenant-b');

      tenantAScope.set('shared-id', 'tenant-a-value');
      tenantBScope.set('shared-id', 'tenant-b-value');

      expect(tenantAScope.get('shared-id')).toEqual('tenant-a-value');
      expect(tenantBScope.get('shared-id')).toEqual('tenant-b-value');
      expect(tenantAScope.get('shared-id')).not.toEqual(tenantBScope.get('shared-id'));
    });

    it('facade cache methods unchanged', () => {
      expect(cache.set('facade-key', 'facade-value')).toBeTruthy();
      expect(cache.get('facade-key')).toEqual('facade-value');
      expect(cache.has('facade-key')).toBeTruthy();
      expect([...cache.keys()]).toContain('facade-key');
      expect([...cache.values()]).toContain('facade-value');
      expect(cache.size()).toEqual([...cache.keys()].length);
      expect(cache.remove('facade-key')).toBeTruthy();
      expect(cache.has('facade-key')).toBeFalsy();
    });
  });
});
