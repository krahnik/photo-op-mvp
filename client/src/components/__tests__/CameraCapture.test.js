import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import CameraCapture from '../CameraCapture';

// Mock react-webcam
jest.mock('react-webcam', () => {
  const mockGetScreenshot = jest.fn().mockReturnValue('mock-screenshot-data');
  
  return {
    __esModule: true,
    default: ({ onUserMedia, onUserMediaError }) => {
      // Simulate camera permission
      if (onUserMedia) {
        setTimeout(() => {
          onUserMedia();
        }, 0);
      }
      
      return {
        getScreenshot: mockGetScreenshot,
      };
    },
  };
});

describe('CameraCapture Component', () => {
  const mockOnCapture = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(<CameraCapture onCapture={mockOnCapture} isLoading={false} />);
  };

  test('renders camera capture component', () => {
    renderComponent();
    expect(screen.getByText('Take a Photo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
  });

  test('capture button is disabled when camera permission is not granted', () => {
    renderComponent();
    const captureButton = screen.getByRole('button', { name: /capture/i });
    expect(captureButton).toBeDisabled();
  });

  test('capture button is enabled when camera permission is granted', async () => {
    renderComponent();
    const captureButton = screen.getByRole('button', { name: /capture/i });
    // Wait for camera permission to be granted
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(captureButton).not.toBeDisabled();
  });

  test('shows error message when camera access is denied', () => {
    // Mock camera access denied
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Camera access denied');
    jest.spyOn(window.navigator.mediaDevices, 'getUserMedia').mockRejectedValue(mockError);
    
    renderComponent();
    expect(screen.getByText(/camera access denied/i)).toBeInTheDocument();
  });

  test('captures image when capture button is clicked', async () => {
    renderComponent();
    // Wait for camera permission to be granted
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);
    
    expect(mockOnCapture).toHaveBeenCalledWith('mock-screenshot-data');
  });

  test('shows loading overlay when isLoading prop is true', () => {
    render(<CameraCapture onCapture={mockOnCapture} isLoading={true} />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  test('shows retake and confirm buttons after capture', async () => {
    renderComponent();
    // Wait for camera permission to be granted
    await new Promise(resolve => setTimeout(resolve, 0));
    
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);
    
    expect(screen.getByRole('button', { name: /retake/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  test('retake button resets the captured image', async () => {
    renderComponent();
    // Wait for camera permission to be granted
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Capture image
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);
    
    // Click retake
    const retakeButton = screen.getByRole('button', { name: /retake/i });
    fireEvent.click(retakeButton);
    
    // Verify we're back to the capture view
    expect(screen.getByRole('button', { name: /capture/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retake/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  test('confirm button sends the captured image', async () => {
    renderComponent();
    // Wait for camera permission to be granted
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Capture image
    const captureButton = screen.getByRole('button', { name: /capture/i });
    fireEvent.click(captureButton);
    
    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    
    expect(mockOnCapture).toHaveBeenCalledWith('mock-screenshot-data');
  });
});
