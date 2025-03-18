import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';

const PreviewContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const ErrorMessage = styled.div`
  color: #f44336;
  background: #ffebee;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
`;

const ImageInfo = styled.div`
  margin-top: 10px;
  font-size: 14px;
  color: #666;
  text-align: center;
`;

const RetryButton = styled.button`
  margin-left: 10px;
  padding: 5px 10px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const ImagePreview = ({ 
  image, 
  isLoading, 
  error, 
  onRetry,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedFormats = ['image/jpeg', 'image/png']
}) => {
  const [imageInfo, setImageInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);

  // Ensure image is a string or File
  const safeImage = typeof image === 'string' || image instanceof File ? image : null;
  
  // Ensure error messages are strings
  const safeError = typeof error === 'string' ? error : '';
  const safeValidationError = typeof validationError === 'string' ? validationError : '';

  useEffect(() => {
    if (safeImage) {
      validateImage(safeImage);
    }
  }, [safeImage, validateImage, maxSize, acceptedFormats]);

  const validateImage = useCallback((imageData) => {
    setValidationError(null);
    
    // If image is a string (URL or base64)
    if (typeof imageData === 'string') {
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: 'N/A' // Can't get size from URL/base64
        });
      };
      img.onerror = () => {
        setValidationError('Failed to load image');
      };
      img.src = imageData;
      return;
    }

    // If image is a File object
    if (imageData instanceof File) {
      if (!acceptedFormats.includes(imageData.type)) {
        setValidationError(`Invalid file format. Accepted formats: ${acceptedFormats.join(', ')}`);
        return;
      }

      if (imageData.size > maxSize) {
        setValidationError(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: `${(imageData.size / (1024 * 1024)).toFixed(2)}MB`
        });
      };
      img.onerror = () => {
        setValidationError('Failed to load image');
      };
      img.src = URL.createObjectURL(imageData);
    }
  }, [maxSize, acceptedFormats]);

  const handleRetry = () => {
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    }
  };

  return (
    <PreviewContainer>
      <ImageWrapper>
        {safeImage && <PreviewImage src={safeImage} alt="Preview" />}
        {Boolean(isLoading) && (
          <LoadingOverlay>
            <Typography 
              variant="body1"
              component="span"
              sx={{ display: 'block' }}
            >
              Loading image...
            </Typography>
          </LoadingOverlay>
        )}
      </ImageWrapper>
      
      {(safeError || safeValidationError) && (
        <ErrorMessage>
          <Typography 
            variant="body2"
            component="span"
            color="error"
            sx={{ display: 'block' }}
          >
            {safeError || safeValidationError}
          </Typography>
          {onRetry && (
            <RetryButton 
              onClick={handleRetry}
              disabled={Boolean(isLoading)}
              aria-label="Retry loading image"
            >
              Retry
            </RetryButton>
          )}
        </ErrorMessage>
      )}

      {imageInfo && (
        <ImageInfo>
          <Typography 
            variant="body2"
            component="span"
            color="textSecondary"
            sx={{ display: 'block' }}
          >
            {String(`${imageInfo.width} x ${imageInfo.height} pixels${imageInfo.size ? ` • ${imageInfo.size}` : ''}`)}
          </Typography>
        </ImageInfo>
      )}
    </PreviewContainer>
  );
};

export default ImagePreview; 