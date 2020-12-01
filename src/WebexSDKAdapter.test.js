import WebexSDKAdapter from './WebexSDKAdapter';
import RoomsSDKAdapter from './RoomsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import MeetingsSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK from './__mocks__/sdk';

describe('Webex SDK Adapter', () => {
  let mockSDK;
  let webexSDKAdapter;

  beforeEach(() => {
    mockSDK = createMockSDK();
    webexSDKAdapter = new WebexSDKAdapter(mockSDK);
  });

  afterEach(() => {
    webexSDKAdapter = null;
  });

  test('has a rooms adapter instance', () => {
    expect(webexSDKAdapter.roomsAdapter).toBeInstanceOf(RoomsSDKAdapter);
  });

  test('has a people adapter instance', () => {
    expect(webexSDKAdapter.peopleAdapter).toBeInstanceOf(PeopleSDKAdapter);
  });

  test('has a meetings adapter instance', () => {
    expect(webexSDKAdapter.meetingsAdapter).toBeInstanceOf(MeetingsSDKAdapter);
  });
});
