import React, { useState } from 'react';
import styled from 'styled-components';
import { FormControlLabel, Switch, TextField, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const Container = styled(motion.div)`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const PromptContainer = styled(motion.div)`
  margin-top: 16px;
`;

const StyleBlending = ({ 
  enabled, 
  onCustomPromptChange, 
  onBlendingToggle,
  customPrompt = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <FormControlLabel
        control={
          <Switch
            checked={enabled}
            onChange={(e) => onBlendingToggle(e.target.checked)}
            color="primary"
          />
        }
        label={
          <Typography variant="subtitle1">
            Enable Style Blending
          </Typography>
        }
      />
      
      {enabled && (
        <PromptContainer
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add custom style prompt (e.g. 'in a nightclub', 'underwater', 'on mars')"
            value={customPrompt}
            onChange={(e) => onCustomPromptChange(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Your custom prompt will be blended with the selected style while maintaining your likeness
          </Typography>
        </PromptContainer>
      )}
    </Container>
  );
};

export default StyleBlending; 