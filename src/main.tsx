import { Devvit, useState } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

// Game constants
const GRID_SIZE = 7;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;
const TARGET_COUNTS = [11, 13, 17, 19];
const MAX_LEVEL = 99; // Maximum level in the game
const CELL_COLORS = {
  default: "#333",
  selected: "#4CAF50",
  incorrect: "#8c1911",
  cellDefault: "#2a3a9a", // Default cell color
  cellHover: "#3a4aaa", // Cell hover color
};
const GAME_COLORS = {
  primary: "#1a237e", // Darker blue for better contrast
  secondary: "#ffffff", // White
  accent: "#4CAF50", // Green for correct selections
  error: "#F44336", // Red for incorrect selections
  background: "#121858", // Slightly lighter than primary for depth
  gridBackground: "#1e2a8a", // Grid background color
};
const COLOR_OPTIONS = [
  { name: "Green", value: "#4CAF50" },
  { name: "Pink", value: "#e36bd7" },
  { name: "Sky Blue", value: "#87CEEB" },
  { name: "Violet", value: "#6816cc" },
  { name: "Orange", value: "#de762c" },
];
// Penalty for each wrong click (0.1 or 10%)
const WRONG_CLICK_PENALTY = 0.1;
// Maximum number of clickable cells (equals to target count)
const MAX_CLICKS_LIMIT = true;

// Add a menu item to the subreddit menu for instantiating the game post
Devvit.addMenuItem({
  label: 'Add Color The Number Game',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_event, context) => {
    const { reddit, ui } = context;
    ui.showToast("Creating Color The Number Game - please wait");

    const subreddit = await reddit.getCurrentSubreddit();
    const post = await reddit.submitPost({
      title: 'Color The Number Game',
      subredditName: subreddit.name,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading Color The Number Game...</text>
        </vstack>
      ),
    });
    ui.navigateTo(post);
  },
});

// Main game component
const ColorTheNumber = () => {
  // Game states
  const [screen, setScreen] = useState('menu'); // menu, game, howToPlay, changeColor, scoreScreen
  const [grid, setGrid] = useState<number[]>(Array(TOTAL_CELLS).fill(0));
  const [targetNumber, setTargetNumber] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [coloredCells, setColoredCells] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameResult, setGameResult] = useState(''); // '', 'perfect', 'superPerfect'
  const [colorSelected, setColorSelected] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [scoreMultiplier, setScoreMultiplier] = useState(1.0);
  const [showScorePopup, setShowScorePopup] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1); // Current game level
  const [totalScore, setTotalScore] = useState(0); // Accumulated score across all levels

  // Initialize new game
  const startNewGame = (resetLevel = true) => {
    console.log("startNewGame function called");
    
    try {
      // Generate random target number (0-9)
      const newTargetNumber = Math.floor(Math.random() * 10);
      console.log("Generated target number:", newTargetNumber);
      
      // Select random target count from predefined options
      const newTargetCount = TARGET_COUNTS[Math.floor(Math.random() * TARGET_COUNTS.length)];
      console.log("Generated target count:", newTargetCount);
      
      // Create a new grid with random numbers
      const newGrid = Array(TOTAL_CELLS).fill(0).map(() => Math.floor(Math.random() * 10));
      
      // Ensure target number appears exactly targetCount times
      // First, remove all instances of target number
      const gridWithoutTarget = newGrid.map(num => 
        num === newTargetNumber ? (newTargetNumber + 1) % 10 : num
      );
      
      // Then, place target number randomly exactly targetCount times
      let placedCount = 0;
      const finalGrid = [...gridWithoutTarget];
      const availableIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
      
      while (placedCount < newTargetCount) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const selectedIndex = availableIndices[randomIndex];
        availableIndices.splice(randomIndex, 1);
        
        finalGrid[selectedIndex] = newTargetNumber;
        placedCount++;
      }
      
      console.log("Setting state values...");
      
      // Update all game state values
      setGrid(finalGrid);
      setTargetNumber(newTargetNumber);
      setTargetCount(newTargetCount);
      setColoredCells([]);
      setScore(0);
      setGameResult('');
      setMistakes(0);
      setScoreMultiplier(1.0);
      setShowScorePopup(false);
      setTotalClicks(0);
      
      // Reset level if starting a brand new game
      if (resetLevel) {
        setCurrentLevel(1);
        setTotalScore(0);
      }
      
      console.log("Changing screen to game");
      setScreen('game');
    } catch (error) {
      console.error("Error in startNewGame:", error);
    }
  };

  // Handle cell click
  const handleCellClick = (index: number) => {
    // Check if cell is already colored
    if (coloredCells.includes(index)) {
      console.log("Cell already colored, ignoring click");
      return;
    }
    
    // Update colored cells regardless of correct/incorrect
    const newColoredCells = [...coloredCells, index];
    setColoredCells(newColoredCells);
    
    // Increment total clicks counter
    setTotalClicks(prev => prev + 1);
    
    const isCorrectCell = grid[index] === targetNumber;
    
    if (isCorrectCell) {
      // Check if all target cells are found
      const correctCellsCount = newColoredCells.filter(idx => grid[idx] === targetNumber).length;
      if (correctCellsCount === targetCount) {
        // All target cells found - calculate final score
        const finalScore = Math.max(0, 1 - (mistakes * WRONG_CLICK_PENALTY));
        setScore(finalScore);
        endGame();
      }
    } else {
      // Wrong click - increase mistakes
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      // Calculate new score multiplier (informational only)
      const newMultiplier = Math.max(0, 1.0 - (newMistakes * WRONG_CLICK_PENALTY));
      setScoreMultiplier(newMultiplier);
      
      console.log(`Wrong click! Mistakes: ${newMistakes}, Multiplier: ${newMultiplier.toFixed(1)}`);
    }
  };

  // End game and calculate results
  const endGame = () => {
    // Calculate if perfect or super perfect score
    const finalScore = Math.max(0, 1 - (mistakes * WRONG_CLICK_PENALTY));
    setScore(finalScore);
    
    // Update total score
    setTotalScore(prevTotal => prevTotal + finalScore);
    
    if (mistakes === 0) {
      setGameResult('perfect');
      
      // Super Perfect criteria without time factor
      if (2 * targetNumber === targetCount) {
        setGameResult('superPerfect');
      }
    }
    
    // Show score screen
    setScreen('scoreScreen');
  };

  // Proceed to next level
  const nextLevel = () => {
    if (currentLevel < MAX_LEVEL) {
      setCurrentLevel(prevLevel => prevLevel + 1);
      startNewGame(false); // Start new game without resetting level and total score
    } else {
      // Player has completed all 99 levels
      setScreen('gameCompleted');
    }
  };

  // Change selected color
  const changeColor = (color: string) => {
    setSelectedColor(color);
    setColorSelected(true);
  };

  // Main Menu Screen
  const MenuScreen = () => {
    const handleStartGame = () => {
      console.log("Start Game pressed");
      startNewGame();
    };

    const handleHowToPlay = () => {
      console.log("How to Play pressed");
      setScreen('howToPlay');
    };

    const handleChangeColor = () => {
      console.log("Change Color pressed");
      setScreen('changeColor');
    };
    
    return (
      <vstack 
        height="100%" 
        width="100%" 
        alignment="middle center" 
        backgroundColor={GAME_COLORS.background}
        padding="large"
      >
        <text 
          size="large" 
          weight="bold" 
          color={GAME_COLORS.secondary}
        >
          Color The Number
        </text>
        <vstack 
          gap="medium" 
          width="80%" 
          alignment="middle center"
          backgroundColor={GAME_COLORS.primary}
          padding="large"
          cornerRadius="large"
        >
          <button 
            onPress={handleStartGame} 
            appearance="primary"
            width="80%"
          >
            Start Game
          </button>
          <button 
            onPress={handleHowToPlay} 
            appearance="secondary"
            width="80%"
          >
            How to Play
          </button>
          <button 
            onPress={handleChangeColor} 
            appearance="secondary"
            width="80%"
          >
            Change Color
          </button>
        </vstack>
      </vstack>
    );
  };

  // Game Grid Screen
  const GameScreen = () => (
    <vstack height="100%" width="100%" backgroundColor={GAME_COLORS.background} padding="medium" gap="medium">
      {/* Game Information */}
      <hstack gap="medium" alignment="middle center" padding="small">
        <vstack 
          alignment="middle center" 
          padding="medium" 
          backgroundColor={GAME_COLORS.primary} 
          cornerRadius="large"
        >
          <text size="small" color={GAME_COLORS.secondary}>Target Number</text>
          <text size="xxlarge" weight="bold" color={GAME_COLORS.secondary}>{targetNumber}</text>
        </vstack>
        
        <vstack 
          alignment="middle center" 
          padding="medium" 
          backgroundColor={GAME_COLORS.primary} 
          cornerRadius="large"
        >
          <text size="small" color={GAME_COLORS.secondary}>Level</text>
          <text size="xxlarge" weight="bold" color={GAME_COLORS.secondary}>{currentLevel}</text>
        </vstack>
        
        <vstack 
          alignment="middle center" 
          padding="medium" 
          backgroundColor={GAME_COLORS.primary} 
          cornerRadius="large"
        >
          <text size="small" color={GAME_COLORS.secondary}>Total Score</text>
          <text size="xxlarge" weight="bold" color={GAME_COLORS.secondary}>{totalScore.toFixed(1)}</text>
        </vstack>
      </hstack>
      
      {/* Game Grid */}
      <vstack 
        gap="small" 
        alignment="middle center"
        backgroundColor={GAME_COLORS.gridBackground}
        padding="medium"
        cornerRadius="large"
      >
        {Array(GRID_SIZE).fill(0).map((_, rowIndex) => (
          <hstack key={`row-${rowIndex}`} gap="small" alignment="middle center">
            {Array(GRID_SIZE).fill(0).map((_, colIndex) => {
              const index = rowIndex * GRID_SIZE + colIndex;
              const isColored = coloredCells.includes(index);
              const isCorrect = grid[index] === targetNumber;
              
              return (
                <vstack 
                  key={`cell-${index}`}
                  height="33px" 
                  width="33px" 
                  backgroundColor={isColored ? (isCorrect ? selectedColor : CELL_COLORS.incorrect) : CELL_COLORS.cellDefault}
                  cornerRadius="medium"
                  alignment="middle center"
                  onPress={() => handleCellClick(index)}
                >
                  <text color={GAME_COLORS.secondary} size="medium" weight="bold">
                    {grid[index]}
                  </text>
                </vstack>
              );
            })}
          </hstack>
        ))}
      </vstack>
      
      {/* Game Controls */}
      <hstack gap="medium" alignment="middle center" padding="small">
        <button
          appearance="secondary"
          size="large"
          onPress={() => setScreen('menu')}
        >
          Menu
        </button>
        
        <button
          appearance="primary"
          size="large"
          onPress={startNewGame}
        >
          New Game
        </button>
      </hstack>
    </vstack>
  );

  // How to Play Screen
  const HowToPlayScreen = () => (
    <vstack 
      backgroundColor={GAME_COLORS.secondary}
      padding="large"
      cornerRadius="medium"
      width="100%"
      height="100%"
    >
      <hstack padding="small">
        <vstack width="80%">
          <text size="xlarge" weight="bold" color={GAME_COLORS.primary}>How to Play</text>
        </vstack>
        <vstack width="20%" alignment="end">
          <button
            appearance="secondary"
            size="medium"
            onPress={() => setScreen('menu')}
          >
            X
          </button>
        </vstack>
      </hstack>
      
      <vstack gap="medium" padding="medium">
        <text weight="bold" size="large" color={GAME_COLORS.primary}>Game Objective:</text>
        <text size="medium" color={GAME_COLORS.primary}>Color all instances of the target number.</text>
        
        <text weight="bold" size="large" color={GAME_COLORS.primary}>How to Play:</text>
        <vstack gap="small">
          <text size="medium" color={GAME_COLORS.primary}>1. Click/tap all cells containing the target number</text>
        </vstack>
        
        <text weight="bold" size="large" color={GAME_COLORS.primary}>Scoring:</text>
        <vstack gap="small">
          <text size="medium" color={GAME_COLORS.primary}>• 1 point for completing a game</text>
          <text size="medium" color={GAME_COLORS.primary}>• Each wrong click reduces score by 0.1 points</text>
        </vstack>
      </vstack>
      
      <button
        appearance="primary"
        size="large"
        onPress={() => setScreen('menu')}
      >
        Back to Menu
      </button>
    </vstack>
  );

  // Change Color Screen
  const ChangeColorScreen = () => {
    const buttonText = colorSelected ? "Choose Color" : "Back to Menu";
    
    return (
      <vstack 
        backgroundColor={GAME_COLORS.secondary}
        padding="large"
        cornerRadius="medium"
        width="100%"
        height="100%"
      >
        <hstack padding="small">
          <vstack width="80%">
            <text size="xlarge" weight="bold" color={GAME_COLORS.primary}>Change Color</text>
          </vstack>
          <vstack width="20%" alignment="end">
            <button
              appearance="secondary"
              size="medium"
              onPress={() => setScreen('menu')}
            >
              X
            </button>
          </vstack>
        </hstack>
        
        <vstack gap="medium" padding="medium">
          <text color={GAME_COLORS.primary} size="large">Select a color for:</text>
          
          {COLOR_OPTIONS.map((color, index) => (
            <hstack 
              key={`color-${index}`}
              gap="small" 
              alignment="middle"
              backgroundColor={selectedColor === color.value ? "rgba(8,8,84,0.08)" : "transparent"}
              padding="small"
              cornerRadius="small"
              onPress={() => changeColor(color.value)}
            >
              <hstack>
                <vstack 
                  width="30px" 
                  height="30px" 
                  backgroundColor={color.value}
                  cornerRadius="small"
                />
                {selectedColor === color.value && (
                  <text color={GAME_COLORS.primary} size="large" weight="bold"> ✓</text>
                )}
              </hstack>
              <text color={GAME_COLORS.primary} size="large">{color.name}</text>
            </hstack>
          ))}
        </vstack>
        
        <button
          appearance="primary"
          size="large"
          onPress={() => setScreen('menu')}
        >
          {buttonText}
        </button>
      </vstack>
    );
  };

  // Score Screen
  const ScoreScreen = () => (
    <vstack 
      height="100%" 
      width="100%" 
      backgroundColor={GAME_COLORS.primary}
      alignment="middle center"
    >
      <vstack 
        backgroundColor={GAME_COLORS.secondary}
        padding="large"
        cornerRadius="medium"
        gap="medium"
        alignment="middle center"
        width="80%"
      >
        {gameResult ? (
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            {gameResult === 'superPerfect' ? '⭐ SUPER PERFECT! ⭐' : '✨ PERFECT SCORE! ✨'}
          </text>
        ) : (
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            Level {currentLevel} Complete!
          </text>
        )}
        
        <vstack alignment="middle center" gap="small" padding="medium">
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            Level Score
          </text>
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            {score.toFixed(1)}
          </text>
          
          <text size="large" color={GAME_COLORS.primary}>
            Total Score: {totalScore.toFixed(1)}
          </text>
        </vstack>
        
        <hstack gap="medium" padding="medium">
          {currentLevel < MAX_LEVEL && (
            <button
              appearance="primary"
              size="large"
              onPress={nextLevel}
            >
              Next Level
            </button>
          )}
          
          <button
            appearance="primary"
            size="large"
            onPress={startNewGame}
          >
            New Game
          </button>
          
          <button
            appearance="secondary"
            size="large"
            onPress={() => setScreen('menu')}
          >
            Menu
          </button>
        </hstack>
      </vstack>
    </vstack>
  );
  
  // Game Completed Screen (all 99 levels)
  const GameCompletedScreen = () => (
    <vstack 
      height="100%" 
      width="100%" 
      backgroundColor={GAME_COLORS.primary}
      alignment="middle center"
    >
      <vstack 
        backgroundColor={GAME_COLORS.secondary}
        padding="large"
        cornerRadius="medium"
        gap="medium"
        alignment="middle center"
        width="80%"
      >
        <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
          🏆 CONGRATULATIONS! 🏆
        </text>
        
        <text size="xlarge" weight="bold" color={GAME_COLORS.primary}>
          You completed all {MAX_LEVEL} levels!
        </text>
        
        <vstack alignment="middle center" gap="small" padding="medium">
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            Final Score
          </text>
          <text size="xxlarge" weight="bold" color={GAME_COLORS.primary}>
            {totalScore.toFixed(1)}
          </text>
        </vstack>
        
        <hstack gap="medium" padding="medium">
          <button
            appearance="primary"
            size="large"
            onPress={startNewGame}
          >
            New Game
          </button>
          
          <button
            appearance="secondary"
            size="large"
            onPress={() => setScreen('menu')}
          >
            Menu
          </button>
        </hstack>
      </vstack>
    </vstack>
  );

  // Decide which screen to render
  console.log("Rendering screen:", screen);
  switch (screen) {
    case 'menu':
      return <MenuScreen />;
    case 'game':
      return <GameScreen />;
    case 'howToPlay':
      return <HowToPlayScreen />;
    case 'changeColor':
      return <ChangeColorScreen />;
    case 'scoreScreen':
      return <ScoreScreen />;
    case 'gameCompleted':
      return <GameCompletedScreen />;
    default:
      console.log("Returning menu screen (default)");
      return <MenuScreen />;
  }
};

// Add a post type definition
Devvit.addCustomPostType({
  name: 'Color The Number Game',
  height: 'tall',
  render: (_context) => <  ColorTheNumber   />,
});

export default Devvit;
