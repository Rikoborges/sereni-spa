module.exports = {
  testEnvironment: 'node',
  testTimeout: 30000,
  setupFiles: ['dotenv/config'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  coveragePathIgnorePatterns: ['/node_modules/']
};