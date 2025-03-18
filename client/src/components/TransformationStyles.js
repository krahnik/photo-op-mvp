import React from 'react';
import styled from 'styled-components';
import { Typography } from '@mui/material';

const StylesContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`;

const StyleButton = styled.button`
  padding: 12px 24px;
  font-size: 1em;
  background: ${props => props.selected ? '#4CAF50' : '#fff'};
  color: ${props => props.selected ? '#fff' : '#333'};
  border: 2px solid #4CAF50;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 0 1 auto;
  min-width: 150px;

  &:hover {
    background: ${props => props.selected ? '#45a049' : '#e8f5e9'};
  }

  &:disabled {
    background: #cccccc;
    border-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StylePreview = styled.div`
  width: 100%;
  height: 100px;
  background: ${props => props.previewUrl ? '#f0f0f0' : '#fff'};
  border-radius: 4px;
  overflow: hidden;
  position: relative;
`;

const StyleName = styled.div`
  margin-top: 10px;
  font-weight: bold;
`;

const StyleDescription = styled.div`
  margin-top: 5px;
  font-size: 0.8em;
  color: #666;
`;

const StyleImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StyleInfo = styled.div`
  padding: 10px;
`;

// Define styles as a constant
const TRANSFORMATION_STYLES = [
  {
    id: 'futuristic',
    name: 'Futuristic Portrait',
    prompt: 'a highly detailed portrait in a futuristic cyberpunk style, maintaining facial structure and features, neon lighting, hyper realistic'
  },
  {
    id: 'astronaut',
    name: 'Astronaut Portrait',
    prompt: 'a detailed portrait of the same person wearing a NASA spacesuit, face visible through helmet visor, maintaining exact facial features, professional photography, highly detailed'
  },
  {
    id: 'baseball',
    name: 'Baseball Player Portrait',
    prompt: 'a professional portrait of the same person as a baseball player in uniform on the field, maintaining facial features and expression, professional sports photography'
  },
  {
    id: 'anime',
    name: 'Anime Style',
    prompt: 'a high quality anime portrait maintaining the same facial structure and features, Studio Ghibli style, detailed, professional illustration'
  },
  {
    id: 'oil',
    name: 'Oil Painting',
    prompt: 'an oil painting portrait in classical style maintaining exact likeness and facial features, masterpiece, detailed brushwork, professional art'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    prompt: 'a watercolor portrait maintaining precise facial features and expression, artistic, detailed, professional illustration'
  }
];

const TransformationStyles = ({ selectedStyle = '', onStyleSelect, disabled = false }) => {
  const handleStyleSelect = (style) => {
    if (!style?.id || typeof style.id !== 'string') {
      console.error('Invalid style object:', style);
      return;
    }
    if (onStyleSelect && typeof onStyleSelect === 'function') {
      onStyleSelect(style.id);
    }
  };

  return (
    <StylesContainer>
      {TRANSFORMATION_STYLES.map(style => {
        // Ensure style object has required properties
        const safeStyle = {
          id: String(style?.id || ''),
          name: String(style?.name || ''),
          description: String(style?.description || ''),
          image: typeof style?.image === 'string' ? style.image : ''
        };

        return (
          <StyleButton
            key={safeStyle.id}
            type="button"
            selected={selectedStyle === safeStyle.id}
            onClick={() => handleStyleSelect(style)}
            disabled={disabled}
            aria-label={`Select ${safeStyle.name} style`}
            aria-selected={selectedStyle === safeStyle.id}
          >
            {safeStyle.image && (
              <StyleImage 
                src={safeStyle.image} 
                alt={safeStyle.name} 
                loading="lazy"
              />
            )}
            <StyleInfo>
              <Typography variant="subtitle1" component="span">
                {safeStyle.name}
              </Typography>
              {safeStyle.description && (
                <Typography variant="body2" component="span" color="textSecondary">
                  {safeStyle.description}
                </Typography>
              )}
            </StyleInfo>
          </StyleButton>
        );
      })}
    </StylesContainer>
  );
};

// Export both the component and the styles array
export { TRANSFORMATION_STYLES };
export default TransformationStyles; 