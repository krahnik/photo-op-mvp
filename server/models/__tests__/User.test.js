const mongoose = require('mongoose');
const User = require('../User');
const { createTestUser } = require('../../../test/helpers');

describe('User Model', () => {
  it('should create a new user successfully', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User'
    };

    const user = await User.create(userData);

    expect(user.email).toBe(userData.email);
    expect(user.name).toBe(userData.name);
    expect(user.password).not.toBe(userData.password); // Password should be hashed
    expect(user.role).toBe('user'); // Default role
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  it('should validate email format', async () => {
    const userData = {
      email: 'invalid-email',
      password: 'Test123!',
      name: 'Test User'
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should validate password complexity', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'weak',
      name: 'Test User'
    };

    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should not allow duplicate emails', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User'
    };

    await User.create(userData);
    await expect(User.create(userData)).rejects.toThrow();
  });

  it('should compare passwords correctly', async () => {
    const user = await createTestUser();
    const correctPassword = 'Test123!';
    const wrongPassword = 'WrongPass123!';

    expect(await user.comparePassword(correctPassword)).toBe(true);
    expect(await user.comparePassword(wrongPassword)).toBe(false);
  });

  it('should update user profile', async () => {
    const user = await createTestUser();
    const updateData = {
      name: 'Updated Name'
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      { new: true }
    );

    expect(updatedUser.name).toBe(updateData.name);
    expect(updatedUser.email).toBe(user.email); // Email should not change
  });

  it('should handle role-based access', async () => {
    const adminUser = await createTestUser({ role: 'admin' });
    const regularUser = await createTestUser({ role: 'user' });

    expect(adminUser.isAdmin()).toBe(true);
    expect(regularUser.isAdmin()).toBe(false);
  });
}); 