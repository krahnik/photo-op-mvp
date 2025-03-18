import React from 'react';
import styled from 'styled-components';

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

const styles = [
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

export { styles };

const TransformationStyles = ({ 
  selectedStyle, 
  onStyleSelect,
  disabled = false 
}) => {
  return (
    <StylesContainer>
      {styles.map((style) => (
        <StyleButton
          key={style.id}
          selected={selectedStyle === style.id}
          onClick={() => onStyleSelect(style)}
          disabled={disabled}
        >
          {style.name}
        </StyleButton>
      ))}
    </StylesContainer>
  );
};

export default TransformationStyles; 