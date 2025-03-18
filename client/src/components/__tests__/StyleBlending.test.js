import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { render } from '../../test-utils';
import StyleBlending from '../StyleBlending';

describe('StyleBlending Component', () => {
  const mockStyles = [
    { id: '1', name: 'Style 1', description: 'Description 1', preview: 'preview1.jpg' },
    { id: '2', name: 'Style 2', description: 'Description 2', preview: 'preview2.jpg' },
    { id: '3', name: 'Style 3', description: 'Description 3', preview: 'preview3.jpg' }
  ];

  const mockProps = {
    selectedStyles: ['1'],
    onStyleSelect: jest.fn(),
    onStyleDeselect: jest.fn(),
    onBlendRatioChange: jest.fn(),
    blendRatio: 0.5,
    isEnabled: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <StyleBlending
        {...mockProps}
        {...props}
      />
    );
  };

  test('renders style blending component', () => {
    renderComponent();
    expect(screen.getByText('Style Blending')).toBeInTheDocument();
    expect(screen.getByText('Blend multiple styles together')).toBeInTheDocument();
  });

  test('displays selected styles', () => {
    renderComponent();
    expect(screen.getByText('Style 1')).toBeInTheDocument();
  });

  test('handles style selection', () => {
    renderComponent({ selectedStyles: [] });
    const styleButton = screen.getByText('Style 1');
    fireEvent.click(styleButton);
    expect(mockProps.onStyleSelect).toHaveBeenCalledWith('1');
  });

  test('handles style deselection', () => {
    renderComponent();
    const styleButton = screen.getByText('Style 1');
    fireEvent.click(styleButton);
    expect(mockProps.onStyleDeselect).toHaveBeenCalledWith('1');
  });

  test('handles blend ratio change', () => {
    renderComponent();
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.7' } });
    expect(mockProps.onBlendRatioChange).toHaveBeenCalledWith(0.7);
  });

  test('disables component when isEnabled is false', () => {
    renderComponent({ isEnabled: false });
    const slider = screen.getByRole('slider');
    expect(slider).toBeDisabled();
  });

  test('shows warning when no styles are selected', () => {
    renderComponent({ selectedStyles: [] });
    expect(screen.getByText('Select at least one style')).toBeInTheDocument();
  });

  test('shows warning when too many styles are selected', () => {
    renderComponent({ selectedStyles: ['1', '2', '3'] });
    expect(screen.getByText('Maximum of 2 styles can be selected')).toBeInTheDocument();
  });

  test('displays blend ratio value', () => {
    renderComponent({ blendRatio: 0.7 });
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  test('handles toggle switch interaction', () => {
    renderComponent();
    const toggleSwitch = screen.getByRole('switch');
    fireEvent.click(toggleSwitch);
    expect(mockProps.onStyleSelect).toHaveBeenCalled();
  });
}); 