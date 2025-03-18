const { TextEncoder, TextDecoder } = require('util');

// Set up TextEncoder and TextDecoder globally
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Only set up MongoDB for server tests
if (process.env.JEST_WORKER_ID) {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoose = require('mongoose');

  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    global.__MONGO_URI__ = mongoUri;
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });
}

// Only set up React testing utilities for client tests
if (typeof window !== 'undefined') {
  require('@testing-library/jest-dom');

  // Mock window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
} 