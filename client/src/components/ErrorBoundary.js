import React from 'react';
import { toast } from 'react-hot-toast';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  min-height: 200px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 2rem;
`;

const ErrorHeading = styled.h2`
  color: #f44336;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  color: #666;
  margin-bottom: 1.5rem;
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: #45a049;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorMessage: '' 
    };
  }

  static getDerivedStateFromError(error) {
    // Convert error to string if it's an object
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { 
      hasError: true, 
      errorMessage 
    };
  }

  componentDidCatch(error, errorInfo) {
    // Convert error to string if it's an object
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Log error to error tracking service
    console.error('Error caught by boundary:', {
      error: errorMessage,
      componentStack: errorInfo.componentStack
    });
    
    // Show error toast with safe string message
    toast.error('Something went wrong. Please try again.');
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorHeading>Something went wrong</ErrorHeading>
          <ErrorMessage>
            <div>We apologize for the inconvenience. Please try refreshing the page.</div>
            {this.state.errorMessage && (
              <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#999' }}>
                Error details: {this.state.errorMessage}
              </div>
            )}
          </ErrorMessage>
          <RefreshButton onClick={() => window.location.reload()}>
            Refresh Page
          </RefreshButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 