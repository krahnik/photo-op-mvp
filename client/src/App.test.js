import React from 'react';
import { render, screen, fireEvent, act, cleanup, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';

// Mock Material-UI components
jest.mock('@mui/material', () => ({
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  Typography: ({ children, ...props }) => <span {...props}>{children}</span>,
  Slider: ({ ...props }) => <input type="range" {...props} />,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Paper: ({ children, ...props }) => <div {...props}>{children}</div>,
  TextField: ({ ...props }) => <input type="text" {...props} />,
  useTheme: () => ({
    palette: {
      background: { paper: '#fff' },
      primary: { main: '#1976d2' },
      text: { primary: '#000' }
    },
    shape: { cardBorderRadius: 8 },
    shadows: ['none', '0px 2px 4px rgba(0,0,0,0.1)'],
    transitions: {
      create: () => 'all 0.3s ease',
      duration: { standard: 300 }
    }
  }),
}));

// Mock Material-UI icons
jest.mock('@mui/icons-material', () => ({
  Camera: () => <span>Camera</span>,
  Refresh: () => <span>Refresh</span>,
  ArrowForward: () => <span>ArrowForward</span>,
  Compare: () => <span>Compare</span>,
  Send: () => <span>Send</span>,
  Tune: () => <span>Tune</span>,
  ExpandLess: () => <span>ExpandLess</span>,
  ExpandMore: () => <span>ExpandMore</span>,
  ArrowBack: () => <span>ArrowBack</span>,
  Email: () => <span>Email</span>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  __esModule: true,
  motion: {
    div: jest.fn().mockImplementation(({ children, ...props }) => <div {...props}>{children}</div>),
    button: jest.fn().mockImplementation(({ children, ...props }) => <button {...props}>{children}</button>),
    img: jest.fn().mockImplementation(({ children, ...props }) => <img {...props}>{children}</img>),
    span: jest.fn().mockImplementation(({ children, ...props }) => <span {...props}>{children}</span>),
    p: jest.fn().mockImplementation(({ children, ...props }) => <p {...props}>{children}</p>),
    a: jest.fn().mockImplementation(({ children, ...props }) => <a {...props}>{children}</a>),
  },
  AnimatePresence: jest.fn().mockImplementation(({ children }) => <>{children}</>),
  MotionConfig: jest.fn().mockImplementation(({ children }) => <>{children}</>),
  useAnimation: jest.fn().mockReturnValue({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useMotionValue: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
    onChange: jest.fn(),
  }),
  useTransform: jest.fn().mockReturnValue({
    get: jest.fn(),
    set: jest.fn(),
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: ({ element }) => element,
  Navigate: () => null,
}));

// Mock AuthContext
jest.mock('./context/AuthContext', () => ({
  AuthProvider: ({ children }) => <div>{children}</div>,
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  Toaster: () => null,
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock react-webcam
let mockOnUserMedia = null;
let mockOnUserMediaError = null;

jest.mock('react-webcam', () => {
  const MockWebcam = function(props) {
    mockOnUserMedia = props.onUserMedia;
    mockOnUserMediaError = props.onUserMediaError;
    return <div data-testid="webcam" />;
  };
  MockWebcam.defaultProps = {
    audio: false,
    screenshotFormat: 'image/jpeg',
    videoConstraints: {}
  };
  MockWebcam.prototype.getScreenshot = () => 'mock-screenshot-data';
  return MockWebcam;
});

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => new Promise(resolve => setTimeout(resolve, 1000)))
}));

// Theme for testing
const theme = {
  photoBoothStyles: {
    container: {
      maxWidth: '800px',
      background: '#ffffff',
      borderRadius: 16,
      padding: '24px',
    },
    preview: {
      borderRadius: 8,
      background: '#f5f5f5',
    },
    captureButton: {
      size: 64,
      background: '#1976d2',
      hoverBackground: '#1565c0',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  shadows: {
    photo: '0 8px 16px rgba(0, 0, 0, 0.1)',
    card: '0 4px 8px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    hover: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  colors: {
    text: {
      disabled: '#9e9e9e',
    },
    photo: {
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
  },
  palette: {
    error: {
      main: '#d32f2f',
      light: '#ef5350',
    },
  },
  transitions: {
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};

describe('App Component', () => {
  // Clean up after each test
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    mockOnUserMedia = null;
    mockOnUserMediaError = null;
  });

  beforeEach(() => {
    cleanup();
    render(
      <MotionConfig reducedMotion="never">
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </MotionConfig>
    );
  });

  test('renders app with initial camera capture step', () => {
    const cameraCapture = screen.getByTestId('camera-capture');
    expect(cameraCapture).toBeInTheDocument();
  });

  test('renders camera icon button', () => {
    const cameraButton = screen.getByRole('button', { name: /camera/i });
    expect(cameraButton).toBeInTheDocument();
  });

  it('renders error message when camera access is denied', async () => {
    // Trigger the error callback
    if (mockOnUserMediaError) {
      mockOnUserMediaError(new Error('Camera access denied'));
    }

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Camera access denied. Please grant permission to use your camera.')).toBeInTheDocument();
    });
  });

  it('renders loading overlay when transforming image', async () => {
    // Trigger the success callback
    if (mockOnUserMedia) {
      mockOnUserMedia();
    }

    // Wait for camera access to be granted
    await waitFor(() => {
      expect(screen.getByTestId('webcam')).toBeInTheDocument();
    });

    // Click the capture button
    const captureButton = screen.getByRole('button', { name: /camera/i });
    fireEvent.click(captureButton);

    // Wait for the loading overlay to appear
    await waitFor(() => {
      expect(screen.getByText('Transforming your image...')).toBeInTheDocument();
      expect(screen.getByText('This may take a minute')).toBeInTheDocument();
    });
  });
});
