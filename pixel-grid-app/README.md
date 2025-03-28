# Pixel Grid App

## Overview
The Pixel Grid App is a TypeScript application that allows users to interact with a grid of pixels, each containing a number from 1 to 5. Users can color the pixels by tapping on them, select colors from predefined options or add custom colors, and toggle between coloring mode and a finished view.

## Features
- **Interactive Pixel Grid**: A grid where each pixel displays a number from 1 to 5.
- **Touch-to-Color Functionality**: Tap on a pixel to change its color.
- **Color Selection**: Choose from predefined colors or add new custom colors.
- **Finish Button**: Toggle between coloring mode and finished view, hiding uncolored pixels.

## Project Structure
```
pixel-grid-app
├── src
│   ├── components
│   │   ├── ColorPicker.tsx
│   │   ├── FinishButton.tsx
│   │   └── PixelGrid.tsx
│   ├── styles
│   │   └── styles.css
│   ├── App.tsx
│   └── index.tsx
├── public
│   └── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd pixel-grid-app
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and go to `http://localhost:3000` to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.