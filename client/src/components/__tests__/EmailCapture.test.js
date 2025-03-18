import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import EmailCapture from '../EmailCapture';

describe('EmailCapture Component', () => {
  const mockProps = {
    transformedImage: 'transformed-image-url',
    onSubmit: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(<EmailCapture {...mockProps} {...props} />);
  };

  test('renders email capture component', () => {
    renderComponent();
    expect(screen.getByText('Get Your Transformed Photo')).toBeInTheDocument();
    expect(screen.getByText('Enter your details below and we\'ll send your transformed photo directly to your inbox.')).toBeInTheDocument();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('displays transformed image', () => {
    renderComponent();
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', 'transformed-image-url');
    expect(image).toHaveAttribute('alt', 'Your transformed photo');
  });

  test('handles form submission with valid data', async () => {
    renderComponent();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    expect(mockProps.onSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });

  test('handles back button click', () => {
    renderComponent();
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(mockProps.onBack).toHaveBeenCalled();
  });

  test('validates email format', async () => {
    renderComponent();
    
    // Fill in the form with invalid email
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'invalid-email' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Check for validation message
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    
    // Verify onSubmit was not called
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  test('validates required fields', async () => {
    renderComponent();
    
    // Submit the form without filling in fields
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Check for validation messages
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    
    // Verify onSubmit was not called
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  test('handles loading state', () => {
    renderComponent({ isLoading: true });
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  test('handles error state', () => {
    const errorMessage = 'Failed to send email. Please try again.';
    renderComponent({ error: errorMessage });
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('clears form after successful submission', async () => {
    renderComponent();
    
    // Fill in the form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    
    // Verify form is cleared
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
  });
}); 