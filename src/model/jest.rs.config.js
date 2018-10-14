module.exports = {
  testEnvironment: 'node',
  notify: true,
  transform: {
    '^.+\\.js?$': 'babel-jest',
  },
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
};
