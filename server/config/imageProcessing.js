module.exports = {
  // Image size constraints
  maxImageSize: 10 * 1024 * 1024, // 10MB
  minImageDimension: 256,
  maxImageDimension: 4096,
  
  // Supported file formats
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Processing options
  outputFormat: 'webp',
  outputQuality: 90,
  
  // Face detection settings
  faceDetection: {
    minConfidence: 0.8,
    maxFaces: 1
  },
  
  // Processing timeouts (in milliseconds)
  timeouts: {
    processing: 30000,
    validation: 10000
  }
}; 