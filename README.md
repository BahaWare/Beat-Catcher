# [🎮 Beat Catcher](https://bahaware.github.io/Beat-Catcher/)

A rhythm-based catching game where you control a ship dodging obstacles to the beat of music. Features bright rainbow colors, visual effects, and dynamic gameplay optimized to increase dopamine!

[🟩 Click To Play](https://bahaware.github.io/Beat-Catcher/)

![Game Preview](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

- **Dynamic Rhythm Gameplay**: Objects fall to the beat of the music
- **Visual Effects**: 
  - Particle explosions
  - RGB rainbow borders
  - Screen distortion on miss
  - Glowing effects
  - Animated starfield background
- **Progressive Difficulty**: Speed increases with level
- **Customizable Ships**: 
  - Default futuristic ship
  - Country-themed ships (Turkey 🇹🇷, USA 🇺🇸, Germany 🇩🇪)
  - Upload your own custom ship image
- **Multiple Game Modes** (Coming Soon):
  - Classic Mode
  - Survival Mode
  - Time Attack
  - Perfect Run
  - Zen Mode
- **Settings System**:
  - Graphics quality presets
  - Audio controls
  - Gameplay options
  - Customizable controls

## 🎯 How to Play

1. Use **Arrow Keys** or **A/D** keys to move your ship left and right
2. Catch the falling objects (notes, stars, diamonds) to score points
3. Each catch adds to your combo and creates rhythm
4. Missing an object ends the game
5. Level up every 5 catches for increased difficulty

## 🛠️ Installation

### Play Online
Simply open `index.html` in a modern web browser.

### Local Development
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/beat-catcher.git

# Navigate to the project
cd beat-catcher

# Open index.html in your browser
# Or use a local server like Live Server in VS Code
```

## 📁 Project Structure

```
beat-catcher/
├── index.html          # Main HTML file
├── style.css           # Styling and animations
├── game.js             # Core game logic
├── audio-visualizer.js # Sound and rhythm system
├── particle-system.js  # Particle effects
├── visual-effects.js   # Visual effects manager
├── game-modes.js       # Game mode implementations
├── settings-ui.js      # Settings management
└── powerups.js         # Power-up system
```

## 🎨 Customization

### Custom Ship Skins
1. Click "CUSTOMIZE SHIP" on the main menu
2. Click "UPLOAD IMAGE" 
3. Select an image file (recommended size: 100x70 pixels)
4. Your custom ship will be saved automatically

### Settings
Access the settings menu to customize:
- Graphics quality and effects
- Audio volumes
- Gameplay difficulty
- Control bindings

## 🔧 Technical Details

- **Built with**: Vanilla JavaScript, HTML5 Canvas
- **Audio**: Web Audio API for dynamic sound generation
- **Storage**: LocalStorage for settings and high scores
- **Performance**: Optimized for 60 FPS gameplay

## 🎵 Audio System

The game features a dynamic audio system that:
- Generates rhythmic beats using Web Audio API
- Plays different sounds for each object type
- Increases tempo as you progress
- Plays sad music on game over

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Created by [Baha](https://github.com/BahaWare)

## 🙏 Acknowledgments

- Inspired by rhythm games and dopamine-inducing gameplay mechanics
- Built with love for the gaming community

---

**Enjoy the game and catch the beat! 🎶**
