const mongoose = require('mongoose');
const User = require('../User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  it('should create a new user successfully', async () => {
    const validUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const savedUser = await User.create(validUser);
    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.name).toBe(validUser.name);
    expect(savedUser.password).not.toBe(validUser.password); // Password should be hashed
  });

  it('should fail to create a user with invalid email', async () => {
    const userWithInvalidEmail = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    await expect(User.create(userWithInvalidEmail)).rejects.toThrow();
  });

  it('should fail to create a user with short password', async () => {
    const userWithShortPassword = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'short'
    };

    await expect(User.create(userWithShortPassword)).rejects.toThrow();
  });

  it('should not allow duplicate emails', async () => {
    const user = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    await User.create(user);
    await expect(User.create(user)).rejects.toThrow();
  });

  it('should correctly compare passwords', async () => {
    const password = 'password123';
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password
    });

    const isMatch = await user.comparePassword(password);
    const isNotMatch = await user.comparePassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should update user profile correctly', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    user.name = 'Updated Name';
    await user.save();

    const updatedUser = await User.findById(user._id);
    expect(updatedUser.name).toBe('Updated Name');
  });

  it('should have correct default role', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });

    expect(user.role).toBe('user');
  });

  it('should allow setting admin role', async () => {
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    expect(adminUser.role).toBe('admin');
  });
}); 