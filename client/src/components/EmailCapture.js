import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Paper
} from '@mui/material';
import { 
  ArrowBack, 
  Send,
  Email
} from '@mui/icons-material';

const Container = styled(motion.div)`
  width: 100%;
  max-width: ${props => props.theme.photoBoothStyles.container.maxWidth || '800px'};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormContainer = styled(Paper)`
  padding: 24px;
  border-radius: ${props => props.theme.shape.cardBorderRadius}px;
  box-shadow: ${props => props.theme.shadows.card};
  background: ${props => props.theme.palette.background.paper};
`;

const PreviewContainer = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.photoBoothStyles.preview.borderRadius}px;
  overflow: hidden;
  background: ${props => props.theme.photoBoothStyles.preview.background};
  box-shadow: ${props => props.theme.shadows.photo};
`;

const PreviewImage = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 12px;
`;

const EmailIcon = styled(Email)`
  font-size: 48px;
  color: ${props => props.theme.palette.primary.main};
  margin-bottom: 16px;
`;

const EmailCapture = ({ transformedImage, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <PreviewContainer>
        <PreviewImage 
          src={transformedImage} 
          alt="Your transformed photo"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </PreviewContainer>

      <FormContainer elevation={0}>
        <Form onSubmit={handleSubmit}>
          <div style={{ textAlign: 'center' }}>
            <EmailIcon />
            <Typography variant="h5" gutterBottom>
              Get Your Transformed Photo
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Enter your details below and we'll send your transformed photo directly to your inbox.
            </Typography>
          </div>

          <InputGroup>
            <TextField
              fullWidth
              label="Your Name"
              variant="outlined"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              InputProps={{
                sx: {
                  borderRadius: theme => theme.shape.buttonBorderRadius,
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Your Email"
              type="email"
              variant="outlined"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              InputProps={{
                sx: {
                  borderRadius: theme => theme.shape.buttonBorderRadius,
                }
              }}
            />
          </InputGroup>

          <ButtonGroup>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onBack}
              sx={{
                borderRadius: theme => theme.shape.buttonBorderRadius,
              }}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={<Send />}
              sx={{
                borderRadius: theme => theme.shape.buttonBorderRadius,
              }}
            >
              Send to Email
            </Button>
          </ButtonGroup>
        </Form>
      </FormContainer>
    </Container>
  );
};

export default EmailCapture; 