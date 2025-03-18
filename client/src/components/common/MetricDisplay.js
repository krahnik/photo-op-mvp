import React from 'react';
import styled from 'styled-components';
import { Typography, Box, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';

const MetricContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: ${props => props.theme.spacing(3)};
  background: ${props => props.theme.palette.background.paper};
  border-radius: ${props => props.theme.shape.cardBorderRadius}px;
  height: 100%;
`;

const MetricHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.spacing(2)};
`;

const MetricTitle = styled(Typography)`
  color: ${props => props.theme.palette.text.secondary};
  font-weight: 500;
`;

const MetricValue = styled(Typography)`
  color: ${props => props.theme.palette.text.primary};
  font-size: 2rem;
  font-weight: 600;
  margin-top: ${props => props.theme.spacing(1)};
`;

const MetricTrend = styled(Box)`
  display: flex;
  align-items: center;
  margin-top: ${props => props.theme.spacing(1)};
  color: ${props => 
    props.trend > 0 
      ? props.theme.palette.success.main 
      : props.trend < 0 
        ? props.theme.palette.error.main 
        : props.theme.palette.text.secondary
  };
`;

const MetricIcon = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: ${props => props.theme.shape.borderRadius}px;
  background: ${props => props.iconBackground || props.theme.palette.primary.main}20;
  margin-bottom: ${props => props.theme.spacing(2)};

  svg {
    font-size: 24px;
    color: ${props => props.iconBackground || props.theme.palette.primary.main};
  }
`;

const MetricDisplay = ({
  title,
  value,
  icon: Icon,
  iconBackground,
  trend,
  trendLabel,
  onClick,
  tooltipTitle,
  animate = true,
  ...props
}) => {
  const containerProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
    whileHover: onClick ? { 
      y: -4,
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
    } : undefined
  } : {};

  return (
    <MetricContainer {...containerProps} {...props}>
      <MetricHeader>
        {Icon && (
          <MetricIcon iconBackground={iconBackground}>
            <Icon />
          </MetricIcon>
        )}
        {onClick && (
          <Tooltip title={tooltipTitle || 'View details'}>
            <IconButton size="small" onClick={onClick}>
              <OpenInNewIcon />
            </IconButton>
          </Tooltip>
        )}
      </MetricHeader>

      <MetricTitle variant="subtitle2" component="span">{title}</MetricTitle>
      <MetricValue variant="h3" component="span">{value}</MetricValue>

      {trend !== undefined && (
        <MetricTrend trend={trend}>
          <Typography variant="body2" component="span">
            {trend > 0 ? '+' : ''}{trend}% {trendLabel || 'vs last period'}
          </Typography>
        </MetricTrend>
      )}
    </MetricContainer>
  );
};

export default MetricDisplay; 