const jwt = require('jsonwebtoken');
const User = require('../server/models/User');
const Image = require('../server/models/Image');

const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User',
    role: 'user',
    ...userData
  };

  const user = await User.create(defaultUser);
  return user;
};

const createTestImage = async (imageData = {}) => {
  const defaultImage = {
    userId: imageData.userId || (await createTestUser())._id,
    originalUrl: 'https://example.com/test.jpg',
    transformedUrl: 'https://example.com/transformed.jpg',
    style: 'anime',
    status: 'completed',
    ...imageData
  };

  const image = await Image.create(defaultImage);
  return image;
};

const generateTestToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

const createTestRequest = (user, body = {}, params = {}, query = {}) => {
  return {
    user,
    body,
    params,
    query,
    headers: {
      authorization: `Bearer ${generateTestToken(user)}`
    }
  };
};

const createTestResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis()
  };
  return res;
};

module.exports = {
  createTestUser,
  createTestImage,
  generateTestToken,
  createTestRequest,
  createTestResponse
}; 