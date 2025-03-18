import React from 'react';
import styled from 'styled-components';
import { Card as MuiCard, CardContent as MuiCardContent } from '@mui/material';
import { motion } from 'framer-motion';

const StyledCard = styled(MuiCard)`
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.cardBorderRadius}px;
  overflow: hidden;
  height: ${props => props.fullHeight ? '100%' : 'auto'};
`;

const AnimatedCard = motion(StyledCard);

const CardContent = styled(MuiCardContent)`
  padding: ${props => props.theme.spacing(3)};
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Card = ({ 
  children, 
  animate = true, 
  fullHeight = false,
  onClick,
  ...props 
}) => {
  const cardProps = {
    fullHeight,
    elevation: 0,
    ...props
  };

  if (animate) {
    return (
      <AnimatedCard
        {...cardProps}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          ease: 'easeOut'
        }}
        whileHover={onClick ? { 
          y: -4,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
        } : undefined}
        onClick={onClick}
      >
        <CardContent>{children}</CardContent>
      </AnimatedCard>
    );
  }

  return (
    <StyledCard {...cardProps}>
      <CardContent>{children}</CardContent>
    </StyledCard>
  );
};

export default Card; 