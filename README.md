# NEXUS Game Portal 🎮

**Next Generation Personal Game Collection** - A collection of interactive HTML5 games with modern UI/UX and innovative gameplay features.

## 🚀 Project Overview

NEXUS is a personal game portal featuring a diverse collection of HTML5 games, ranging from camera-based motion games to classic arcade and brain games. All games are self-contained HTML files with embedded CSS and JavaScript, requiring no build system or external dependencies.

## 🎯 Key Features

### Enhanced Gameplay Experience
- **Improved Tutorial System**: Interactive step-by-step guides for each game type
- **Comprehensive Achievement System**: Game-specific and general achievements with point rewards
- **Visual Feedback Enhancements**: Particle effects, score animations, and immersive UI
- **Difficulty Settings**: Adjustable challenge levels for classic games
- **Progression Tracking**: Player stats, high scores, and game history

### Technical Improvements
- **Unified NEXUS System**: Centralized game management framework
- **Responsive Design**: Mobile-first approach with touch support
- **Performance Optimizations**: 60fps target with efficient rendering
- **Accessibility Features**: Colorblind modes, screen reader support
- **Offline Capability**: Service worker for progressive web app functionality

## 🎮 Game Categories

### 📷 WebCam Motion Games
- **Space Dodger**: Body movement control to dodge asteroids
- **Face Dance**: Expression-based rhythm game with AI detection
- **AI Rock Paper Scissors**: Camera-based gesture recognition
- **Galaxy Catcher**: Hand motion to catch falling stars
- **Air Piano**: Virtual piano played with hand movements

### 🕹️ Arcade Action Games
- **Stress Buster**: Physics-based destruction simulator
- **Neon Runner**: Endless runner with neon aesthetics
- **Orbit Rhythm**: Timing-based rhythm challenge

### 🧠 Classic & Brain Games
- **Minesweeper**: Classic puzzle game with multiple difficulty levels
- **Number Guessing**: Logic deduction challenge
- **Rock Paper Scissors**: Enhanced with AI difficulty levels

### 🐾 Special Features
- **AI Pet**: Interactive virtual pet with photo upload and physics
- **Jennifer Mode**: Alternative strict teacher mode for AI Pet

## 🛠️ Technical Architecture

### Core Systems
1. **NEXUS Framework** (`js/nexus-system.js`)
   - Sound management with Web Audio API
   - Visual feedback and toast notifications
   - Interactive tutorial system
   - Game progress tracking and achievements

2. **Unified UI** (`css/nexus-ui.css`)
   - Consistent design language
   - Glass morphism effects
   - Responsive breakpoints
   - Accessibility enhancements

3. **Game Structure**
   - Single-file HTML games
   - Vanilla JavaScript (no frameworks)
   - Canvas-based rendering for graphics
   - WebRTC for camera games

### File Structure
```
├── index.html              # Main game portal
├── css/
│   ├── nexus-ui.css       # Unified styling
│   └── global.css         # Base styles
├── js/
│   └── nexus-system.js    # Core framework
├── lib/                   # Utility libraries
├── game files/           # Individual HTML games
└── service-worker.js     # PWA support
```

## 📈 Recent Improvements

### Phase 1 Enhancements (Completed)
1. **Enhanced Tutorial System**
   - Step-by-step interactive guides
   - Game-specific instructions
   - "Don't show again" option
   - Completion tracking

2. **Achievement System**
   - 15+ game-specific achievements
   - Point-based reward system
   - Achievement popups with animations
   - Progress tracking across games

3. **Visual Feedback**
   - Particle effects for collisions
   - Score popup animations
   - Enhanced UI indicators
   - Motion detection visualization

4. **Difficulty Settings**
   - Easy/Medium/Hard modes for classic games
   - Adaptive AI behavior
   - Progressive challenge scaling

5. **Documentation**
   - Comprehensive project documentation
   - Development guidelines
   - Game design patterns

## 🚀 Getting Started

### Local Development
```bash
# Start development server
python -m http.server 8000
# or
npx serve .
# or
npx http-server
```

### Game Development Guidelines
1. **HTML Structure**: Follow single-file pattern with embedded CSS/JS
2. **NEXUS Integration**: Use `nexus-system.js` for common functionality
3. **Responsive Design**: Test on mobile (320px+) and desktop (1024px+)
4. **Performance**: Target 60fps, optimize asset loading
5. **Accessibility**: Include keyboard controls and screen reader support

### Code Style
- Use Chinese (Traditional) for UI text with `lang="zh-HK"`
- Follow AGENTS.md guidelines for HTML/CSS/JS patterns
- Use CSS custom properties for theming
- Implement graceful degradation for unsupported features

## 🔧 Development Commands

```bash
# Test all games
# Manual testing checklist:
# 1. Open each game in browser
# 2. Test core functionality
# 3. Check responsive design
# 4. Verify camera/microphone permissions for motion games

# Performance testing
# Use browser DevTools for:
# - FPS monitoring
# - Memory usage
# - Network loading times
```

## 📱 PWA Features

- **Offline Support**: Service worker caches game assets
- **Installable**: Add to home screen on mobile devices
- **Manifest**: App metadata and theme colors
- **Background Sync**: Future enhancement for leaderboards

## 🎨 Design System

### Color Palette
- Primary: `#00d2ff` (Cyan)
- Secondary: `#ff0055` (Magenta)
- Accent: `#ffeb3b` (Yellow)
- Background: Gradient from `#0f0c29` to `#24243e`

### Typography
- Headings: 'Orbitron' (sans-serif)
- Body: 'Poppins', 'Noto Sans TC' (Chinese support)

### UI Components
- Glass morphism cards with blur effects
- Animated buttons with hover states
- Toast notifications with icons
- Achievement popups with animations

## 🔮 Future Roadmap

### Phase 2 (Planned)
1. **Multiplayer Features**
   - Real-time competitive games
   - Leaderboard system
   - Social sharing

2. **Content Expansion**
   - More game genres
   - Seasonal events
   - User-generated content

3. **Advanced AI**
   - Machine learning for game adaptation
   - Personalized difficulty
   - Predictive gameplay

### Phase 3 (Long-term)
1. **Cross-platform Support**
   - Mobile app wrappers
   - Desktop applications
   - Console compatibility

2. **Community Features**
   - Game creation tools
   - Modding support
   - Online tournaments

## 📄 License & Credits

© 2024 NEXUS Game Station. Created with AI assistance.

All games are developed as educational projects and are free to use. Some games utilize third-party libraries:
- `@imgly/background-removal` for AI Pet background removal
- `@vladmandic/face-api` for Face Dance facial recognition
- Google Fonts for typography

## 🤝 Contributing

When adding new games:
1. Follow the single-file HTML structure
2. Include navigation back to `index.html`
3. Add game to the main portal with appropriate category
4. Test on both desktop and mobile devices
5. Ensure proper Chinese language support

---

**Enjoy gaming!** 🎮✨