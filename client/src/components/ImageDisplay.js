import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Typography, IconButton, Slider, Button } from '@mui/material';
import { 
  Compare, 
  Refresh, 
  Send,
  Tune,
  ExpandLess,
  ExpandMore
} from '@mui/icons-material';

const Container = styled(motion.div)`
  width: 100%;
  max-width: ${props => props.theme.photoBoothStyles.container.maxWidth || '800px'};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const ImagesContainer = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  position: relative;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageWrapper = styled(motion.div)`
  position: relative;
  aspect-ratio: 1;
  border-radius: ${props => props.theme.photoBoothStyles.preview.borderRadius}px;
  overflow: hidden;
  background: ${props => props.theme.photoBoothStyles.preview.background};
  box-shadow: ${props => props.theme.shadows.photo};
`;

const Image = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ImageLabel = styled(Typography)`
  position: absolute;
  bottom: 16px;
  left: 16px;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-weight: 500;
  z-index: 1;
`;

const CompareButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.theme.palette.background.paper} !important;
  box-shadow: ${props => props.theme.shadows.button};
  z-index: 2;

  &:hover {
    background: ${props => props.theme.palette.background.paper};
    box-shadow: ${props => props.theme.shadows.hover};
  }
`;

const AdjustmentsPanel = styled(motion.div)`
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.cardBorderRadius}px;
  padding: 24px;
  box-shadow: ${props => props.theme.shadows.card};
`;

const AdjustmentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  cursor: pointer;
`;

const SliderGroup = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const ImageDisplay = ({ 
  originalImage, 
  transformedImage, 
  onConfirm, 
  onRetry, 
  onAdjustmentsChange,
  isLoading 
}) => {
  const [adjustments, setAdjustments] = useState({
    strength: 0.6,
    guidance_scale: 7.5,
    num_inference_steps: 50,
  });
  const [showAdjustments, setShowAdjustments] = useState(true);
  const [isComparing, setIsComparing] = useState(false);

  const handleAdjustmentChange = (key, value) => {
    const newAdjustments = { ...adjustments, [key]: value };
    setAdjustments(newAdjustments);
    if (onAdjustmentsChange) {
      onAdjustmentsChange(newAdjustments);
    }
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <ImagesContainer>
        <ImageWrapper>
          <Image 
            src={originalImage} 
            alt="Original"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
          <ImageLabel variant="subtitle1">Original</ImageLabel>
        </ImageWrapper>

        <ImageWrapper>
          <Image 
            src={transformedImage || originalImage} 
            alt="Transformed"
            initial={{ opacity: 0 }}
            animate={{ opacity: isComparing ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
          <Image 
            src={originalImage} 
            alt="Original for comparison"
            initial={{ opacity: 0 }}
            animate={{ opacity: isComparing ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          <ImageLabel variant="subtitle1">Transformed</ImageLabel>
        </ImageWrapper>

        <CompareButton
          onMouseDown={() => setIsComparing(true)}
          onMouseUp={() => setIsComparing(false)}
          onMouseLeave={() => setIsComparing(false)}
          size="large"
        >
          <Compare />
        </CompareButton>
      </ImagesContainer>

      <AdjustmentsPanel>
        <AdjustmentHeader onClick={() => setShowAdjustments(!showAdjustments)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tune />
            <Typography variant="h6">Adjustments</Typography>
          </div>
          {showAdjustments ? <ExpandLess /> : <ExpandMore />}
        </AdjustmentHeader>

        <AnimatePresence>
          {showAdjustments && (
            <SliderGroup
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <SliderLabel>
                  <Typography variant="body2">Transformation Strength</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {adjustments.strength.toFixed(2)}
                  </Typography>
                </SliderLabel>
                <Slider
                  value={adjustments.strength}
                  onChange={(_, value) => handleAdjustmentChange('strength', value)}
                  min={0.5}
                  max={0.7}
                  step={0.02}
                  disabled={isLoading}
                />
              </div>

              <div>
                <SliderLabel>
                  <Typography variant="body2">Guidance Scale</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {adjustments.guidance_scale.toFixed(1)}
                  </Typography>
                </SliderLabel>
                <Slider
                  value={adjustments.guidance_scale}
                  onChange={(_, value) => handleAdjustmentChange('guidance_scale', value)}
                  min={5}
                  max={12}
                  step={0.5}
                  disabled={isLoading}
                />
              </div>

              <div>
                <SliderLabel>
                  <Typography variant="body2">Quality Steps</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {adjustments.num_inference_steps}
                  </Typography>
                </SliderLabel>
                <Slider
                  value={adjustments.num_inference_steps}
                  onChange={(_, value) => handleAdjustmentChange('num_inference_steps', value)}
                  min={20}
                  max={100}
                  step={1}
                  disabled={isLoading}
                />
              </div>
            </SliderGroup>
          )}
        </AnimatePresence>

        <ButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRetry}
            disabled={isLoading}
          >
            Try Again
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Send />}
            onClick={onConfirm}
            disabled={isLoading || !transformedImage}
          >
            Continue to Email
          </Button>
        </ButtonGroup>
      </AdjustmentsPanel>
    </Container>
  );
};

export default ImageDisplay; 