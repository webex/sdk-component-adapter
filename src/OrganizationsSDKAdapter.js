import {ReplaySubject, defer} from 'rxjs';
import {map} from 'rxjs/operators';
import {OrganizationsAdapter} from '@webex/component-adapter-interfaces';

// TODO: Figure out how to import JS Doc definitions and remove duplication.
/**
 * A set of people in Webex.
 *
 * @external Organization
 * @see {@link https://github.com/webex/component-adapter-interfaces/blob/master/src/OrganizationsAdapter.js#L6}
 */

/**
 * The `OrganizationsSDKAdapter` is an implementation of the `OrganizationsAdapter` interface.
 * This adapter utilizes the Webex JS SDK to fetch data about an organization.
 *
 * @implements {OrganizationsAdapter}
 */
export default class OrganizationsSDKAdapter extends OrganizationsAdapter {
  constructor(datasource) {
    super(datasource);

    this.organizationObservables = {};
  }

  /**
   * Returns a promise to organization data from Webex.
   *
   * @param {string} orgID ID of the organization for which to fetch data
   * @returns {Promise.<Organization>} Information about the organization of the given ID
   *
   * @private
   */
  fetchOrganization(orgID) {
    return this.datasource.request({
      service: 'hydra',
      resource: `organizations/${orgID}`,
    }).then((res) => res.body);
  }

  /**
   * Returns an observable that emits organization data of the given ID.
   *
   * @param {string} ID ID of organization to get
   * @returns {external:Observable.<Organization>} Observable stream that emits organization data
   */
  getOrg(ID) {
    if (!(ID in this.organizationObservables)) {
      // use ReplaySubject cause we don't need to set an initial value
      this.organizationObservables[ID] = new ReplaySubject(1);

      defer(() => this.fetchOrganization(ID)).pipe(
        map((response) => ({
          ID: response.id,
          name: response.displayName,
        })),
      ).subscribe(
        (organization) => {
          this.organizationObservables[ID].next(organization);
        },
        () => {
          this.organizationObservables[ID].error(new Error(`Could't find organization with ID "${ID}"`));
        },
      );
    }

    return this.organizationObservables[ID];
  }
}
