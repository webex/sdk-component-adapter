import {isObservable} from 'rxjs';

import OrganizationsSDKAdapter from './OrganizationsSDKAdapter';
import createMockSDK, {mockSDKOrganization} from './mockSdk';

describe('Organizations SDK Adapter', () => {
  let mockSDK;
  let organizationsSDKAdapter;
  let organizationID;

  beforeEach(() => {
    mockSDK = createMockSDK();
    organizationsSDKAdapter = new OrganizationsSDKAdapter(mockSDK);
  });

  afterEach(() => {
    mockSDK = null;
    organizationsSDKAdapter = null;
  });

  describe('getOrg()', () => {
    beforeEach(() => {
      organizationID = 'organizationID';
      organizationsSDKAdapter.fetchOrganization = jest.fn(
        () => Promise.resolve(mockSDKOrganization),
      );
    });

    it('returns an observable', () => {
      expect(isObservable(organizationsSDKAdapter.getOrg(organizationID))).toBeTruthy();
    });

    it('emits organization details on subscription', (done) => {
      organizationsSDKAdapter.getOrg(organizationID).subscribe(
        (organization) => {
          expect(organization).toMatchObject({
            ID: 'organizationID',
            name: 'Cisco Systems, Inc.',
          });
          done();
        },
      );
    });
  });

  it('throws an error on invalid organization ID', (done) => {
    const sdkError = new Error('Could\'t find organization with ID "badOrgID"');

    organizationsSDKAdapter.fetchOrganization = jest.fn(() => Promise.reject(sdkError));

    organizationsSDKAdapter.getOrg('badOrgID').subscribe(
      () => {},
      (error) => {
        expect(error.message).toBe(sdkError.message);
        done();
      },
    );
  });
});
