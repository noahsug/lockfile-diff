const mockFs = require('mock-fs');

let logCalled = false;
function fixMockFs() {
  /**
   * mock-fs doesn't play well with Jest's implementation of console.log.
   * When you call console.log in jest, it does a lazy require of the code to
   * handle the log (jest is multithreaded, and interactive, so logging isn't
   * straightforward), but this will fail if the file system has been mocked.
   *
   * The fix is just to call console.log before mocking the filesystem, which
   * evaluates the require.
   *
   * https://github.com/facebook/jest/issues/5792
   */
  if (!logCalled) {
    // eslint-disable-next-line no-console
    console.log('Writing a log to avoid this bug: https://github.com/facebook/jest/issues/5792');
    logCalled = true;
  }
}

beforeEach(() => {
  fixMockFs();
});

afterEach(() => {
  mockFs.restore();
});
