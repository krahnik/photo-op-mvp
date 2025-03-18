import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import ImageDisplay from '../ImageDisplay';

describe('ImageDisplay Component', () => {
  const mockProps = {
    originalImage: 'original-image-url',
    transformedImage: 'transformed-image-url',
    onConfirm: jest.fn(),
    onRetry: jest.fn(),
    onAdjustmentsChange: jest.fn(),
    adjustments: {
      brightness: 1,
      contrast: 1,
      saturation: 1,
    },
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<ImageDisplay {...mockProps} {...props} />);
  };

  test('renders image display component', () => {
    renderComponent();
    expect(screen.getByText('Original')).toBeInTheDocument();
    expect(screen.getByText('Transformed')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  test('displays original and transformed images', () => {
    renderComponent();
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('src', 'original-image-url');
    expect(images[1]).toHaveAttribute('src', 'transformed-image-url');
  });

  test('shows adjustments panel', () => {
    renderComponent();
    expect(screen.getByText('Adjustments')).toBeInTheDocument();
    expect(screen.getByLabelText(/brightness/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contrast/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/saturation/i)).toBeInTheDocument();
  });

  test('handles adjustment changes', () => {
    renderComponent();
    const brightnessSlider = screen.getByLabelText(/brightness/i);
    fireEvent.change(brightnessSlider, { target: { value: '1.2' } });
    expect(mockProps.onAdjustmentsChange).toHaveBeenCalledWith({
      ...mockProps.adjustments,
      brightness: 1.2,
    });
  });

  test('handles retry button click', () => {
    renderComponent();
    const retryButton = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryButton);
    expect(mockProps.onRetry).toHaveBeenCalled();
  });

  test('handles confirm button click', () => {
    renderComponent();
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);
    expect(mockProps.onConfirm).toHaveBeenCalled();
  });

  test('disables buttons when loading', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByRole('button', { name: /retry/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeDisabled();
  });

  test('toggles adjustments panel visibility', () => {
    renderComponent();
    const toggleButton = screen.getByRole('button', { name: /adjustments/i });
    fireEvent.click(toggleButton);
    expect(screen.getByText('Adjustments')).not.toBeInTheDocument();
    fireEvent.click(toggleButton);
    expect(screen.getByText('Adjustments')).toBeInTheDocument();
  });

  test('handles image comparison', () => {
    renderComponent();
    const imageContainer = screen.getByTestId('image-container');
    fireEvent.mouseMove(imageContainer, { clientX: 100 });
    const transformedImage = screen.getAllByRole('img')[1];
    expect(transformedImage).toHaveStyle({
      opacity: expect.any(Number),
    });
  });

  test('handles mouse leave during comparison', () => {
    renderComponent();
    const imageContainer = screen.getByTestId('image-container');
    fireEvent.mouseMove(imageContainer, { clientX: 100 });
    fireEvent.mouseLeave(imageContainer);
    const transformedImage = screen.getAllByRole('img')[1];
    expect(transformedImage).toHaveStyle({
      opacity: 1,
    });
  });
}); 