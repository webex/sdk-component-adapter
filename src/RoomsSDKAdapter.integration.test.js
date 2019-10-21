import {createIntegrationTestUser, removeIntegrationTestUser} from './testHelper';
import RoomsSDKAdapter from './RoomsSDKAdapter';

describe('Rooms SDK Adapter', () => {
  let roomsSDKAdapter, subscription, user;

  // Since these are integration tests with live data,
  // increase the async "idle" timeout so jest doesn't error early.
  jest.setTimeout(30000);

  beforeAll(async () => {
    user = await createIntegrationTestUser();
  });

  beforeEach(() => {
    roomsSDKAdapter = new RoomsSDKAdapter(user.sdk);
  });

  afterAll(async () => {
    // This is done after unsubscribing, but since unsubscribe can't be async, manually call it.
    await user.sdk.rooms.stopListening();

    try {
      await removeIntegrationTestUser(user);
    } catch (reason) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete test user for Room SDK Adapter integration tests', reason);
    }
  });

  describe('getRoom() returns', () => {
    afterEach(() => {
      subscription.unsubscribe();
    });

    test('a room in a proper shape', async (done) => {
      const createdRoom = await user.sdk.rooms.create({title: 'Webex Teams Test Room'});

      subscription = roomsSDKAdapter.getRoom(createdRoom.id).subscribe((room) => {
        expect(room).toMatchObject({
          ID: createdRoom.id,
          title: createdRoom.title,
        });
        done();
      });
    });

    test('an updated room title after subscribing', async (done) => {
      const createdRoom = await user.sdk.rooms.create({title: 'Webex Teams Test Room'});
      let hasUpdated = false;
      const updatedTitle = 'Updated Test Title';

      subscription = roomsSDKAdapter.getRoom(createdRoom.id).subscribe(async (room) => {
        // The first subscription event will be the current state of the room.
        if (!hasUpdated) {
          // Update the room title so we get another subscription event.
          await user.sdk.rooms.update({id: room.ID, title: updatedTitle});
          hasUpdated = true;
        } else {
          // Once we've updated the title, the next event should include the updated title.
          expect(room.title).toBe(updatedTitle);
          done();
        }
      });
    });

    test('support for multiple subscriptions', async (done) => {
      const createdRoom = await user.sdk.rooms.create({title: 'Webex Teams Test Room'});

      subscription = roomsSDKAdapter.getRoom(createdRoom.id).subscribe();

      const secondSubscription = roomsSDKAdapter.getRoom(createdRoom.id).subscribe((room) => {
        expect(room).toMatchObject({
          ID: createdRoom.id,
          title: createdRoom.title,
        });
        done();
      });

      subscription.add(secondSubscription);
    });
  });
});
