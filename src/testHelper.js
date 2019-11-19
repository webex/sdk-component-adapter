import dotenv from 'dotenv';
import {createTestUser, removeTestUser} from '@webex/test-users';
import Webex from 'webex';
import {constructHydraId} from '@webex/common';

// Used to get WEBEX_CLIENT_ID & WEBEX_CLIENT_SECRET for test user creation access
dotenv.config();

const URL_CONVO_SERVICE_INTEGRATION = 'https://conversation-intb.ciscospark.com/conversation/api/v1';
const URL_ID_BROKER_INTEGRATION = 'https://idbrokerbts.webex.com';
const URL_U2C_INTEGRATION = 'https://u2c-intb.ciscospark.com/u2c/api/v1';
const SCOPE =
  'Identity:OAuthClient webexsquare:get_conversation webexsquare:admin Identity:SCIM spark:people_read spark:rooms_read spark:rooms_write spark:memberships_read spark:memberships_write spark:messages_read spark:messages_write spark:applications_read spark:applications_write spark:teams_read spark:teams_write spark:team_memberships_read spark:team_memberships_write spark:bots_read spark:bots_write spark:kms';

/**
 * Creates an SDK instance for the given access token, pointed at the webex integration environment.
 *
 * @param {Object} token details about user token, generated from createTestUser
 * @returns {Object} sdk instance
 */
export function createIntegrationSdkInstance(token) {
  // Creating another instance of the token object because `new Webex` modifies the object passed to it.
  const credentials = {...token};

  return new Webex({
    credentials,
    config: {
      // Set U2C to integration environment
      services: {
        u2c: URL_U2C_INTEGRATION,
      },
      logger: {
        level: 'error',
      },
    },
  });
}

/**
 * Creates a test user in the integration webex environment.
 *
 * @returns {Object} user
 * @returns {Object} user.sdk SDK Instance for the created user
 */
export async function createIntegrationTestUser() {
  const user = await createTestUser({
    idbrokerUrl: URL_ID_BROKER_INTEGRATION,
    conversationServiceUrl: URL_CONVO_SERVICE_INTEGRATION,
    scope: SCOPE,
  });

  // Pause for 5 seconds for CI
  await new Promise((done) => setTimeout(done, 5000));

  user.sdk = createIntegrationSdkInstance(user.token);

  return user;
}

/**
 * Removes the test user from the integration environment.
 *
 * @param {Object} user created in #createIntegrationTestUser()
 * @returns {Promise}
 */
export async function removeIntegrationTestUser(user) {
  return removeTestUser({
    ...user,
    conversationServiceUrl: URL_CONVO_SERVICE_INTEGRATION,
  });
}

/**
 * Constructs a Hydra ID for a given UUID.
 *
 * @param {String} UUID Person UUID
 * @returns {string}
 */
export function getPersonHydraID(UUID) {
  return constructHydraId('PEOPLE', UUID);
}
