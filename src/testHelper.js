/* eslint-disable import/no-extraneous-dependencies */
import Webex from 'webex';
import {constructHydraId} from '@webex/common';
import {
  createTestUser,
  removeTestUser,
} from '@webex/test-users';

// Default Scopes
const SCOPE = process.env.WEBEX_SCOPE || 'Identity:OAuthClient webexsquare:get_conversation webexsquare:admin Identity:SCIM spark:people_read spark:rooms_read spark:rooms_write spark:memberships_read spark:memberships_write spark:messages_read spark:messages_write spark:applications_read spark:applications_write spark:teams_read spark:teams_write spark:team_memberships_read spark:team_memberships_write spark:bots_read spark:bots_write spark:kms';

// Integration URLs
const HYDRA_SERVICE_URL_INTEGRATION = process.env.HYDRA_SERVICE_URL || 'https://integration.webexapis.com/v1/';
const IDBROKER_BASE_URL_INTEGRATION = process.env.IDBROKER_BASE_URL || 'https://idbrokerbts.webex.com';
const U2C_SERVICE_URL_INTEGRATION = process.env.U2C_SERVICE_URL || 'https://u2c-intb.ciscospark.com/u2c/api/v1';
const WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_INTEGRATION = process.env.WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL || 'https://cig-service-intb.ciscospark.com/cig-service/api/v1';

// Production URLs
const HYDRA_SERVICE_URL_PRODUCTION = process.env.HYDRA_SERVICE_URL || 'https://webexapis.com/v1/';
const IDBROKER_BASE_URL_PRODUCTION = process.env.IDBROKER_BASE_URL || 'https://idbroker.webex.com';
const U2C_SERVICE_URL_PRODUCTION = process.env.U2C_SERVICE_URL || 'https://u2c.wbx2.com/u2c/api/v1';
const WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_PRODUCTION = process.env.WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL || 'https://cig-service-a.wbx2.com/cig-service/api/v1';

/**
 * Constructs a Hydra ID for a given UUID.
 *
 * @param {string} UUID Person UUID
 * @returns {string} UUID following Hydra's UUID format
 */
export function getPersonHydraID(UUID) {
  return constructHydraId('PEOPLE', UUID);
}

/**
 * Returns an SDK instance for the given access token, pointed at the webex integration environment.
 *
 * @param {object} token Valid Webex access token
 * @returns {object} Webex SDK instance
 */
export function createIntegrationSdkInstance(token) {
  // Creating another instance of the token object because `new Webex` modifies the object passed to it.
  const credentials = {...token};

  return new Webex({
    credentials,
    config: {
      // Set U2C to integration environment
      services: {
        discovery: {
          hydra: HYDRA_SERVICE_URL_INTEGRATION,
          u2c: U2C_SERVICE_URL_INTEGRATION,
        },
      },
      logger: {
        level: 'error',
      },
    },
  });
}

/**
 * Returns a test user in the Webex integration environment.
 * The test user has an instance of the SDK automatically created and attached to it.
 *
 * @returns {Promise<object>} user in integration environment
 */
export async function createIntegrationTestUser() {
  const user = await createTestUser({
    idbrokerUrl: IDBROKER_BASE_URL_INTEGRATION,
    cigServiceUrl: WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_INTEGRATION,
    scope: SCOPE,
  });

  // Pause for 5 seconds for CI
  await new Promise((done) => setTimeout(done, 5000));

  user.sdk = createIntegrationSdkInstance(user.token);

  return user;
}

/**
 * Removes the test user from the Webex integration environment.
 *
 * @see {@link createIntegrationTestUser}
 *
 * @param {object} user User created by `createIntegrationTestUser()`
 * @returns {Promise} Promise indicating whether removing the user was successful
 */
export async function removeIntegrationTestUser(user) {
  return removeTestUser({
    ...user,
    cigServiceUrl: WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_INTEGRATION,
  });
}

/**
 * Returns an SDK instance for the given access token, pointed at the webex production environment.
 *
 * @param {object} token Valid Webex access token
 * @returns {object} Webex SDK instance
 */
export function createProductionSdkInstance(token) {
  // Creating another instance of the token object because `new Webex` modifies the object passed to it.
  const credentials = {...token};

  return new Webex({
    credentials,
    config: {
      // Set U2C to production environment
      services: {
        discovery: {
          hydra: HYDRA_SERVICE_URL_PRODUCTION,
          u2c: U2C_SERVICE_URL_PRODUCTION,
        },
        validateDomains: true,
      },
      logger: {
        level: 'error',
      },
    },
  });
}

/**
 * Returns a test user in the Webex production environment.
 * The test user has an instance of the SDK automatically created and attached to it.
 *
 * @returns {Promise<object>} user in production environment
 */
export async function createProductionTestUser() {
  const user = await createTestUser({
    idbrokerUrl: IDBROKER_BASE_URL_PRODUCTION,
    cigServiceUrl: WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_PRODUCTION,
    scope: SCOPE,
  });

  // Pause for 5 seconds for CI
  await new Promise((done) => setTimeout(done, 5000));

  user.sdk = createIntegrationSdkInstance(user.token);

  return user;
}

/**
 * Removes the test user from the Webex production environment.
 *
 * @see {@link createProductionTestUser}
 *
 * @param {object} user User created by `createProductionTestUser()`
 * @returns {Promise} Promise indicating whether removing the user was successful
 */
export async function removeProductionTestUser(user) {
  return removeTestUser({
    ...user,
    cigServiceUrl: WEBEX_TEST_USERS_CI_GATEWAY_SERVICE_URL_PRODUCTION,
  });
}
