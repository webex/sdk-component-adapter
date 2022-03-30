/// <reference types="cypress" />
import {from} from 'rxjs';
import {delayWhen, skip} from 'rxjs/operators';

import WebexSDKAdapter from '.';
import {
  createIntegrationTestUser,
  removeIntegrationTestUser,
} from './testHelper';

describe('Rooms SDK Adapter', () => {
  // work around for testHelpers+node_modules to access ENV variables
  process.env = Cypress.env();
  let createdRoom;
  let getRoom$;
  let getActivitiesInRealTime$;
  let subscription;
  let user;
  let webexSDKAdapter;

  before(async () => {
    user = await createIntegrationTestUser();
    webexSDKAdapter = new WebexSDKAdapter(user.sdk);
    await webexSDKAdapter.connect();
  });

  after(async () => {
    try {
      await removeIntegrationTestUser(user);
      await webexSDKAdapter.disconnect();
    } catch (reason) {
      // eslint-disable-next-line no-console
      console.warn('Failed to delete test user for Room SDK Adapter integration tests.', reason);
    }
  });

  describe('getRoom() returns', () => {
    beforeEach(async () => {
      createdRoom = await user.sdk.rooms.create({title: 'Webex Test Room'});
      getRoom$ = webexSDKAdapter.roomsAdapter.getRoom(createdRoom.id);
    });

    afterEach(async () => {
      try {
        await user.sdk.rooms.remove(createdRoom.id);
        subscription.unsubscribe();
        getRoom$ = null;
        createdRoom = null;
      } catch (reason) {
        // eslint-disable-next-line no-console
        console.warn(`Failed to delete a room "${createdRoom.id}" in Room SDK Adapter integration tests.`, reason);
      }
    });

    it('a room in a proper shape', () => {
      subscription = getRoom$.subscribe((room) => {
        expect(room).to.deep.include({
          ID: createdRoom.id,
          title: createdRoom.title,
        });
      });
    });

    it('an updated room title after subscribing', () => {
      const updatedTitle = 'Updated Test Title';

      subscription = getRoom$
        .pipe(
          delayWhen(() => from(
            user.sdk.rooms.update({
              id: createdRoom.id,
              title: updatedTitle,
            }),
          )),
          skip(1),
        )
        .subscribe((room) => {
          expect(room.title).to.be(updatedTitle);
        });
    });

    it('support for multiple subscriptions', () => {
      subscription = getRoom$.subscribe();

      const secondSubscription = getRoom$.subscribe((room) => {
        expect(room).to.deep.include({
          ID: createdRoom.id,
          title: createdRoom.title,
        });
      });

      subscription.add(secondSubscription);
    });
  });

  describe('getActivitiesInRealTime() returns', () => {
    beforeEach(async () => {
      createdRoom = await user.sdk.rooms.create({title: 'Webex Test Room'});
      getActivitiesInRealTime$ = webexSDKAdapter
        .roomsAdapter
        .getActivitiesInRealTime(createdRoom.id);
    });

    it('an activity when a message is posted to the space', async () => {
      await user.sdk.messages.create({
        text: 'Hello World!',
        roomId: createdRoom.id,
      });

      subscription = getActivitiesInRealTime$.subscribe((activity) => {
        expect(activity).to.be.a('string');
      });
    });
  });
});
