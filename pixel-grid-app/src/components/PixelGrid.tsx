import React, { useState } from 'react';
import './styles.css';

const PixelGrid = () => {
  const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill({ number: Math.floor(Math.random() * 5) + 1, color: null })));
  const [coloringMode, setColoringMode] = useState(true);
  const [selectedColor, setSelectedColor] = useState('red');

  const handlePixelClick = (rowIndex, colIndex) => {
    if (coloringMode) {
      const newGrid = grid.map((row, rIndex) => 
        row.map((pixel, cIndex) => 
          rIndex === rowIndex && cIndex === colIndex ? { ...pixel, color: selectedColor } : pixel
        )
      );
      setGrid(newGrid);
    }
  };

  const toggleColoringMode = () => {
    setColoringMode(!coloringMode);
  };

  return (
    <div className="pixel-grid">
      {grid.map((row, rowIndex) => (
        <div key={rowIndex} className="pixel-row">
          {row.map((pixel, colIndex) => (
            <div
              key={colIndex}
              className="pixel"
              style={{ backgroundColor: pixel.color || 'white' }}
              onClick={() => handlePixelClick(rowIndex, colIndex)}
            >
              {pixel.number}
            </div>
          ))}
        </div>
      ))}
      <button onClick={toggleColoringMode}>
        {coloringMode ? 'Finish' : 'Color'}
      </button>
    </div>
  );
};

export default PixelGrid;