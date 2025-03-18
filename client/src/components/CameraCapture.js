import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton, Typography } from '@mui/material';
import { Camera, Refresh, ArrowForward } from '@mui/icons-material';

const CameraContainer = styled(motion.div)`
  width: 100%;
  max-width: ${props => props.theme.photoBoothStyles.container.maxWidth || '800px'};
  margin: 0 auto;
  background: ${props => props.theme.photoBoothStyles.container.background};
  border-radius: ${props => props.theme.photoBoothStyles.container.borderRadius}px;
  padding: ${props => props.theme.photoBoothStyles.container.padding};
  box-shadow: ${props => props.theme.shadows.photo};
`;

const CameraView = styled(motion.div)`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.photoBoothStyles.preview.borderRadius}px;
  overflow: hidden;
  background: ${props => props.theme.photoBoothStyles.preview.background};
  box-shadow: ${props => props.theme.shadows.card};
`;

const CaptureButton = styled(motion.button)`
  position: relative;
  width: ${props => props.theme.photoBoothStyles.captureButton.size}px;
  height: ${props => props.theme.photoBoothStyles.captureButton.size}px;
  border-radius: 50%;
  background: ${props => props.theme.photoBoothStyles.captureButton.background};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.theme.photoBoothStyles.captureButton.shadow};
  transition: all 0.3s ${props => props.theme.transitions.easing.easeInOut};

  &:hover {
    background: ${props => props.theme.photoBoothStyles.captureButton.hoverBackground};
    transform: scale(1.05);
  }

  &:disabled {
    background: ${props => props.theme.colors.text.disabled};
    cursor: not-allowed;
    transform: none;
  }

  svg {
    color: white;
    font-size: 32px;
  }
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
`;

const LoadingOverlay = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.theme.colors.photo.overlay};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ErrorMessage = styled(motion.div)`
  color: ${props => props.theme.palette.error.main};
  background: ${props => props.theme.palette.error.light}20;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 16px 0;
  text-align: center;
  font-size: 14px;
`;

const CameraCapture = ({ onCapture, isLoading }) => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [error, setError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const handleUserMedia = useCallback(() => {
    setIsPermissionGranted(true);
    setError(null);
  }, []);

  const handleUserMediaError = useCallback((error) => {
    setError('Camera access denied. Please grant permission to use your camera.');
    setIsPermissionGranted(false);
  }, []);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      if (onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    if (onCapture) {
      onCapture(null);
    }
  }, [onCapture]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  return (
    <CameraContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        ease: "easeOut"
      }}
    >
      <CameraView>
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div
              key="webcam"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ height: '100%' }}
            >
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                onUserMedia={handleUserMedia}
                onUserMediaError={handleUserMediaError}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </motion.div>
          ) : (
            <motion.img 
              key="preview"
              src={capturedImage} 
              alt="Captured"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
        </AnimatePresence>

        {isLoading && (
          <LoadingOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              Transforming image...
            </Typography>
            <Typography variant="body2">
              This may take a moment
            </Typography>
          </LoadingOverlay>
        )}
      </CameraView>

      <AnimatePresence mode="wait">
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      <ButtonContainer>
        {!capturedImage ? (
          <CaptureButton 
            onClick={capture}
            disabled={!isPermissionGranted}
            whileTap={{ scale: 0.95 }}
          >
            <Camera />
          </CaptureButton>
        ) : (
          <>
            <IconButton 
              onClick={retake}
              disabled={isLoading}
              sx={{ 
                backgroundColor: 'background.paper',
                boxShadow: theme => theme.shadows.button,
                '&:hover': {
                  backgroundColor: 'background.paper',
                  boxShadow: theme => theme.shadows.hover
                }
              }}
            >
              <Refresh />
            </IconButton>
            <IconButton
              color="primary"
              onClick={() => onCapture(capturedImage)}
              disabled={isLoading}
              sx={{ 
                backgroundColor: 'primary.main',
                color: 'white',
                boxShadow: theme => theme.shadows.button,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: theme => theme.shadows.hover
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}
      </ButtonContainer>
    </CameraContainer>
  );
};

export default CameraCapture; 