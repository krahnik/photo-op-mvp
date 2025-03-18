const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: true
  },
  transformedUrl: {
    type: String
  },
  style: {
    type: String,
    required: true,
    enum: ['vintage', 'modern', 'artistic', 'minimalist', 'vibrant', 'custom']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number
  },
  styleBlending: {
    enabled: {
      type: Boolean,
      default: false
    },
    customPrompt: {
      type: String,
      validate: {
        validator: function(v) {
          return !this.styleBlending.enabled || (v && v.length >= 10 && v.length <= 200);
        },
        message: 'Custom prompt must be between 10 and 200 characters when style blending is enabled'
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update timestamps
imageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Image = mongoose.model('Image', imageSchema);

module.exports = Image; 