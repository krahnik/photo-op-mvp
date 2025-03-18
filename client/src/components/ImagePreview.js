import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

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

  useEffect(() => {
    if (image) {
      validateImage(image);
    }
  }, [image]);

  const validateImage = (imageData) => {
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
  };

  return (
    <PreviewContainer>
      <ImageWrapper>
        {image && <PreviewImage src={image} alt="Preview" />}
        {isLoading && (
          <LoadingOverlay>
            <div>Loading image...</div>
          </LoadingOverlay>
        )}
      </ImageWrapper>
      
      {(error || validationError) && (
        <ErrorMessage>
          {error || validationError}
          {onRetry && (
            <button 
              onClick={onRetry}
              style={{
                marginLeft: '10px',
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
        </ErrorMessage>
      )}

      {imageInfo && (
        <ImageInfo>
          {imageInfo.width} x {imageInfo.height} pixels
          {imageInfo.size && ` • ${imageInfo.size}`}
        </ImageInfo>
      )}
    </PreviewContainer>
  );
};

export default ImagePreview; 