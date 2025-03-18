import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { MotionConfig } from 'framer-motion';
import TransformationStyles from '../TransformationStyles';

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
  },
  shadows: {
    photo: '0 8px 16px rgba(0, 0, 0, 0.1)',
    card: '0 4px 8px rgba(0, 0, 0, 0.1)',
    button: '0 2px 4px rgba(0, 0, 0, 0.1)',
    hover: '0 4px 8px rgba(0, 0, 0, 0.2)',
  },
  palette: {
    background: {
      paper: '#ffffff',
    },
    primary: {
      main: '#1976d2',
      dark: '#1565c0',
    },
  },
  shape: {
    cardBorderRadius: 8,
  },
};

describe('TransformationStyles Component', () => {
  const mockStyles = [
    { id: 'style1', name: 'Style 1', description: 'Description 1', preview: 'preview1.jpg' },
    { id: 'style2', name: 'Style 2', description: 'Description 2', preview: 'preview2.jpg' },
    { id: 'style3', name: 'Style 3', description: 'Description 3', preview: 'preview3.jpg' },
  ];

  const mockProps = {
    styles: mockStyles,
    selectedStyle: 'style1',
    onStyleSelect: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MotionConfig reducedMotion="never">
        <ThemeProvider theme={theme}>
          <TransformationStyles {...mockProps} {...props} />
        </ThemeProvider>
      </MotionConfig>
    );
  };

  test('renders transformation styles component', () => {
    renderComponent();
    expect(screen.getByText('Choose Your Style')).toBeInTheDocument();
    expect(screen.getByText('Select a style to transform your photo')).toBeInTheDocument();
  });

  test('displays all available styles', () => {
    renderComponent();
    mockStyles.forEach(style => {
      expect(screen.getByText(style.name)).toBeInTheDocument();
      expect(screen.getByText(style.description)).toBeInTheDocument();
    });
  });

  test('displays style preview images', () => {
    renderComponent();
    mockStyles.forEach(style => {
      const image = screen.getByAltText(`${style.name} preview`);
      expect(image).toHaveAttribute('src', style.preview);
    });
  });

  test('handles style selection', () => {
    renderComponent();
    const styleButton = screen.getByText('Style 2');
    fireEvent.click(styleButton);
    expect(mockProps.onStyleSelect).toHaveBeenCalledWith('style2');
  });

  test('highlights selected style', () => {
    renderComponent();
    const selectedStyle = screen.getByText('Style 1').closest('button');
    expect(selectedStyle).toHaveStyle({
      backgroundColor: theme.palette.primary.main,
      color: '#ffffff',
    });
  });

  test('disables styles during loading', () => {
    renderComponent({ isLoading: true });
    const styleButtons = screen.getAllByRole('button');
    styleButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('shows loading indicator on selected style', () => {
    renderComponent({ isLoading: true });
    const selectedStyle = screen.getByText('Style 1').closest('button');
    expect(selectedStyle).toHaveTextContent('Loading...');
  });

  test('applies hover styles to style buttons', () => {
    renderComponent();
    const styleButton = screen.getByText('Style 1').closest('button');
    expect(styleButton).toHaveStyle({
      boxShadow: theme.shadows.button,
      transition: expect.stringContaining('box-shadow'),
    });
  });

  test('handles empty styles array', () => {
    renderComponent({ styles: [] });
    expect(screen.getByText('No styles available')).toBeInTheDocument();
  });

  test('maintains accessibility attributes', () => {
    renderComponent();
    const styleButtons = screen.getAllByRole('button');
    styleButtons.forEach(button => {
      expect(button).toHaveAttribute('aria-label');
      expect(button).toHaveAttribute('aria-pressed');
    });
  });

  test('handles style selection with keyboard navigation', () => {
    renderComponent();
    const styleButton = screen.getByText('Style 2');
    fireEvent.keyDown(styleButton, { key: 'Enter', code: 'Enter' });
    expect(mockProps.onStyleSelect).toHaveBeenCalledWith('style2');
  });
}); 