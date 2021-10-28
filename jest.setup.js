import logger from './src/logger';

// set the error level
logger.setLevel('error');

// Mock Web Media APIs

global.MediaStream = jest.fn(function(tracksOrStream = []) {
  let tracks;

  if (tracksOrStream instanceof global.MediaStream) {
    tracks = [...tracksOrStream.getTracks()];
  } else {
    tracks = tracksOrStream;
  }

  for (const track of tracks) {
    if (!('enabled' in track)) {
      track.enabled = true;
    }

    if (!('stop' in track)) {
      Object.defineProperty(track, 'stop', {
        value: jest.fn(),
        enumerable: false,
      });
    }
  }

  return Object.assign(this, {
    getTracks: jest.fn(() => tracks),
    getAudioTracks: jest.fn(() => tracks.filter((track) => track.kind === 'audio')),
    getVideoTracks: jest.fn(() => tracks.filter((track) => track.kind === 'video')),
    removeTrack: jest.fn((toRemove) => tracks.filter((track) => track !== toRemove)),
  });
});

expect.extend({
  /**
   * Custom jest matcher that checks that two media streams have the same tracks
   *
   * @param {MediaStream} received
   * @param {MediaStream} expected
   * @returns {object}
   */
  toMatchMediaStream(received, expected) {
    const options = {
      comment: 'Object.is equality',
      isNot: this.isNot,
      promise: this.promise,
    };

    const pass = this.equals(received.getTracks(), expected.getTracks());

    const message = () => `${this.utils.matcherHint('toMatchMediaStream', undefined, undefined, options)}\n
Expected: ${this.utils.printExpected(expected && expected.getTracks())}
Received: ${this.utils.printReceived(received && received.getTracks())}`;

    return {
      actual: received,
      message,
      pass,
    };
  },
});

global.document = {
  createElement: (type) => {
    const elem = {};

    if (type === 'audio' || type === 'video') {
      elem.setSinkId = () => {};
    }

    return elem;
  },
};
