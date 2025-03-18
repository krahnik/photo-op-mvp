import React from 'react';
import styled from 'styled-components';

const ProgressWrapper = styled.div`
  width: 100%;
  margin: 10px 0;
`;

const ProgressContainer = styled.div`
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  width: ${props => {
    const progress = Number(props.progress);
    return !isNaN(progress) ? Math.min(Math.max(progress, 0), 100) : 0;
  }}%;
  height: 8px;
  background-color: #4CAF50;
  transition: width 0.3s ease-in-out;
`;

const ProgressText = styled.span`
  display: block;
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 4px;
`;

const ProgressIndicator = ({ progress = 0, text = '' }) => {
  // Ensure progress is a valid number between 0 and 100
  const safeProgress = (() => {
    const num = Number(progress);
    if (isNaN(num)) return 0;
    return Math.min(Math.max(num, 0), 100);
  })();

  // Ensure text is a string
  const safeText = text ? String(text).trim() : '';

  return (
    <ProgressWrapper role="progressbar" aria-valuenow={safeProgress} aria-valuemin="0" aria-valuemax="100">
      <ProgressContainer>
        <ProgressBar progress={safeProgress} />
      </ProgressContainer>
      {safeText && <ProgressText>{safeText}</ProgressText>}
    </ProgressWrapper>
  );
};

// Add prop types for better type checking
ProgressIndicator.defaultProps = {
  progress: 0,
  text: ''
};

export default ProgressIndicator; 