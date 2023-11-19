module.exports = {
  clearMocks: true,
  setupFilesAfterEnv: ['jest-extended/all'],
  globalSetup: '<rootDir>/test/__jest__/globalSetup.js',
  globalTeardown: '<rootDir>/test/__jest__/globalTeardown.js',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
}
