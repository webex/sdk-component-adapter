// Mock Web Media APIs

global.MediaStream = jest.fn();
global.MediaStream.prototype = {
  getTracks: jest.fn(() => []),
  removeTrack: jest.fn(),
};
