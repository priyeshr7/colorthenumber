import React from 'react';

interface FinishButtonProps {
  isColoringMode: boolean;
  toggleColoringMode: () => void;
}

const FinishButton: React.FC<FinishButtonProps> = ({ isColoringMode, toggleColoringMode }) => {
  return (
    <button onClick={toggleColoringMode}>
      {isColoringMode ? 'Finish Coloring' : 'Edit Colors'}
    </button>
  );
};

export default FinishButton;