import React from 'react';
import styled from 'styled-components';

const AdjustmentsContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const SliderGroup = styled.div`
  margin-bottom: 15px;
`;

const SliderLabel = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
`;

const SliderValue = styled.span`
  margin-left: 10px;
  color: #666;
`;

const Slider = styled.input`
  width: 100%;
  margin: 10px 0;
  -webkit-appearance: none;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  &:hover::-webkit-slider-thumb {
    background: #45a049;
  }

  &:hover::-moz-range-thumb {
    background: #45a049;
  }
`;

const ImageAdjustments = ({ 
  adjustments, 
  onAdjustmentsChange 
}) => {
  const handleChange = (name, value) => {
    onAdjustmentsChange({
      ...adjustments,
      [name]: parseFloat(value)
    });
  };

  return (
    <AdjustmentsContainer>
      <SliderGroup>
        <SliderLabel>
          Transformation Strength
          <SliderValue>{adjustments.strength.toFixed(2)}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={adjustments.strength}
          onChange={(e) => handleChange('strength', e.target.value)}
        />
      </SliderGroup>

      <SliderGroup>
        <SliderLabel>
          Guidance Scale
          <SliderValue>{adjustments.guidance_scale.toFixed(1)}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min="1"
          max="20"
          step="0.5"
          value={adjustments.guidance_scale}
          onChange={(e) => handleChange('guidance_scale', e.target.value)}
        />
      </SliderGroup>

      <SliderGroup>
        <SliderLabel>
          Brightness
          <SliderValue>{adjustments.brightness.toFixed(2)}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={adjustments.brightness}
          onChange={(e) => handleChange('brightness', e.target.value)}
        />
      </SliderGroup>

      <SliderGroup>
        <SliderLabel>
          Contrast
          <SliderValue>{adjustments.contrast.toFixed(2)}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={adjustments.contrast}
          onChange={(e) => handleChange('contrast', e.target.value)}
        />
      </SliderGroup>

      <SliderGroup>
        <SliderLabel>
          Saturation
          <SliderValue>{adjustments.saturation.toFixed(2)}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min="0.5"
          max="1.5"
          step="0.05"
          value={adjustments.saturation}
          onChange={(e) => handleChange('saturation', e.target.value)}
        />
      </SliderGroup>
    </AdjustmentsContainer>
  );
};

export default ImageAdjustments; 