class SettingsManager {
    constructor() {
        this.settings = {
            graphics: {
                particles: true,
                screenShake: true,
                chromaticAberration: true,
                motionBlur: true,
                beatEffects: true,
                quality: 'high' // low, medium, high
            },
            audio: {
                masterVolume: 1,
                sfxVolume: 1,
                musicVolume: 1,
                beatSync: true
            },
            gameplay: {
                difficulty: 'normal', // easy, normal, hard
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
        
        this.loadSettings();
    }
    
    getSetting(category, setting) {
        return this.settings[category]?.[setting];
    }
    
    setSetting(category, setting, value) {
        if (this.settings[category]) {
            this.settings[category][setting] = value;
            this.saveSettings();
            this.applySettings();
        }
    }
    
    applySettings() {
        // Apply quality presets
        if (this.settings.graphics.quality === 'low') {
            this.settings.graphics.particles = false;
            this.settings.graphics.motionBlur = false;
            this.settings.graphics.chromaticAberration = false;
        } else if (this.settings.graphics.quality === 'medium') {
            this.settings.graphics.particles = true;
            this.settings.graphics.motionBlur = false;
            this.settings.graphics.chromaticAberration = true;
        }
        
        // Notify game of settings changes
        window.dispatchEvent(new CustomEvent('settingsChanged', { detail: this.settings }));
    }
    
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
    
    resetSettings() {
        localStorage.removeItem('gameSettings');
        location.reload();
    }
}

class UIManager {
    constructor() {
        this.activeScreen = 'main-menu';
        this.notifications = [];
        this.achievementQueue = [];
        this.powerUpDisplay = [];
        this.comboAnimations = [];
        
        this.createUIElements();
    }
    
    createUIElements() {
        // Create settings screen
        const settingsHTML = `
            <div id="settings-screen" class="screen hidden">
                <h2 class="game-title">SETTINGS</h2>
                
                <div class="settings-tabs">
                    <button class="tab-button active" data-tab="graphics">Graphics</button>
                    <button class="tab-button" data-tab="audio">Audio</button>
                    <button class="tab-button" data-tab="gameplay">Gameplay</button>
                    <button class="tab-button" data-tab="controls">Controls</button>
                </div>
                
                <div class="settings-content">
                    <div id="graphics-tab" class="tab-content active">
                        <div class="setting-group">
                            <label>Quality Preset</label>
                            <select id="quality-preset">
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high" selected>High</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="particles-toggle" checked>
                                Particle Effects
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="screenshake-toggle" checked>
                                Screen Shake
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="chromatic-toggle" checked>
                                Chromatic Aberration
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="motionblur-toggle" checked>
                                Motion Blur
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="beateffects-toggle" checked>
                                Beat Effects
                            </label>
                        </div>
                    </div>
                    
                    <div id="audio-tab" class="tab-content hidden">
                        <div class="setting-group">
                            <label>Master Volume</label>
                            <input type="range" id="master-volume" min="0" max="100" value="100">
                            <span class="volume-value">100%</span>
                        </div>
                        
                        <div class="setting-group">
                            <label>SFX Volume</label>
                            <input type="range" id="sfx-volume" min="0" max="100" value="100">
                            <span class="volume-value">100%</span>
                        </div>
                        
                        <div class="setting-group">
                            <label>Music Volume</label>
                            <input type="range" id="music-volume" min="0" max="100" value="100">
                            <span class="volume-value">100%</span>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="beatsync-toggle" checked>
                                Beat Synchronization
                            </label>
                        </div>
                    </div>
                    
                    <div id="gameplay-tab" class="tab-content hidden">
                        <div class="setting-group">
                            <label>Difficulty</label>
                            <select id="difficulty-select">
                                <option value="easy">Easy</option>
                                <option value="normal" selected>Normal</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="autorestart-toggle">
                                Auto Restart
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="showfps-toggle">
                                Show FPS
                            </label>
                        </div>
                        
                        <div class="setting-group">
                            <label>
                                <input type="checkbox" id="showhitbox-toggle">
                                Show Hitboxes
                            </label>
                        </div>
                    </div>
                    
                    <div id="controls-tab" class="tab-content hidden">
                        <div class="controls-info">
                            <p>Click on a control to rebind</p>
                        </div>
                        
                        <div class="control-binding">
                            <span>Move Left</span>
                            <button class="key-bind" data-action="moveLeft">A / ←</button>
                        </div>
                        
                        <div class="control-binding">
                            <span>Move Right</span>
                            <button class="key-bind" data-action="moveRight">D / →</button>
                        </div>
                        
                        <div class="control-binding">
                            <span>Pause</span>
                            <button class="key-bind" data-action="pause">ESC / P</button>
                        </div>
                        
                        <div class="control-binding">
                            <span>Boost</span>
                            <button class="key-bind" data-action="boost">SPACE</button>
                        </div>
                    </div>
                </div>
                
                <div class="settings-buttons">
                    <button id="reset-settings-button" class="neon-button">Reset to Default</button>
                    <button id="back-from-settings-button" class="neon-button">Back</button>
                </div>
            </div>
        `;
        
        // Create game modes screen
        const gameModesHTML = `
            <div id="game-modes-screen" class="screen hidden">
                <h2 class="game-title">GAME MODES</h2>
                
                <div class="modes-grid">
                    <div class="mode-card" data-mode="classic">
                        <div class="mode-icon">🎮</div>
                        <h3>Classic</h3>
                        <p>The original experience</p>
                        <div class="mode-status unlocked">PLAY</div>
                    </div>
                    
                    <div class="mode-card" data-mode="survival">
                        <div class="mode-icon">♾️</div>
                        <h3>Survival</h3>
                        <p>How long can you last?</p>
                        <div class="mode-status locked">REACH LEVEL 10</div>
                    </div>
                    
                    <div class="mode-card" data-mode="timeAttack">
                        <div class="mode-icon">⏱️</div>
                        <h3>Time Attack</h3>
                        <p>Score rush in 60 seconds</p>
                        <div class="mode-status locked">100 CATCHES</div>
                    </div>
                    
                    <div class="mode-card" data-mode="perfectRun">
                        <div class="mode-icon">💎</div>
                        <h3>Perfect Run</h3>
                        <p>No mistakes allowed</p>
                        <div class="mode-status locked">50 STREAK</div>
                    </div>
                    
                    <div class="mode-card" data-mode="zen">
                        <div class="mode-icon">🧘</div>
                        <h3>Zen Mode</h3>
                        <p>Relax and enjoy the music</p>
                        <div class="mode-status locked">PLAY 30 MIN</div>
                    </div>
                </div>
                
                <button id="back-from-modes-button" class="neon-button">Back</button>
            </div>
        `;
        
        // Create achievements screen
        const achievementsHTML = `
            <div id="achievements-screen" class="screen hidden">
                <h2 class="game-title">ACHIEVEMENTS</h2>
                
                <div class="achievements-stats">
                    <div class="stat-box">
                        <span class="stat-label">Total Score</span>
                        <span class="stat-value" id="total-score-stat">0</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Total Catches</span>
                        <span class="stat-value" id="total-catches-stat">0</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Best Streak</span>
                        <span class="stat-value" id="best-streak-stat">0</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Player Level</span>
                        <span class="stat-value" id="player-level-stat">1</span>
                    </div>
                </div>
                
                <div class="achievements-grid" id="achievements-list">
                    <!-- Achievements will be populated here -->
                </div>
                
                <button id="back-from-achievements-button" class="neon-button">Back</button>
            </div>
        `;
        
        // Create pause menu
        const pauseMenuHTML = `
            <div id="pause-menu" class="screen hidden">
                <h2 class="game-title">PAUSED</h2>
                
                <div class="pause-buttons">
                    <button id="resume-button" class="neon-button">Resume</button>
                    <button id="pause-settings-button" class="neon-button">Settings</button>
                    <button id="quit-button" class="neon-button">Quit to Menu</button>
                </div>
            </div>
        `;
        
        // Create power-up display
        const powerUpDisplayHTML = `
            <div id="powerup-display">
                <!-- Active power-ups will be shown here -->
            </div>
        `;
        
        // Create notification system
        const notificationHTML = `
            <div id="notification-container"></div>
        `;
        
        // Create FPS counter
        const fpsCounterHTML = `
            <div id="fps-counter" class="hidden">FPS: 0</div>
        `;
        
        // Add all UI elements to the game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.insertAdjacentHTML('beforeend', settingsHTML);
        gameContainer.insertAdjacentHTML('beforeend', gameModesHTML);
        gameContainer.insertAdjacentHTML('beforeend', achievementsHTML);
        gameContainer.insertAdjacentHTML('beforeend', pauseMenuHTML);
        gameContainer.insertAdjacentHTML('beforeend', powerUpDisplayHTML);
        gameContainer.insertAdjacentHTML('beforeend', notificationHTML);
        gameContainer.insertAdjacentHTML('beforeend', fpsCounterHTML);
    }
    
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        container.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    showAchievement(achievement) {
        const achievementPopup = document.createElement('div');
        achievementPopup.className = 'achievement-popup';
        achievementPopup.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <h3>Achievement Unlocked!</h3>
                <p>${achievement.name}</p>
                <span>${achievement.description}</span>
            </div>
        `;
        
        document.body.appendChild(achievementPopup);
        
        // Animate
        setTimeout(() => achievementPopup.classList.add('show'), 10);
        setTimeout(() => {
            achievementPopup.classList.remove('show');
            setTimeout(() => achievementPopup.remove(), 500);
        }, 4000);
    }
    
    updatePowerUpDisplay(activePowerUps) {
        const display = document.getElementById('powerup-display');
        display.innerHTML = '';
        
        activePowerUps.forEach(powerUp => {
            const element = document.createElement('div');
            element.className = 'active-powerup';
            element.innerHTML = `
                <span class="powerup-icon">${powerUp.icon}</span>
                <div class="powerup-timer" style="width: ${powerUp.remaining}%"></div>
            `;
            display.appendChild(element);
        });
    }
    
    showComboAnimation(combo) {
        const comboText = document.createElement('div');
        comboText.className = 'combo-popup';
        comboText.textContent = `${combo}x COMBO!`;
        comboText.style.left = '50%';
        comboText.style.top = '40%';
        
        document.getElementById('game-container').appendChild(comboText);
        
        setTimeout(() => comboText.remove(), 1000);
    }
    
    updateFPS(fps) {
        const counter = document.getElementById('fps-counter');
        counter.textContent = `FPS: ${Math.round(fps)}`;
    }
    
    switchScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show requested screen
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.remove('hidden');
            this.activeScreen = screenName;
        }
    }


    
}
