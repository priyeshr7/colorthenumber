import React, { useState } from 'react';

const ColorPicker = ({ onColorSelect }) => {
  const [customColor, setCustomColor] = useState('');
  const predefinedColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

  const handleColorSelect = (color) => {
    onColorSelect(color);
  };

  const handleCustomColorChange = (event) => {
    setCustomColor(event.target.value);
  };

  const handleAddCustomColor = () => {
    if (customColor) {
      onColorSelect(customColor);
      setCustomColor('');
    }
  };

  return (
    <div className="color-picker">
      <h3>Select a Color</h3>
      <div className="predefined-colors">
        {predefinedColors.map((color) => (
          <div
            key={color}
            className="color-swatch"
            style={{ backgroundColor: color }}
            onClick={() => handleColorSelect(color)}
          />
        ))}
      </div>
      <input
        type="text"
        value={customColor}
        onChange={handleCustomColorChange}
        placeholder="Add custom color (e.g., #123456)"
      />
      <button onClick={handleAddCustomColor}>Add Custom Color</button>
    </div>
  );
};

export default ColorPicker;