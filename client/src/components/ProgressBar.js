import React from 'react';
import styled from 'styled-components';

const ProgressContainer = styled.div`
  width: 100%;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin: 10px 0;
`;

const ProgressBar = styled.div`
  width: ${props => props.progress}%;
  height: 8px;
  background-color: #4CAF50;
  transition: width 0.3s ease-in-out;
`;

const ProgressText = styled.div`
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-top: 4px;
`;

const ProgressIndicator = ({ progress, text }) => {
  return (
    <div>
      <ProgressContainer>
        <ProgressBar progress={progress} />
      </ProgressContainer>
      {text && <ProgressText>{text}</ProgressText>}
    </div>
  );
};

export default ProgressIndicator; 