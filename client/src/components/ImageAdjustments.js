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

const ImageAdjustments = ({ adjustments = {}, onAdjustmentsChange }) => {
  // Ensure adjustments object has all required properties with default values
  const safeAdjustments = {
    strength: Number(adjustments.strength ?? 0.6),
    guidance_scale: Number(adjustments.guidance_scale ?? 7.5),
    brightness: Number(adjustments.brightness ?? 1.0),
    contrast: Number(adjustments.contrast ?? 1.0),
    saturation: Number(adjustments.saturation ?? 1.0)
  };

  const handleChange = (name, value) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onAdjustmentsChange({
        ...safeAdjustments,
        [name]: numericValue
      });
    }
  };

  const renderSlider = (name, label, min, max, step) => {
    const value = safeAdjustments[name];
    const displayValue = typeof value === 'number' ? 
      (step >= 0.1 ? value.toFixed(1) : value.toFixed(2)) : 
      '0.00';

    return (
      <SliderGroup key={name}>
        <SliderLabel>
          {label}
          <SliderValue>{displayValue}</SliderValue>
        </SliderLabel>
        <Slider
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleChange(name, e.target.value)}
        />
      </SliderGroup>
    );
  };

  return (
    <AdjustmentsContainer>
      {renderSlider('strength', 'Transformation Strength', 0, 1, 0.05)}
      {renderSlider('guidance_scale', 'Guidance Scale', 1, 20, 0.5)}
      {renderSlider('brightness', 'Brightness', 0.5, 1.5, 0.05)}
      {renderSlider('contrast', 'Contrast', 0.5, 1.5, 0.05)}
      {renderSlider('saturation', 'Saturation', 0.5, 1.5, 0.05)}
    </AdjustmentsContainer>
  );
};

export default ImageAdjustments; 