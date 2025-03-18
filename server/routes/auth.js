const express = require('express');
const router = express.Router();
const { z } = require('zod');
const { authLimiter } = require('../middleware/security');
const {
  validatePassword,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  checkLockout,
  recordFailedAttempt,
  resetFailedAttempts,
  getFailedAttempts
} = require('../utils/authUtils');

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(),
});

// Apply rate limiting to all auth routes
router.use(authLimiter);

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Invalid password',
        details: passwordValidation.errors
      });
    }

    // Check if user exists
    const existingUser = await req.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      lastLogin: null,
      failedLoginAttempts: 0,
      accountLocked: false,
      lockoutUntil: null
    };

    await req.db.collection('users').insertOne(user);

    // Generate token
    const token = generateToken(user._id, user.email);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Check for account lockout
    const lockoutStatus = checkLockout(email);
    if (lockoutStatus.locked) {
      return res.status(429).json({
        status: 'error',
        message: 'Account is temporarily locked for security.',
        details: {
          remainingTime: Math.ceil(lockoutStatus.remainingTime / 60),
          unit: 'minutes'
        }
      });
    }

    // Find user
    const user = await req.db.collection('users').findOne({ email });
    if (!user) {
      recordFailedAttempt(email);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      recordFailedAttempt(email);
      const attempts = await getFailedAttempts(email);
      const remainingAttempts = Math.max(0, 5 - attempts);
      
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password',
        details: {
          remainingAttempts,
          warning: remainingAttempts <= 2 ? `${remainingAttempts} attempts remaining before temporary lockout` : null
        }
      });
    }

    // Reset failed attempts on successful login
    await resetFailedAttempts(email);

    // Update user's last login
    await req.db.collection('users').updateOne(
      { _id: user._id },
      {
        $set: {
          lastLogin: new Date(),
          failedLoginAttempts: 0,
          accountLocked: false,
          lockoutUntil: null
        }
      }
    );

    // Generate token
    const token = generateToken(user._id, user.email);

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'An unexpected error occurred. Please try again later.'
    });
  }
});

// Validate token route
router.get('/validate', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const user = await req.db.collection('users').findOne(
      { _id: decoded.userId },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 