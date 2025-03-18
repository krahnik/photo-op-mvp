module.exports = {
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      transform: {
        '^.+\\.(js|jsx)$': ['babel-jest', { configFile: './client/.babelrc' }]
      },
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
      }
    },
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
    }
  ],
  verbose: true,
  testTimeout: 30000,
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx}',
    'server/**/*.js',
    '!client/src/index.js',
    '!client/src/reportWebVitals.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
}; 