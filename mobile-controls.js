// Mobile Controls for Beat Catcher
class MobileControls {
    constructor(game) {
        this.game = game;
        this.touchStartX = null;
        this.touchCurrentX = null;
        this.isTouching = false;
        
        this.setupTouchControls();
        this.createTouchButtons();
        this.detectMobile();
    }
    
    detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            document.body.classList.add('mobile-device');
            this.showMobileUI();
        }
        return isMobile;
    }
    
    setupTouchControls() {
        const canvas = document.getElementById('gameCanvas');
        
        // Touch events for movement
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchCurrentX = touch.clientX;
            this.isTouching = true;
            
            // Direct ship control
            if (this.game.ship && this.game.gameState === 'playing') {
                this.game.ship.targetX = touch.clientX;
            }
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.isTouching) return;
            
            const touch = e.touches[0];
            this.touchCurrentX = touch.clientX;
            
            // Move ship based on touch position
            if (this.game.ship && this.game.gameState === 'playing') {
                this.game.ship.targetX = touch.clientX;
            }
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isTouching = false;
            this.touchStartX = null;
            this.touchCurrentX = null;
        });
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target.id === 'gameCanvas') {
                e.preventDefault();
            }
        }, { passive: false });
    }
    
    createTouchButtons() {
        // Create mobile control overlay
        const mobileControls = document.createElement('div');
        mobileControls.id = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="touch-controls">
                <button id="touch-left" class="touch-button left">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <path d="M25 10 L15 20 L25 30" stroke="white" stroke-width="3" fill="none"/>
                    </svg>
                </button>
                <button id="touch-right" class="touch-button right">
                    <svg width="40" height="40" viewBox="0 0 40 40">
                        <path d="M15 10 L25 20 L15 30" stroke="white" stroke-width="3" fill="none"/>
                    </svg>
                </button>
            </div>
            <div class="mobile-hint">Swipe or use buttons to move</div>
        `;
        
        document.getElementById('game-container').appendChild(mobileControls);
        
        // Button controls
        const leftBtn = document.getElementById('touch-left');
        const rightBtn = document.getElementById('touch-right');
        
        // Touch events for buttons
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.keys.ArrowLeft = true;
        });
        
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.game.keys.ArrowLeft = false;
        });
        
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.game.keys.ArrowRight = true;
        });
        
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.game.keys.ArrowRight = false;
        });
        
        // Mouse events for testing on desktop
        leftBtn.addEventListener('mousedown', () => {
            this.game.keys.ArrowLeft = true;
        });
        
        leftBtn.addEventListener('mouseup', () => {
            this.game.keys.ArrowLeft = false;
        });
        
        rightBtn.addEventListener('mousedown', () => {
            this.game.keys.ArrowRight = true;
        });
        
        rightBtn.addEventListener('mouseup', () => {
            this.game.keys.ArrowRight = false;
        });
    }
    
    showMobileUI() {
        // Show mobile-specific UI elements
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            mobileControls.style.display = 'block';
        }
        
        // Adjust UI for mobile
        document.querySelectorAll('.neon-button').forEach(button => {
            button.style.padding = '15px 30px';
            button.style.fontSize = '18px';
        });
        
        // Make game title smaller on mobile
        const gameTitle = document.querySelector('.game-title');
        if (gameTitle) {
            gameTitle.style.fontSize = '48px';
        }
    }
    
    hideControlsInMenu() {
        const mobileControls = document.getElementById('mobile-controls');
        if (mobileControls) {
            if (this.game.gameState === 'menu' || this.game.gameState === 'gameover') {
                mobileControls.style.display = 'none';
            } else if (this.detectMobile()) {
                mobileControls.style.display = 'block';
            }
        }
    }
    
    update() {
        // Update control visibility based on game state
        this.hideControlsInMenu();
    }
}
