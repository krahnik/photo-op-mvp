import React, { useState, useEffect, useCallback } from 'react';
import CameraCapture from './CameraCapture';
import ImageDisplay from './ImageDisplay';
import EmailCapture from './EmailCapture';
import TransformationStyles from './TransformationStyles';
import { Typography } from '@mui/material';
import { ContentContainer } from './styled/index';
import styled from 'styled-components';
import CircularProgress from '@mui/material/CircularProgress';
import { pollTransformationStatus } from '../api/transformations';

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.photo.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: white;
`;

const AppContent = () => {
  const [step, setStep] = useState('capture');
  const [capturedImage, setCapturedImage] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transformationId, setTransformationId] = useState(null);
  const [error, setError] = useState(null);

  const handleCapture = useCallback((imageData) => {
    setCapturedImage(imageData);
    setStep('style');
  }, []);

  const handleStyleSelect = useCallback((style) => {
    setSelectedStyle(style);
  }, []);

  const handleTransform = useCallback(async () => {
    if (!selectedStyle || !capturedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', capturedImage);
      formData.append('style', selectedStyle.prompt);

      const response = await fetch('/api/transform', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to start transformation');
      }

      const data = await response.json();
      setTransformationId(data.transformationId);
      setStep('processing');
    } catch (err) {
      setError(err.message);
      setStep('style');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStyle, capturedImage]);

  const handleEmailSubmit = useCallback(async (email) => {
    if (!email || !transformedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          imageUrl: transformedImage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setStep('complete');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [transformedImage]);

  const handleRetry = useCallback(() => {
    setCapturedImage(null);
    setTransformedImage(null);
    setSelectedStyle(null);
    setError(null);
    setStep('capture');
  }, []);

  useEffect(() => {
    if (transformationId) {
      pollTransformationStatus(transformationId)
        .then(result => {
          setTransformedImage(result.transformedImageUrl);
          setStep('preview');
        })
        .catch(err => {
          setError(err.message);
          setStep('style');
        });
    }
  }, [transformationId]);

  useEffect(() => {
    return () => {
      if (transformedImage && transformedImage.startsWith('blob:')) {
        URL.revokeObjectURL(transformedImage);
      }
    };
  }, [transformedImage]);

  return (
    <ContentContainer>
      {isLoading && (
        <LoadingOverlay>
          <SpinnerWrapper>
            <CircularProgress size={48} color="inherit" />
            <Typography component="span" variant="h6">
              {step === 'style' ? 'Transforming your photo...' : 'Processing...'}
            </Typography>
          </SpinnerWrapper>
        </LoadingOverlay>
      )}

      {error && (
        <Typography component="div" color="error" align="center" sx={{ mt: 2, mb: 2 }}>
          {error}
        </Typography>
      )}

      {step === 'capture' && (
        <CameraCapture onCapture={handleCapture} />
      )}

      {step === 'style' && capturedImage && (
        <TransformationStyles
          selectedStyle={selectedStyle}
          onStyleSelect={handleStyleSelect}
          onTransform={handleTransform}
          imagePreview={capturedImage}
        />
      )}

      {step === 'processing' && (
        <ImageDisplay
          originalImage={capturedImage}
          transformedImage={null}
          isLoading={true}
          transformationId={transformationId}
        />
      )}

      {step === 'preview' && transformedImage && (
        <ImageDisplay
          originalImage={capturedImage}
          transformedImage={transformedImage}
          onRetry={handleRetry}
          onContinue={() => setStep('email')}
        />
      )}

      {step === 'email' && transformedImage && (
        <EmailCapture
          onSubmit={handleEmailSubmit}
          onBack={() => setStep('preview')}
        />
      )}

      {step === 'complete' && (
        <div>
          <Typography component="h2" variant="h5" align="center">
            Success! Check your email for your transformed photos.
          </Typography>
          <button onClick={handleRetry}>Transform Another Photo</button>
        </div>
      )}
    </ContentContainer>
  );
};

export default AppContent; 