import toast from 'react-hot-toast';

// Error types
export const ErrorTypes = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTH: 'AUTH',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN'
};

// Error messages mapping
const ErrorMessages = {
  [ErrorTypes.NETWORK]: {
    title: 'Network Error',
    message: 'Please check your internet connection and try again.',
    duration: 4000
  },
  [ErrorTypes.VALIDATION]: {
    title: 'Invalid Input',
    message: 'Please check your input and try again.',
    duration: 4000
  },
  [ErrorTypes.AUTH]: {
    title: 'Authentication Error',
    message: 'Please log in again to continue.',
    duration: 4000
  },
  [ErrorTypes.SERVER]: {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    duration: 4000
  },
  [ErrorTypes.UNKNOWN]: {
    title: 'Error',
    message: 'An unexpected error occurred. Please try again.',
    duration: 4000
  }
};

// Helper function to determine error type
const getErrorType = (error) => {
  if (!error.response) {
    return ErrorTypes.NETWORK;
  }

  const status = error.response.status;
  
  if (status >= 500) {
    return ErrorTypes.SERVER;
  }
  
  if (status === 401 || status === 403) {
    return ErrorTypes.AUTH;
  }
  
  if (status === 400 || status === 422) {
    return ErrorTypes.VALIDATION;
  }
  
  return ErrorTypes.UNKNOWN;
};

// Helper function to extract error message
const getErrorMessage = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  return error.message || 'An unexpected error occurred';
};

// Main error handler function
export const handleApiError = (error, options = {}) => {
  const {
    customMessage,
    onAuthError,
    onValidationError,
    onServerError,
    onNetworkError,
    onUnknownError,
    showToast = true
  } = options;

  const errorType = getErrorType(error);
  const errorMessage = customMessage || getErrorMessage(error);
  
  // Log error for debugging
  console.error('API Error:', {
    type: errorType,
    message: errorMessage,
    error: error,
    response: error.response?.data
  });

  // Handle specific error types
  switch (errorType) {
    case ErrorTypes.AUTH:
      onAuthError?.(error);
      break;
    case ErrorTypes.VALIDATION:
      onValidationError?.(error);
      break;
    case ErrorTypes.SERVER:
      onServerError?.(error);
      break;
    case ErrorTypes.NETWORK:
      onNetworkError?.(error);
      break;
    default:
      onUnknownError?.(error);
  }

  // Show toast notification if enabled
  if (showToast) {
    const { title, message, duration } = ErrorMessages[errorType];
    toast.error(
      <div>
        <strong>{title}</strong>
        <p>{errorMessage || message}</p>
      </div>,
      { duration }
    );
  }

  // Return error type for further handling if needed
  return errorType;
};

// Helper function to handle image processing errors
export const handleImageError = (error, options = {}) => {
  const {
    onRetry,
    customMessage,
    showToast = true
  } = options;

  const errorMessage = customMessage || 'Failed to process image. Please try again.';

  if (showToast) {
    toast.error(
      <div>
        <strong>Image Processing Error</strong>
        <p>{errorMessage}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        )}
      </div>,
      { duration: 5000 }
    );
  }

  return error;
}; 