module.exports = {
  // notify: true,
  // testEnvironment: './graphql-environment.js',
  transform: {
    '^.+\\.js?$': 'babel-jest',
  },
  testURL: 'http://localhost/', // https://github.com/facebook/jest/issues/6769
};
