# AGENTS.md

This repository contains a collection of HTML5 games and interactive web applications. All games are standalone HTML files with embedded CSS and JavaScript.

## Project Structure

- **index.html** - Main game portal with navigation to all games
- **Game files** - Individual games (e.g., `ai-pet.html`, `space-dodger.html`, `game1.html`)
- **No build system** - All games are self-contained HTML files
- **No dependencies** - Uses only CDN libraries and vanilla JavaScript

## Development Commands

Since this is a static HTML project with no build system:

```bash
# Start local development server (any of these)
python -m http.server 8000
npx serve .
npx http-server

# Open specific game in browser
# Just navigate to the HTML file directly
```

## Testing Commands

No automated testing framework is configured. Manual testing approach:

```bash
# Manual testing checklist
# 1. Open each game in browser
# 2. Test core functionality
# 3. Check responsive design
# 4. Verify camera/microphone permissions for motion games
```

## Code Style Guidelines

### HTML Structure
- Use HTML5 DOCTYPE
- Set `lang="zh-HK"` for Chinese content
- Include viewport meta tag for responsive design
- Structure: `<!DOCTYPE html><html><head><style></style></head><body><script></script></body></html>`

### CSS Conventions
- Use CSS custom properties (variables) for colors: `--primary: #00d2ff;`
- Mobile-first responsive design with `@media` queries
- Use flexbox/grid for layouts
- Glass morphism effects: `backdrop-filter: blur(10px);`
- Smooth transitions: `transition: all 0.3s ease;`

### JavaScript Patterns
- Vanilla JavaScript (no frameworks)
- Use `const` and `let` instead of `var`
- Async/await for camera/microphone APIs
- Event delegation for dynamic elements
- RequestAnimationFrame for game loops
- Web Audio API for sound effects

### File Naming
- Use kebab-case for HTML files: `space-dodger.html`
- Use descriptive names: `ai-pet.html`, `face-dance.html`
- Game series: `game1.html`, `game2.html`, `game3.html`

### Import/External Resources
- Google Fonts for typography
- CDN libraries only when necessary
- Background removal library: `@imgly/background-removal`

### Error Handling
- Try-catch for camera/microphone permissions
- Graceful fallbacks for unsupported features
- User-friendly error messages in Chinese

### Performance Guidelines
- Optimize images and assets
- Use CSS transforms instead of JavaScript animations
- Debounce touch/mouse events
- Clean up event listeners and intervals

### Browser Compatibility
- Modern browsers (ES6+)
- Touch and mouse event support
- WebRTC/getUserMedia for camera games
- Speech Synthesis API for voice features

### Security Considerations
- No eval() or inline scripts in production
- Sanitize user inputs
- HTTPS required for camera/microphone access
- Content Security Policy considerations

### Game-Specific Patterns
- **Motion Games**: Use `getUserMedia()` and canvas for motion detection
- **Audio Games**: Web Audio API with oscillators for sound effects
- **Touch Games**: Touch events with preventDefault for mobile
- **AI Games**: Use CDN ML libraries for image processing

### Localization
- Chinese (Traditional) primary language
- Use `lang="zh-HK"` attribute
- Speech synthesis with appropriate language settings
- Cultural references in game themes

### Code Organization
- Single-file architecture (HTML + CSS + JS)
- Clear section comments in Chinese
- Logical function grouping
- Descriptive variable and function names

## Common Game Patterns

### Camera-Based Games
```javascript
// Standard camera initialization
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        // Game logic here
    } catch(e) {
        alert("請允許鏡頭權限");
    }
}
```

### Game Loop Structure
```javascript
function gameLoop() {
    if (!isRunning) return;
    
    // Update game state
    update();
    
    // Render frame
    render();
    
    requestAnimationFrame(gameLoop);
}
```

### Touch/Mouse Handling
```javascript
// Unified input handling
function handleInput(e) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    // Input logic here
}
```

## Deployment

- All files are static and can be deployed to any web server
- No build process required
- Ensure HTTPS for camera/microphone features
- Test on mobile devices for touch interactions

## Contributing

When adding new games:
1. Follow the single-file HTML structure
2. Include navigation back to `index.html`
3. Add game to the main portal with appropriate category
4. Test on both desktop and mobile devices
5. Ensure proper Chinese language support