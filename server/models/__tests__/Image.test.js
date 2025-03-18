const mongoose = require('mongoose');
const Image = require('../Image');
const User = require('../User');

describe('Image Model', () => {
  let testUser;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  beforeEach(async () => {
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  afterEach(async () => {
    await User.deleteMany();
    await Image.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should create a new image successfully', async () => {
    const imageData = {
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'vintage'
    };

    const savedImage = await Image.create(imageData);
    expect(savedImage._id).toBeDefined();
    expect(savedImage.userId).toEqual(testUser._id);
    expect(savedImage.originalUrl).toBe(imageData.originalUrl);
    expect(savedImage.style).toBe(imageData.style);
    expect(savedImage.status).toBe('pending');
  });

  it('should fail without required fields', async () => {
    const invalidImage = {
      userId: testUser._id
      // Missing originalUrl and style
    };

    await expect(Image.create(invalidImage)).rejects.toThrow();
  });

  it('should validate style options', async () => {
    const imageWithInvalidStyle = {
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'invalid-style'
    };

    await expect(Image.create(imageWithInvalidStyle)).rejects.toThrow();
  });

  it('should update image status', async () => {
    const image = await Image.create({
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'vintage'
    });

    image.status = 'processing';
    await image.save();

    const updatedImage = await Image.findById(image._id);
    expect(updatedImage.status).toBe('processing');
  });

  it('should find images by user', async () => {
    await Image.create([
      {
        userId: testUser._id,
        originalUrl: 'https://example.com/1.jpg',
        style: 'vintage'
      },
      {
        userId: testUser._id,
        originalUrl: 'https://example.com/2.jpg',
        style: 'modern'
      }
    ]);

    const userImages = await Image.find({ userId: testUser._id });
    expect(userImages).toHaveLength(2);
  });

  it('should handle image metadata', async () => {
    const imageWithMetadata = {
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'vintage',
      metadata: {
        width: 800,
        height: 600,
        format: 'jpeg',
        size: 1024000
      }
    };

    const savedImage = await Image.create(imageWithMetadata);
    expect(savedImage.metadata.width).toBe(800);
    expect(savedImage.metadata.height).toBe(600);
    expect(savedImage.metadata.format).toBe('jpeg');
    expect(savedImage.metadata.size).toBe(1024000);
  });

  it('should handle style blending options', async () => {
    const imageWithBlending = {
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'custom',
      styleBlending: {
        enabled: true,
        customPrompt: 'A beautiful sunset with vibrant colors'
      }
    };

    const savedImage = await Image.create(imageWithBlending);
    expect(savedImage.styleBlending.enabled).toBe(true);
    expect(savedImage.styleBlending.customPrompt).toBe(imageWithBlending.styleBlending.customPrompt);
  });

  it('should validate custom prompt length when style blending is enabled', async () => {
    const imageWithShortPrompt = {
      userId: testUser._id,
      originalUrl: 'https://example.com/original.jpg',
      style: 'custom',
      styleBlending: {
        enabled: true,
        customPrompt: 'short' // Too short
      }
    };

    await expect(Image.create(imageWithShortPrompt)).rejects.toThrow();
  });
}); 