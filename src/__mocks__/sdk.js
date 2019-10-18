/**
 * Creates a mock instance of the Webex SDK used in unit testing
 *
 * @export
 * @returns {Object} mockSDK Instance
 */
export default function createMockSDK() {
  return {
    rooms: {
      get: jest.fn(),
      listen: jest.fn(() => Promise.resolve()),
      off: jest.fn(),
      on: jest.fn(),
      stopListening: jest.fn(() => Promise.resolve()),
      trigger: jest.fn(),
    },
  };
}
