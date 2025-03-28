import React, { useState } from 'react';
import PixelGrid from './components/PixelGrid';
import ColorPicker from './components/ColorPicker';
import FinishButton from './components/FinishButton';
import './styles/styles.css';

const App = () => {
  const [grid, setGrid] = useState(Array(5).fill(null).map(() => Array(5).fill({ number: Math.floor(Math.random() * 5) + 1, color: null })));
  const [currentColor, setCurrentColor] = useState('red');
  const [isColoringMode, setIsColoringMode] = useState(true);

  const handlePixelColorChange = (rowIndex, colIndex) => {
    if (isColoringMode) {
      const newGrid = grid.map((row, rIndex) => 
        row.map((pixel, cIndex) => 
          rIndex === rowIndex && cIndex === colIndex ? { ...pixel, color: currentColor } : pixel
        )
      );
      setGrid(newGrid);
    }
  };

  const toggleColoringMode = () => {
    setIsColoringMode(!isColoringMode);
  };

  return (
    <div className="app">
      <ColorPicker setCurrentColor={setCurrentColor} />
      <FinishButton toggleColoringMode={toggleColoringMode} isColoringMode={isColoringMode} />
      <PixelGrid grid={grid} onPixelColorChange={handlePixelColorChange} isColoringMode={isColoringMode} />
    </div>
  );
};

export default App;