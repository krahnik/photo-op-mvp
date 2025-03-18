// client/src/App.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import CameraCapture from './components/CameraCapture';
import ImageDisplay from './components/ImageDisplay';
import EmailCapture from './components/EmailCapture';
import TransformationStyles, { styles } from './components/TransformationStyles';
import { config } from './config';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ProgressIndicator from './components/ProgressBar';
import ImagePreview from './components/ImagePreview';
import { handleApiError, handleImageError, ErrorTypes } from './utils/errorHandler';
import { trackImageOperation, updateTrackingStatus, TrackingStatus } from './utils/tracking';
import StyleBlending from './components/StyleBlending';
import { PromptValidator } from './utils/promptValidator';
import { Typography } from '@mui/material';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");
    z-index: 0;
  }
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  font-size: 1.5em;
`;

const LoadingSpinner = styled.div`
  border: 5px solid #f3f3f3;
  border-top: 5px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AppContent = () => {
  const [step, setStep] = useState('capture');
  const [capturedImage, setCapturedImage] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('futuristic');
  const [isLoading, setIsLoading] = useState(false);
  const [adjustments, setAdjustments] = useState({
    strength: 0.6,
    guidance_scale: 7.5,
    num_inference_steps: 50,
  });
  const [transformationId, setTransformationId] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [styleBlendingEnabled, setStyleBlendingEnabled] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [promptError, setPromptError] = useState('');

  const handleImageCapture = async (imageData) => {
    if (!imageData) return;
    
    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('image', dataURItoBlob(imageData));
      formData.append('prompt', `a ${selectedStyle} style portrait`);
      
      // Generate a unique request ID
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Track initial upload
      await trackImageOperation({
        request_id: requestId,
        filename: 'captured_image.jpg',
        status: TrackingStatus.UPLOADED,
        metadata: {
          style: selectedStyle,
          timestamp: new Date().toISOString()
        }
      });

      console.log('Sending request to server...');
      const response = await axios.post(`${config.serverUrl}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      console.log('Received response from server:', response.data);

      if (response.data.success) {
        // Update tracking status to processing
        await updateTrackingStatus(requestId, TrackingStatus.PROCESSING);

        // Convert base64 image to blob URL
        const imageBlob = new Blob(
          [Uint8Array.from(atob(response.data.image), c => c.charCodeAt(0))],
          { type: 'image/png' }
        );
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log('Created blob URL for transformed image');
        setTransformedImage(imageUrl);
        setTransformationId(requestId);
        console.log('Set transformation ID:', requestId);
        setStep('preview');

        // Update tracking status to completed
        await updateTrackingStatus(requestId, TrackingStatus.COMPLETED, {
          transformed_image_url: imageUrl
        });
      } else {
        throw new Error('No image data in response');
      }
    } catch (error) {
      // Update tracking status to failed
      if (transformationId) {
        await updateTrackingStatus(transformationId, TrackingStatus.FAILED, {
          error: error.message
        });
      }
      
      handleImageError(error, {
        onRetry: () => {
          setStep('capture');
          setCapturedImage(null);
          setSelectedStyle(null);
        }
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleAdjustmentsChange = async (newAdjustments) => {
    console.log('Handling adjustments change:', newAdjustments);
    if (!capturedImage) {
      console.log('No captured image available, returning');
      return;
    }
    
    setIsLoading(true);
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append('image', dataURItoBlob(capturedImage));
      
      const selectedStyleObj = styles.find(s => s.id === selectedStyle);
      console.log('Using style:', selectedStyleObj);
      formData.append('prompt', selectedStyleObj.prompt);
      
      Object.keys(newAdjustments).forEach(key => {
        formData.append(key, newAdjustments[key]);
      });

      // Update tracking status to processing for adjustments
      if (transformationId) {
        await updateTrackingStatus(transformationId, TrackingStatus.PROCESSING, {
          adjustments: newAdjustments
        });
      }

      console.log('Sending adjustment request...');
      const response = await axios.post(`${config.serverUrl}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      console.log('Received adjustment response:', response.data);

      if (response.data.success) {
        // Convert base64 image to blob URL
        const imageBlob = new Blob(
          [Uint8Array.from(atob(response.data.image), c => c.charCodeAt(0))],
          { type: 'image/png' }
        );
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log('Created blob URL for transformed image');
        setTransformedImage(imageUrl);
        setTransformationId(response.data.request_id);
        console.log('Set transformation ID:', response.data.request_id);
        setAdjustments(newAdjustments);

        // Update tracking status to completed for adjustments
        if (transformationId) {
          await updateTrackingStatus(transformationId, TrackingStatus.COMPLETED, {
            adjustments: newAdjustments,
            transformed_image_url: imageUrl
          });
        }
      } else {
        throw new Error('No image data in response');
      }
    } catch (error) {
      // Update tracking status to failed for adjustments
      if (transformationId) {
        await updateTrackingStatus(transformationId, TrackingStatus.FAILED, {
          error: error.message,
          adjustments: newAdjustments
        });
      }

      handleImageError(error, {
        onRetry: () => {
          setStep('capture');
          setCapturedImage(null);
          setTransformedImage(null);
          setSelectedStyle(null);
        }
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEmailSubmit = async (formData) => {
    setIsLoading(true);
    try {
      if (!transformationId) {
        console.error('No transformation ID available');
        handleApiError(new Error('Please wait for the image transformation to complete before sending email.'), {
          showToast: true
        });
        setIsLoading(false);
        return;
      }

      console.log('Sending email request with data:', {
        email: formData.email,
        name: formData.name,
        request_id: transformationId
      });

      // Create FormData to handle both text and image data
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('request_id', transformationId);
      
      const response = await axios.post(`${config.serverUrl}/sendEmail`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Email response:', response);

      if (response.data.success) {
        // Update tracking status to emailed
        await updateTrackingStatus(transformationId, TrackingStatus.EMAILED, {
          email: formData.email,
          name: formData.name
        });

        toast.success('Email sent successfully!');
        // Reset the app
        setStep('capture');
        setCapturedImage(null);
        setTransformedImage(null);
        setTransformationId(null);
      } else {
        throw new Error(response.data.error || 'Failed to send email');
      }
    } catch (error) {
      handleApiError(error, {
        customMessage: 'Failed to send email',
        onAuthError: () => {
          // Handle authentication error (e.g., redirect to login)
          setStep('capture');
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dataURItoBlob = (dataURI) => {
    console.log('Converting dataURI to Blob...');
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    console.log('Blob created with type:', mimeString);
    return blob;
  };

  const pollTransformationStatus = async (id) => {
    try {
      const response = await axios.get(`${config.serverUrl}/status/${id}`);
      if (response.data.status === 'completed') {
        setTransformedImage(`${config.serverUrl}/image/${id}`);
        setIsLoading(false);
        setStep('preview');
        return true;
      } else if (response.data.status === 'failed') {
        alert('Error transforming image. Please try again.');
        setIsLoading(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking transformation status:', error);
      return false;
    }
  };

  const startStatusPolling = async (id) => {
    setCheckingStatus(true);
    let completed = false;
    while (!completed && checkingStatus) {
      completed = await pollTransformationStatus(id);
      if (!completed) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Poll every second
      }
    }
    setCheckingStatus(false);
  };

  const handleCustomPromptChange = (prompt) => {
    setCustomPrompt(prompt);
    const validation = PromptValidator.validatePrompt(prompt);
    setPromptError(validation.valid ? '' : validation.error);
  };

  const handleTransform = async (style) => {
    console.log('Starting transformation process...');
    console.log('Selected style:', style);
    console.log('Style blending enabled:', styleBlendingEnabled);
    console.log('Custom prompt:', customPrompt);
    
    setIsLoading(true);
    try {
      const selectedStyleObj = styles.find(s => s.id === style);
      console.log('Found style object:', selectedStyleObj);
      
      const formData = new FormData();
      formData.append('image', dataURItoBlob(capturedImage));
      formData.append('prompt', selectedStyleObj.prompt);
      
      if (styleBlendingEnabled && customPrompt) {
        const validation = PromptValidator.validatePrompt(customPrompt);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
        formData.append('customPrompt', customPrompt);
      }
      
      // Add adjustments to the request
      Object.keys(adjustments).forEach(key => {
        formData.append(key, adjustments[key]);
      });

      console.log('Sending request to server...');
      console.log('Request URL:', `${config.serverUrl}/generate`);
      console.log('Prompt being sent:', selectedStyleObj.prompt);

      const response = await axios.post(`${config.serverUrl}/generate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: false
      });

      console.log('Received response from server');
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      if (response.data.success && response.data.image) {
        // Create blob URL from base64 image data
        const imageBlob = new Blob(
          [Uint8Array.from(atob(response.data.image), c => c.charCodeAt(0))],
          { type: 'image/png' }
        );
        const imageUrl = URL.createObjectURL(imageBlob);
        console.log('Created blob URL for transformed image');
        setTransformedImage(imageUrl);
        setTransformationId(response.data.request_id);
        setStep('preview');
      } else {
        throw new Error('No image data in response');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          headers: error.response.headers,
          data: error.response.data
        } : 'No response data',
        request: error.request ? 'Request was made but no response received' : 'Request setup failed'
      });
      alert('Error transforming image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up polling when component unmounts or user cancels
  useEffect(() => {
    return () => {
      setCheckingStatus(false);
    };
  }, []);

  // Add cleanup for object URLs when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (transformedImage && transformedImage.startsWith('blob:')) {
        URL.revokeObjectURL(transformedImage);
      }
    };
  }, [transformedImage]);

  return (
    <AppContainer>
      {isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <div>Transforming your image...</div>
          <div style={{ fontSize: '0.8em', marginTop: '10px' }}>This may take a minute</div>
        </LoadingOverlay>
      )}
      <ContentContainer>
        {step === 'capture' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <CameraCapture 
              onCapture={(imageData) => {
                setCapturedImage(imageData);
                if (imageData) {
                  setStep('style');
                }
              }}
              isLoading={isLoading}
            />
          </div>
        )}

        {step === 'style' && capturedImage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <ImagePreview 
              image={capturedImage}
              isLoading={isLoading}
              error={null}
              onRetry={() => {
                setStep('capture');
                setCapturedImage(null);
                setSelectedStyle(null);
              }}
            />
            <h2 style={{ color: '#333', marginBottom: '20px' }}>Choose a Style</h2>
            <TransformationStyles
              selectedStyle={selectedStyle}
              onStyleSelect={(style) => {
                setSelectedStyle(style.id);
              }}
              disabled={isLoading}
            />
            
            <StyleBlending
              enabled={styleBlendingEnabled}
              onCustomPromptChange={handleCustomPromptChange}
              onBlendingToggle={setStyleBlendingEnabled}
              customPrompt={customPrompt}
            />
            
            {promptError && (
              <Typography color="error" variant="caption">
                {promptError}
              </Typography>
            )}
            
            {selectedStyle && (
              <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px' }}>
                <h3 style={{ color: '#333', marginBottom: '20px' }}>Adjust Parameters</h3>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                      Transformation Strength: {adjustments.strength}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="0.7"
                      step="0.02"
                      value={adjustments.strength}
                      onChange={(e) => setAdjustments({
                        ...adjustments,
                        strength: parseFloat(e.target.value)
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                      Guidance Scale: {adjustments.guidance_scale}
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="12"
                      step="0.5"
                      value={adjustments.guidance_scale}
                      onChange={(e) => setAdjustments({
                        ...adjustments,
                        guidance_scale: parseFloat(e.target.value)
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px' }}>
                      Quality Steps: {adjustments.num_inference_steps}
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="1"
                      value={adjustments.num_inference_steps}
                      onChange={(e) => setAdjustments({
                        ...adjustments,
                        num_inference_steps: parseInt(e.target.value)
                      })}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <button
                      onClick={() => handleTransform(selectedStyle)}
                      disabled={isLoading}
                      style={{
                        padding: '12px 24px',
                        fontSize: '1.2em',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      {isLoading ? 'Transforming...' : 'Transform Image'}
                    </button>
                    <button 
                      onClick={() => {
                        setStep('capture');
                        setCapturedImage(null);
                        setSelectedStyle(null);
                      }}
                      style={{
                        padding: '12px 24px',
                        fontSize: '1.2em',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {step === 'preview' && transformedImage && (
          <div>
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                text={`Processing adjustments... ${uploadProgress}%`}
              />
            )}
            <ImagePreview 
              image={transformedImage}
              isLoading={isLoading}
              error={null}
              onRetry={() => {
                setStep('capture');
                setCapturedImage(null);
                setTransformedImage(null);
                setSelectedStyle(null);
              }}
            />
            <ImageDisplay
              originalImage={capturedImage}
              transformedImage={transformedImage}
              onConfirm={() => setStep('email')}
              onRetry={() => {
                setStep('capture');
                setCapturedImage(null);
                setTransformedImage(null);
                setSelectedStyle(null);
              }}
              onAdjustmentsChange={handleAdjustmentsChange}
              isLoading={isLoading}
            />
          </div>
        )}
        
        {step === 'email' && transformedImage && (
          <EmailCapture
            transformedImage={transformedImage}
            onSubmit={handleEmailSubmit}
            onBack={() => setStep('preview')}
          />
        )}
      </ContentContainer>
    </AppContainer>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4aed88',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#ff4b4b',
                  },
                },
              }}
            />
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppContent />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
