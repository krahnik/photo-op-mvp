// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const axios = require('axios');
const { config } = require('dotenv');
const authRoutes = require('./routes/auth');
const imageRoutes = require('./routes/image');
const trackingRoutes = require('./routes/tracking');
const monitoringRoutes = require('./routes/monitoring');
const {
  limiter,
  authLimiter,
  uploadLimiter,
  securityHeaders,
  xss,
  hpp,
  mongoSanitize,
  fileUploadSecurity,
} = require('./middleware/security');
const { performanceMiddleware, metricsHandler } = require('./utils/performanceMonitor');
const { logSecurityEvent, SecurityEventType, SecuritySeverity } = require('./utils/securityLogger');
const { encryptFields, decryptFields } = require('./utils/encryption');
const { authenticateAdmin } = require('./middleware/auth');

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 5000;

const themePrompts = require('./config/themePrompts');
const AIService = require('./services/aiService');

// Mailgun configuration
const mailgun = new Mailgun(formData);
const mailgunClient = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net' // Adding explicit API URL
});

// Middleware
app.use(securityHeaders);
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Database middleware
app.use((req, res, next) => {
  req.db = mongoose.connection.db;
  next();
});

// Store uploads in a temp folder
const upload = multer({ dest: 'uploads/' });

// Service URLs
const AI_SERVICE_URL = 'http://localhost:5002';
const DB_SERVICE_URL = 'http://localhost:5003';

app.post('/transform', upload.single('image'), async (req, res) => {
  try {
    const { theme, photo, email, name, eventId } = req.body;
    const prompt = themePrompts[theme] || "A photo of a person";

    console.log("Transform route hit with prompt:", prompt);
    
    // Process image with advanced AI features including face preservation
    const aiResult = await AIService.processImage({
      image: fs.createReadStream(req.file.path),
      style: theme,
      adjustments: {
        prompt,
        strength: 0.6,
        guidance_scale: 7.5,
        num_inference_steps: 50
      },
      quality: {
        nsfw_detection: true,
        image_quality: true,
        style_consistency: true,
        watermarking: true,
        face_preservation: true // Enable face preservation
      }
    });

    // Upload original and transformed images to S3
    const originalImageData = new FormData();
    originalImageData.append('file', fs.createReadStream(req.file.path));
    
    const transformedImageData = new FormData();
    const transformedImageBuffer = Buffer.from(aiResult.image, 'base64');
    transformedImageData.append('file', transformedImageBuffer, 'transformed.png');

    const [originalUpload, transformedUpload] = await Promise.all([
      axios.post(`${DB_SERVICE_URL}/upload-image`, originalImageData),
      axios.post(`${DB_SERVICE_URL}/upload-image`, transformedImageData)
    ]);

    // Create user lead if email is provided
    if (email && name) {
      const userLead = {
        email,
        name,
        event_id: eventId,
        images: [{
          original_image_path: originalUpload.data.url,
          transformed_image_path: transformedUpload.data.url,
          transformation_style: theme,
          quality_metrics: aiResult.quality_metrics,
          face_metrics: aiResult.face_metrics // Store face preservation metrics
        }]
      };

      await axios.post(`${DB_SERVICE_URL}/user-lead`, userLead);
    }

    // Clean up temp file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      original_url: originalUpload.data.url,
      transformed_url: transformedUpload.data.url,
      quality_metrics: aiResult.quality_metrics,
      face_metrics: aiResult.face_metrics
    });
  } catch (err) {
    console.error('Error processing image:', err.message);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Image processing failed'
    });
  }
});

app.post('/sendEmail', async (req, res) => {
  try {
    const { email, imageUrl } = req.body;
    console.log('Sending email to:', email, 'with imageUrl:', imageUrl);

    const messageData = {
      from: 'postmaster@sandboxd665523be94b4023a5e1a3584793c61c.mailgun.org',
      to: email,
      subject: 'Your AI-Transformed Photo!',
      html: `
        <h1>Here is your AI photo!</h1>
        <p>We hope you enjoyed this AI experience.</p>
        <img src="${imageUrl}" alt="Transformed Photo" style="max-width: 600px;" />
        <p><a href="${imageUrl}" download>Click here</a> to download your image.</p>
      `
    };

    const responseData = await mailgunClient.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );

    console.log('Mailgun response:', responseData);
    res.json({ success: true, message: 'Email sent!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/images', uploadLimiter, fileUploadSecurity, imageRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Apply performance monitoring middleware
app.use(performanceMiddleware);

// Add metrics endpoint (protected by admin authentication)
app.get('/metrics', authenticateAdmin, metricsHandler);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

