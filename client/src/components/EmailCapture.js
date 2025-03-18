import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Paper,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack, 
  Send,
  Email
} from '@mui/icons-material';

const Container = styled(motion.div)`
  width: 100%;
  max-width: ${props => props.theme?.photoBoothStyles?.container?.maxWidth || '800px'};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormContainer = styled(Paper)`
  padding: 24px;
  border-radius: ${props => props.theme?.shape?.cardBorderRadius || 8}px;
  box-shadow: ${props => props.theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.08)'};
  background: ${props => props.theme?.palette?.background?.paper || '#ffffff'};
`;

const PreviewContainer = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme?.photoBoothStyles?.preview?.borderRadius || 8}px;
  overflow: hidden;
  background: ${props => props.theme?.photoBoothStyles?.preview?.background || '#f5f5f5'};
  box-shadow: ${props => props.theme?.shadows?.photo || '0 8px 16px rgba(0,0,0,0.15)'};
`;

const PreviewImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
`;

const EmailIcon = styled(Email)`
  font-size: 48px;
  color: ${props => props.theme?.palette?.primary?.main || '#1976d2'};
  margin-bottom: 16px;
`;

const Link = styled.a`
  color: ${props => props.theme?.palette?.primary?.main || '#1976d2'};
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const EmailCapture = ({
  transformedImage,
  onSubmit,
  onRetry,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Ensure transformedImage is a string
  const safeTransformedImage = typeof transformedImage === 'string' ? transformedImage : '';

  const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.toLowerCase());
  };

  const validateName = (name) => {
    return typeof name === 'string' && name.trim().length > 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let hasError = false;
      setSubmitError('');
      
      // Validate name
      const safeName = String(name || '').trim();
      if (!validateName(safeName)) {
        setNameError('Please enter your name');
        hasError = true;
      } else {
        setNameError('');
      }

      // Validate email
      const safeEmail = String(email || '').trim();
      if (!safeEmail) {
        setEmailError('Please enter your email');
        hasError = true;
      } else if (!validateEmail(safeEmail)) {
        setEmailError('Please enter a valid email address');
        hasError = true;
      } else {
        setEmailError('');
      }

      if (!hasError && onSubmit && typeof onSubmit === 'function') {
        await onSubmit({ 
          email: safeEmail, 
          name: safeName 
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit. Please try again.');
      console.error('Error submitting form:', err);
    }
  };

  const handleRetry = () => {
    if (onRetry && typeof onRetry === 'function') {
      onRetry();
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {safeTransformedImage && (
        <PreviewContainer>
          <PreviewImage 
            src={safeTransformedImage} 
            alt="Your transformed photo"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </PreviewContainer>
      )}

      <FormContainer elevation={0}>
        <Typography 
          variant="h5" 
          component="h2"
          gutterBottom
        >
          Almost there!
        </Typography>
        
        <Typography 
          variant="body1"
          component="p"
          sx={{ mb: 3 }}
        >
          Enter your details to receive your transformed photo.
        </Typography>

        {submitError && (
          <Typography 
            color="error" 
            component="div"
            sx={{ mb: 2 }}
          >
            {submitError}
          </Typography>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(String(e.target.value))}
            error={Boolean(nameError)}
            helperText={nameError || ' '}
            disabled={Boolean(isLoading)}
            variant="outlined"
            inputProps={{
              maxLength: 100,
              'aria-label': 'Name'
            }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(String(e.target.value))}
            error={Boolean(emailError)}
            helperText={emailError || ' '}
            disabled={Boolean(isLoading)}
            variant="outlined"
            inputProps={{
              maxLength: 254,
              'aria-label': 'Email address'
            }}
          />
          <Typography 
            variant="caption"
            component="p"
            color="textSecondary"
            sx={{ mt: 1 }}
          >
            We'll never share your email with anyone else.
          </Typography>
          <ButtonGroup>
            <Button
              variant="outlined"
              onClick={handleRetry}
              disabled={Boolean(isLoading)}
              type="button"
            >
              Try Again
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={Boolean(isLoading)}
              endIcon={isLoading ? <CircularProgress size={20} /> : <Send />}
            >
              Send Photo
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default EmailCapture; 