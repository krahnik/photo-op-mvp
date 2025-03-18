module.exports = {
  validation: {
    INVALID_FILE_TYPE: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    FILE_TOO_LARGE: 'Image file is too large. Maximum size is 10MB.',
    INVALID_DIMENSIONS: 'Image dimensions must be between 256px and 4096px.',
    NO_FACE_DETECTED: 'No face was detected in the image. Please upload a clear photo with a face.',
    MULTIPLE_FACES: 'Multiple faces detected. Please upload a photo with a single face.',
    LOW_QUALITY: 'Image quality is too low for processing. Please upload a clearer photo.'
  },
  
  processing: {
    PROCESSING_FAILED: 'Image processing failed. Please try again.',
    TIMEOUT: 'Processing timed out. Please try again with a different image.',
    AI_SERVICE_ERROR: 'AI service is currently unavailable. Please try again later.',
    INVALID_THEME: 'Invalid theme selected. Please choose a valid theme.',
    STORAGE_ERROR: 'Failed to store processed image. Please try again.'
  },
  
  auth: {
    UNAUTHORIZED: 'Unauthorized access. Please log in.',
    INVALID_TOKEN: 'Invalid or expired token. Please log in again.',
    INSUFFICIENT_CREDITS: 'Insufficient credits. Please purchase more credits to continue.'
  },
  
  general: {
    INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
    INVALID_REQUEST: 'Invalid request. Please check your input and try again.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.'
  }
}; 