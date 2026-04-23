// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};