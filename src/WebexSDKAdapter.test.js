import WebexSDKAdapter from './WebexSDKAdapter';
import RoomsSDKAdapter from './RoomsSDKAdapter';
import PeopleSDKAdapter from './PeopleSDKAdapter';
import MeetingsSDKAdapter from './MeetingsSDKAdapter';
import createMockSDK from './mockSdk';

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

  it('has a rooms adapter instance', () => {
    expect(webexSDKAdapter.roomsAdapter).toBeInstanceOf(RoomsSDKAdapter);
  });

  it('has a people adapter instance', () => {
    expect(webexSDKAdapter.peopleAdapter).toBeInstanceOf(PeopleSDKAdapter);
  });

  it('has a meetings adapter instance', () => {
    expect(webexSDKAdapter.meetingsAdapter).toBeInstanceOf(MeetingsSDKAdapter);
  });
});
