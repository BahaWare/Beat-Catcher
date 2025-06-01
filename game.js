
// Multiplayer manager instance
this.multiplayerManager = null;
this.isMultiplayer = false;

class SkinManager {
    constructor() {
        this.currentSkin = 'default';
        this.customImage = null;
        this.presetEmojis = {
            'default': '🚀',
            'turkey': '🇹🇷',
            'usa': '🇺🇸',
            'germany': '🇩🇪'
        };
        
        // Load saved skin from localStorage
        const savedSkin = localStorage.getItem('shipSkin');
        const savedImage = localStorage.getItem('shipSkinImage');
        
        if (savedSkin) {
            this.currentSkin = savedSkin;
        }
        
        if (savedImage && savedSkin === 'custom') {
            this.loadCustomImage(savedImage);
        }
    }
    
    loadCustomImage(dataUrl) {
        this.customImage = new Image();
        this.customImage.onload = () => {
            this.currentSkin = 'custom';
            localStorage.setItem('shipSkin', 'custom');
            localStorage.setItem('shipSkinImage', dataUrl);
            this.updatePreview();
        };
        this.customImage.src = dataUrl;
    }
    
    setSkin(skinType) {
        this.currentSkin = skinType;
        localStorage.setItem('shipSkin', skinType);
        if (skinType !== 'custom') {
            localStorage.removeItem('shipSkinImage');
            this.customImage = null;
        }
        this.updatePreview();
    }
    
    updatePreview() {
        const canvas = document.getElementById('skin-preview-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background with stars
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some stars for effect
        for (let i = 0; i < 20; i++) {
            ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.random() + ')';
            ctx.beginPath();
            ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw ship preview
        const ship = new Ship(canvas.width / 2, canvas.height / 2);
        ship.skinManager = this;
        ship.draw(ctx);
    }
}

class Ship {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100; // Increased from 60 for easier catching
        this.height = 70; // Increased from 50
        this.speed = 8; // Increased from 6 for better responsiveness
        this.targetX = x;
        this.rotation = 0;
        this.trail = [];
        this.maxTrailLength = 10;
        this.glowIntensity = 0;
        this.wingAnimation = 0;
        this.skinManager = null;
    }
    
    update(keys, canvasWidth) {
        // Smooth movement
        if (keys.ArrowLeft || keys.KeyA) {
            this.targetX -= this.speed;
            this.rotation = -0.2;
        } else if (keys.ArrowRight || keys.KeyD) {
            this.targetX += this.speed;
            this.rotation = 0.2;
        } else {
            this.rotation *= 0.9;
        }
        
        // Constrain to canvas
        this.targetX = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.targetX));
        
        // Extra smooth interpolation
        this.x += (this.targetX - this.x) * 0.2; // Increased from 0.15 for better response
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y + this.height / 2 });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Update glow
        if (this.glowIntensity > 0) {
            this.glowIntensity -= 0.05;
        }
        
        // Animate wings
        this.wingAnimation += 0.1;
    }
    
    drawCountryShip(ctx, country) {
        // Draw custom ship design based on country
        const colors = {
            'turkey': ['#E30A17', '#FFFFFF'], // Red and white
            'usa': ['#B22234', '#FFFFFF', '#3C3B6E'], // Red, white, blue
            'germany': ['#000000', '#DD0000', '#FFCE00'] // Black, red, gold
        };
        
        const shipColors = colors[country];
        
        // Main body with country colors
        const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        if (country === 'turkey') {
            gradient.addColorStop(0, shipColors[0]);
            gradient.addColorStop(0.5, shipColors[1]);
            gradient.addColorStop(1, shipColors[0]);
        } else if (country === 'usa') {
            gradient.addColorStop(0, shipColors[2]);
            gradient.addColorStop(0.33, shipColors[1]);
            gradient.addColorStop(0.66, shipColors[0]);
            gradient.addColorStop(1, shipColors[1]);
        } else if (country === 'germany') {
            gradient.addColorStop(0, shipColors[0]);
            gradient.addColorStop(0.33, shipColors[1]);
            gradient.addColorStop(0.66, shipColors[2]);
            gradient.addColorStop(1, shipColors[2]);
        }
        
        ctx.fillStyle = gradient;
        
        // Main body
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2);
        ctx.bezierCurveTo(-this.width / 3, -this.height / 3, -this.width / 2, this.height / 3, -this.width / 2, this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 2);
        ctx.lineTo(-this.width / 4, this.height / 3);
        ctx.lineTo(0, this.height / 4);
        ctx.lineTo(this.width / 4, this.height / 3);
        ctx.lineTo(this.width / 4, this.height / 2);
        ctx.lineTo(this.width / 2, this.height / 2);
        ctx.bezierCurveTo(this.width / 2, this.height / 3, this.width / 3, -this.height / 3, 0, -this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        // Add country-specific details
        if (country === 'turkey') {
            // Add crescent and star
            ctx.fillStyle = shipColors[1];
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('☪', 0, -this.height / 4);
        } else if (country === 'usa') {
            // Add stars
            ctx.fillStyle = shipColors[1];
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('★', -10, -this.height / 4);
            ctx.fillText('★', 10, -this.height / 4);
            ctx.fillText('★', 0, -this.height / 3.5);
        } else if (country === 'germany') {
            // Add eagle symbol
            ctx.fillStyle = shipColors[0];
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✠', 0, -this.height / 4);
        }
        
        // Wings with animation
        const wingOffset = Math.sin(this.wingAnimation) * 5;
        
        // Left wing
        ctx.fillStyle = shipColors[0] + 'CC'; // Add transparency
        ctx.beginPath();
        ctx.moveTo(-this.width / 3, 0);
        ctx.lineTo(-this.width * 0.7, wingOffset);
        ctx.lineTo(-this.width * 0.6, this.height / 4 + wingOffset);
        ctx.lineTo(-this.width / 3, this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(this.width / 3, 0);
        ctx.lineTo(this.width * 0.7, wingOffset);
        ctx.lineTo(this.width * 0.6, this.height / 4 + wingOffset);
        ctx.lineTo(this.width / 3, this.height / 4);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.ellipse(-this.width / 4, this.height / 2, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(this.width / 4, this.height / 2, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }
    
    draw(ctx) {
        // Draw trail
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        this.trail.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Reset shadow to prevent black overlay
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        
        // Check if we should draw custom skin
        if (this.skinManager && this.skinManager.currentSkin === 'custom' && this.skinManager.customImage) {
            // Draw custom image
            ctx.drawImage(
                this.skinManager.customImage,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            
            // Add glow effect
            if (this.glowIntensity > 0) {
                ctx.shadowBlur = 20 + this.glowIntensity * 30;
                ctx.shadowColor = '#00ffff';
                ctx.globalAlpha = 0.5;
                ctx.drawImage(
                    this.skinManager.customImage,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
        } else if (this.skinManager && this.skinManager.currentSkin !== 'default') {
            // Draw country-themed ships
            this.drawCountryShip(ctx, this.skinManager.currentSkin);
            
            // Add glow effect when catching
            if (this.glowIntensity > 0) {
                ctx.shadowBlur = 20 + this.glowIntensity * 30;
                ctx.shadowColor = '#00ffff';
                ctx.fill();
            }
        } else {
            // Draw default ship
            // Ship body gradient
            const gradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            gradient.addColorStop(0, '#ff00ff');
            gradient.addColorStop(0.5, '#00ffff');
            gradient.addColorStop(1, '#ffff00');
            
            // Draw futuristic ship design
            ctx.fillStyle = gradient;
            
            // Main body
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.bezierCurveTo(-this.width / 3, -this.height / 3, -this.width / 2, this.height / 3, -this.width / 2, this.height / 2);
            ctx.lineTo(-this.width / 4, this.height / 2);
            ctx.lineTo(-this.width / 4, this.height / 3);
            ctx.lineTo(0, this.height / 4);
            ctx.lineTo(this.width / 4, this.height / 3);
            ctx.lineTo(this.width / 4, this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2);
            ctx.bezierCurveTo(this.width / 2, this.height / 3, this.width / 3, -this.height / 3, 0, -this.height / 2);
            ctx.closePath();
            ctx.fill();
            
            // Wings with animation
            const wingOffset = Math.sin(this.wingAnimation) * 5;
            
            // Left wing
            ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(-this.width / 3, 0);
            ctx.lineTo(-this.width * 0.7, wingOffset);
            ctx.lineTo(-this.width * 0.6, this.height / 4 + wingOffset);
            ctx.lineTo(-this.width / 3, this.height / 4);
            ctx.closePath();
            ctx.fill();
            
            // Right wing
            ctx.beginPath();
            ctx.moveTo(this.width / 3, 0);
            ctx.lineTo(this.width * 0.7, wingOffset);
            ctx.lineTo(this.width * 0.6, this.height / 4 + wingOffset);
            ctx.lineTo(this.width / 3, this.height / 4);
            ctx.closePath();
            ctx.fill();
            
            // Cockpit
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.ellipse(0, -this.height / 4, this.width / 8, this.height / 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Engine glow
            ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.beginPath();
            ctx.ellipse(-this.width / 4, this.height / 2, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(this.width / 4, this.height / 2, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Ship glow when catching
            if (this.glowIntensity > 0) {
                ctx.shadowBlur = 20 + this.glowIntensity * 30;
                ctx.shadowColor = '#00ffff';
                ctx.fill();
            }
        }
        
        ctx.restore();
    }
    
    catch() {
        this.glowIntensity = 1;
    }
}

class FallingObject {
    constructor(x, y, type = 'note') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.speed = 1.5; // Reduced from 2 for easier catching
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.pulse = 0;
        this.caught = false;
        this.missed = false;
        
        if (type === 'note') {
            this.width = 40; // Increased from 30
            this.height = 40;
            this.color = '#00ff00';
            this.points = 100;
        } else if (type === 'star') {
            this.width = 50; // Increased from 40
            this.height = 50;
            this.color = '#ffff00';
            this.points = 200;
            this.rotationSpeed = 0.1;
        } else if (type === 'diamond') {
            this.width = 45; // Increased from 35
            this.height = 45;
            this.color = '#ff00ff';
            this.points = 150;
        }
    }
    
    update(level) {
        // Speed increases with level but more gradually
        this.y += this.speed + (level * 0.2); // Reduced from 0.3
        this.rotation += this.rotationSpeed;
        this.pulse += 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);
        
        // Glowing effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '88');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        
        if (this.type === 'note') {
            // Musical note shape
            ctx.beginPath();
            ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♪', 0, 0);
        } else if (this.type === 'star') {
            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.width / 2;
                const y = Math.sin(angle) * this.height / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (this.width / 4);
                const innerY = Math.sin(innerAngle) * (this.height / 4);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'diamond') {
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, 0);
            ctx.lineTo(0, this.height / 2);
            ctx.lineTo(-this.width / 2, 0);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    checkCatch(ship) {
        const dx = Math.abs(this.x - ship.x);
        const dy = Math.abs(this.y - ship.y);
        
        // Even more forgiving catch area
        const catchMultiplier = 1.3; // Increased catch area by 30%
        if (dx < ((this.width + ship.width) / 2) * catchMultiplier && 
            dy < ((this.height + ship.height) / 2) * catchMultiplier) {
            this.caught = true;
            return true;
        }
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        this.skinManager = new SkinManager();
        this.ship = new Ship(this.width / 2, this.height - 100);
        this.ship.skinManager = this.skinManager;
        
        this.fallingObjects = [];
        this.particleSystem = new ParticleSystem();
        this.starField = new StarField(this.width, this.height);
        this.audioVisualizer = new AudioVisualizer();
        
        this.score = 0;
        this.catches = 0;
        this.level = 1;
        this.catchStreak = 0;
        this.gameState = 'menu';
        this.keys = {};
        this.lastSpawnTime = 0;
        this.spawnInterval = 3000;
        this.menuHue = 0;
        this.sadMusicTimer = 0;
        this.gameOverTimer = 0;
        this.borderHue = 0;
        
        this.init();
    }
    
    async init() {

        // Initialize multiplayer
        this.multiplayerManager = new FirebaseMultiplayer();
        this.multiplayerManager.init(this);
        MultiplayerUI.createMultiplayerMenu();
        MultiplayerUI.addMultiplayerStyles();

        // Initialize audio
        await this.audioVisualizer.init();
        
        // Set up event listeners
        this.setupEventListeners();

        // Initialize mobile controls
        this.mobileControls = new MobileControls(this);
        
        // Update skin preview
        this.skinManager.updatePreview();
        
        // Start game loop
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // UI buttons
        document.getElementById('start-button').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-button').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('main-menu-button').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        document.getElementById('mute-button').addEventListener('click', () => {
            this.toggleMute();
        });
        
        // Skin menu buttons
        document.getElementById('skins-button').addEventListener('click', () => {
            this.openSkinsMenu();
        });
        
        document.getElementById('back-to-menu-button').addEventListener('click', () => {
            this.closeSkinsMenu();
        });
        
        document.getElementById('upload-skin-button').addEventListener('click', () => {
            document.getElementById('skin-upload').click();
        });
        
        document.getElementById('skin-upload').addEventListener('change', (e) => {
            this.handleSkinUpload(e);
        });
        
        // Game Modes button
        document.getElementById('modes-button').addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('game-modes').classList.remove('hidden');
        });
        
        // Game Modes back button
        document.getElementById('back-from-modes-button').addEventListener('click', () => {
            document.getElementById('game-modes').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
        
        // Achievements button
        document.getElementById('achievements-button').addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('achievements').classList.remove('hidden');
        });
        
        // Achievements back button
        document.getElementById('back-from-achievements-button').addEventListener('click', () => {
            document.getElementById('achievements').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
        
        // Settings button
        document.getElementById('settings-button').addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('settings').classList.remove('hidden');
        });
        
        // Settings back button
        document.getElementById('back-from-settings-button').addEventListener('click', () => {
            document.getElementById('settings').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });

        // Reset settings button
document.getElementById('reset-settings-button').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        // Reset all settings to default values
        
        // Graphics settings
        document.getElementById('quality-preset').value = 'medium';
        document.getElementById('particles-toggle').checked = true;
        document.getElementById('screenshake-toggle').checked = true;
        document.getElementById('chromatic-toggle').checked = true;
        document.getElementById('motionblur-toggle').checked = true;
        document.getElementById('beateffects-toggle').checked = true;
        
        // Audio settings
        document.getElementById('master-volume').value = 100;
        document.getElementById('sfx-volume').value = 100;
        document.getElementById('music-volume').value = 100;
        
        // Update volume displays
        const volumeDisplays = document.querySelectorAll('.volume-value');
        volumeDisplays.forEach(display => {
            display.textContent = '100%';
        });
        
        // Gameplay settings
        document.getElementById('difficulty-select').value = 'normal';
        document.getElementById('autorestart-toggle').checked = false;
        document.getElementById('showfps-toggle').checked = false;
        document.getElementById('showhitbox-toggle').checked = false;
        
        // Clear localStorage
        localStorage.removeItem('gameSettings');
        
        // Save new default settings
        const defaultSettings = {
            graphics: {
                particles: true,
                screenShake: true,
                chromaticAberration: true,
                motionBlur: true,
                beatEffects: true,
                quality: 'medium'
            },
            audio: {
                masterVolume: 1,
                sfxVolume: 1,
                musicVolume: 1,
                beatSync: true
            },
            gameplay: {
                difficulty: 'normal',
                autoRestart: false,
                showFPS: false,
                showHitboxes: false
            },
            controls: {
                moveLeft: ['ArrowLeft', 'KeyA'],
                moveRight: ['ArrowRight', 'KeyD'],
                pause: ['Escape', 'KeyP'],
                boost: ['Space']
            }
        };
        
        localStorage.setItem('gameSettings', JSON.stringify(defaultSettings));
        
        alert('Settings have been reset to default!');
    }
});

        
        // Preset skin buttons
        document.querySelectorAll('.skin-preset').forEach(button => {
            button.addEventListener('click', (e) => {
                const skinType = e.currentTarget.getAttribute('data-skin');
                this.selectPresetSkin(skinType);
            });
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.starField.resize(this.width, this.height);
        });
    }
    
    openSkinsMenu() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('skins-screen').classList.remove('hidden');
        this.skinManager.updatePreview();
        
        // Update active preset button
        document.querySelectorAll('.skin-preset').forEach(button => {
            const skinType = button.getAttribute('data-skin');
            if (skinType === this.skinManager.currentSkin) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    closeSkinsMenu() {
        document.getElementById('skins-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }
    
    selectPresetSkin(skinType) {
        this.skinManager.setSkin(skinType);
        
        // Update active button
        document.querySelectorAll('.skin-preset').forEach(button => {
            if (button.getAttribute('data-skin') === skinType) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }
    
    handleSkinUpload(event) {
        const file = event.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            alert('Please upload a valid image file!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.skinManager.loadCustomImage(e.target.result);
            
            // Remove active class from all preset buttons
            document.querySelectorAll('.skin-preset').forEach(button => {
                button.classList.remove('active');
            });
        };
        reader.readAsDataURL(file);
    }
    
    returnToMenu() {
        this.gameState = 'menu';
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        if (this.audioVisualizer) {
            this.audioVisualizer.pause();
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.catches = 0;
        this.level = 1;
        this.catchStreak = 0;
        this.fallingObjects = [];
        this.ship = new Ship(this.width / 2, this.height - 100);
        this.ship.skinManager = this.skinManager;
        this.particleSystem.clear();
        this.sadMusicTimer = 0;
        this.gameOverTimer = 0;
        
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('skins-screen').classList.add('hidden');
        
        this.updateUI();
        
        if (this.audioVisualizer) {
            this.audioVisualizer.resume();
            this.audioVisualizer.setTempo(120);
        }
    }
    
    spawnObject() {
        const types = ['note', 'star', 'diamond'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * (this.width - 200) + 100; // More centered spawning
        
        this.fallingObjects.push(new FallingObject(x, -50, type));
    }
    
    update() {
        // Update RGB hues
        this.menuHue = (this.menuHue + 0.5) % 360;
        this.borderHue = (this.borderHue + 1) % 360;
        
        // Update menu background
        if (this.gameState === 'menu' || this.gameState === 'gameover') {
            const gameContainer = document.getElementById('game-container');
            gameContainer.style.background = `linear-gradient(45deg, 
                hsl(${this.menuHue}, 100%, 20%), 
                hsl(${(this.menuHue + 60) % 360}, 100%, 20%), 
                hsl(${(this.menuHue + 120) % 360}, 100%, 20%))`;
        }
        
        if (this.gameState !== 'playing' && this.gameState !== 'gameending') return;
        
        // Update ship
        this.ship.update(this.keys, this.width);
        
        // Update mobile controls visibility
        if (this.mobileControls) {
        this.mobileControls.update();
        }

        // Only spawn objects if not in game ending state
        if (this.gameState === 'playing') {
            // Spawn objects based on level
            const adjustedInterval = Math.max(1500, this.spawnInterval - (this.level * 100)); // More gradual difficulty
            if (Date.now() - this.lastSpawnTime > adjustedInterval) {
                this.spawnObject();
                this.lastSpawnTime = Date.now();
            }
        }
        
        // Update falling objects
        this.fallingObjects = this.fallingObjects.filter(obj => {
            obj.update(this.level);
            
            // Check if caught
            if (obj.checkCatch(this.ship)) {
                this.onCatch(obj);
                return false;
            }
            
            // Check if missed (went off screen)
            if (obj.y > this.height + 50) {
                if (this.gameState === 'playing') {
                    this.onMiss();
                }
                return false;
            }
            
            return true;
        });
        
        // Update particles and stars
        this.particleSystem.update();
        this.starField.update(1, 1 + this.catchStreak * 0.02);
        
        // Handle sad music timer
        if (this.sadMusicTimer > 0) {
            this.sadMusicTimer--;
            if (this.sadMusicTimer === 0 && this.gameOverTimer === 0) {
                // Resume normal music
                this.audioVisualizer.setTempo(120 + (this.level * 10));
            }
        }
        
        // Handle game over timer
        if (this.gameOverTimer > 0) {
            this.gameOverTimer--;
            if (this.gameOverTimer === 0) {
                this.gameOver();
            }
        }
    }
    
    onCatch(obj) {
        if (this.gameState !== 'playing') return;
        
        this.score += obj.points * this.level;
        this.catches++;
        this.catchStreak++;
        
        // Visual feedback
        this.ship.catch();
        this.particleSystem.createExplosion(obj.x, obj.y, 15);
        this.particleSystem.addParticle(obj.x, obj.y, 'star', 5);
        
        // Audio feedback - create rhythm
        this.audioVisualizer.playNote(obj.type);
        
        // Increase tempo with catches but more gradually
        const newTempo = 120
 + (this.catchStreak) + (this.level * 5);
        this.audioVisualizer.setTempo(Math.min(newTempo, 180)); // Lower max tempo
        
        // Level up every 5 catches
        if (this.catches % 5 === 0) {
            this.levelUp();
        }
        
        this.updateUI();
    }
    
    onMiss() {
        this.catchStreak = 0;
        this.gameState = 'gameending'; // New state to prevent further spawning
        
        // Play sad music for 3 seconds
        this.sadMusicTimer = 180; // 3 seconds at 60 FPS
        this.audioVisualizer.playSadMusic();
        
        // Show game over message
        this.gameOverTimer = 180; // Show for 3 seconds then end game
        
        // Visual feedback
        document.getElementById('game-container').classList.add('distorted');
        setTimeout(() => {
            document.getElementById('game-container').classList.remove('distorted');
        }, 500);
        
        this.updateUI();
    }
    
    levelUp() {
        this.level++;
        
        // Celebration effect
        for (let i = 0; i < 20; i++) {
            this.particleSystem.addParticle(
                Math.random() * this.width,
                Math.random() * this.height,
                'star',
                1
            );
        }
        
        // Flash effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Show level up text
        this.showLevelUpText();
        
        this.updateUI();
    }
    
    showLevelUpText() {
        const levelUpDiv = document.createElement('div');
        levelUpDiv.style.position = 'fixed';
        levelUpDiv.style.top = '50%';
        levelUpDiv.style.left = '50%';
        levelUpDiv.style.transform = 'translate(-50%, -50%)';
        levelUpDiv.style.fontSize = '96px';
        levelUpDiv.style.fontWeight = 'bold';
        levelUpDiv.style.textShadow = '0 0 60px rgba(255, 255, 255, 1)';
        levelUpDiv.style.zIndex = '1000';
        levelUpDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif';
        levelUpDiv.textContent = 'LEVEL UP!';
        
        // Create flashing white/RGB animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes levelUpFlash {
                0%, 100% { 
                    color: #fff;
                    transform: translate(-50%, -50%) scale(1);
                }
                25% { 
                    color: #ff00ff;
                    transform: translate(-50%, -50%) scale(1.1);
                }
                50% { 
                    color: #00ffff;
                    transform: translate(-50%, -50%) scale(1.2);
                }
                75% { 
                    color: #ffff00;
                    transform: translate(-50%, -50%) scale(1.1);
                }
            }
        `;
        document.head.appendChild(style);
        
        levelUpDiv.style.animation = 'levelUpFlash 0.5s ease infinite';
        
        document.body.appendChild(levelUpDiv);
        
        setTimeout(() => {
            document.body.removeChild(levelUpDiv);
            document.head.removeChild(style);
        }, 2000);
    }
    
    gameOver() {
        this.gameState = 'gameover';
        
        document.getElementById('final-score-value').textContent = this.score;
        document.getElementById('best-combo-value').textContent = this.catches;
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        if (this.audioVisualizer) {
            // Don't pause immediately, let the sad music finish
            setTimeout(() => {
                this.audioVisualizer.pause();
            }, 100);
        }
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('combo').textContent = `x${this.catchStreak}`;
        document.getElementById('multiplier').textContent = `Lv.${this.level}`;
    }
    
    toggleMute() {
        this.isMuted = !this.isMuted;
        document.getElementById('mute-button').textContent = this.isMuted ? '🔇' : '🔊';
        
        if (this.audioVisualizer) {
            this.audioVisualizer.setVolume(this.isMuted ? 0 : 1);
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw stars
        this.starField.draw(this.ctx);
        
        // Draw RGB border for menu and game
        if (this.gameState === 'menu' || this.gameState === 'playing' || this.gameState === 'gameending') {
            this.drawRGBBorder();
        }
        
        // Draw game objects
        if (this.gameState === 'playing' || this.gameState === 'gameending') {
            // Draw falling objects
            this.fallingObjects.forEach(obj => obj.draw(this.ctx));
            
            // Draw ship
            this.ship.draw(this.ctx);
            
            // Draw level indicator
            this.drawLevel();
            
            // Draw game over warning if active
            if (this.gameOverTimer > 0) {
                this.drawGameOverWarning();
            }
            
            // Draw rhythm indicator
            this.drawRhythmIndicator();
        }
        
        // Draw particles
        this.particleSystem.draw(this.ctx);
    }
    
    drawRGBBorder() {
        const borderWidth = 10;
        
        this.ctx.save();
        
        // Create gradient for each border
        const gradientTop = this.ctx.createLinearGradient(0, 0, this.width, 0);
        const gradientBottom = this.ctx.createLinearGradient(0, this.height, this.width, this.height);
        const gradientLeft = this.ctx.createLinearGradient(0, 0, 0, this.height);
        const gradientRight = this.ctx.createLinearGradient(this.width, 0, this.width, this.height);
        
        // Add color stops
        for (let i = 0; i <= 1; i += 0.1) {
            const hue = (this.borderHue + i * 360) % 360;
            const color = `hsl(${hue}, 100%, 50%)`;
            gradientTop.addColorStop(i, color);
            gradientBottom.addColorStop(i, color);
            gradientLeft.addColorStop(i, color);
            gradientRight.addColorStop(i, color);
        }
        
        // Draw borders
        this.ctx.fillStyle = gradientTop;
        this.ctx.fillRect(0, 0, this.width, borderWidth);
        
        this.ctx.fillStyle = gradientBottom;
        this.ctx.fillRect(0, this.height - borderWidth, this.width, borderWidth);
        
        this.ctx.fillStyle = gradientLeft;
        this.ctx.fillRect(0, 0, borderWidth, this.height);
        
        this.ctx.fillStyle = gradientRight;
        this.ctx.fillRect(this.width - borderWidth, 0, borderWidth, this.height);
        
        this.ctx.restore();
    }
    
    drawLevel() {
        this.ctx.save();
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "SF Pro Display", Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`LEVEL ${this.level}`, this.width / 2, 50);
        
        // Progress bar to next level (now 5 catches)
        const progress = (this.catches % 5) / 5;
        const barWidth = 200;
        const barHeight = 10;
        const barX = (this.width - barWidth) / 2;
        const barY = 70;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Progress
        const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        gradient.addColorStop(0, '#ff00ff');
        gradient.addColorStop(0.5, '#00ffff');
        gradient.addColorStop(1, '#ffff00');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(barX, barY, barWidth * progress, barHeight);
        
        this.ctx.restore();
    }
    
    drawRhythmIndicator() {
        // Draw rhythm loop indicator at bottom
        const indicatorY = this.height - 40;
        const indicatorWidth = this.width - 100;
        const indicatorX = 50;
        const beatWidth = indicatorWidth / 16; // 16 beat loop
        
        this.ctx.save();
        
        // Draw beat boxes
        for (let i = 0; i < 16; i++) {
            const x = indicatorX + (i * beatWidth);
            
            // Background
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.fillRect(x, indicatorY, beatWidth - 2, 20);
            
            // Highlight current beat
            if (this.audioVisualizer && i === this.audioVisualizer.currentBeat) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.fillRect(x, indicatorY, beatWidth - 2, 20);
            }
            
            // Show scheduled notes
            if (this.audioVisualizer && this.audioVisualizer.scheduledNotes[i]) {
                const notes = this.audioVisualizer.scheduledNotes[i];
                notes.forEach((note, index) => {
                    if (note.type === 'note') this.ctx.fillStyle = '#00ff00';
                    else if (note.type === 'star') this.ctx.fillStyle = '#ffff00';
                    else if (note.type === 'diamond') this.ctx.fillStyle = '#ff00ff';
                    
                    this.ctx.fillRect(x + 2, indicatorY + 2 + (index * 6), beatWidth - 6, 4);
                });
            }
        }
        
        this.ctx.restore();
    }
    
    drawGameOverWarning() {
        this.ctx.save();
        
        // RGB text effect
        const hue = (Date.now() * 0.1) % 360;
        this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        this.ctx.font = 'bold 72px -apple-system, BlinkMacSystemFont, "SF Pro Display", Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
        
        const timeLeft = Math.ceil(this.gameOverTimer / 60);
        this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "SF Pro Display", Arial';
        this.ctx.fillText(`in ${timeLeft}...`, this.width / 2, this.height / 2 + 80);
        this.ctx.restore();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});
