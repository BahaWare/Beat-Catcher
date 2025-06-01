// Background Animation System
class BackgroundAnimation {
    constructor() {
        this.ships = [];
        this.objects = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }
    
    init() {
        // Create background canvas
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'background-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.zIndex = '-1';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.opacity = '0.3';
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Add to body
        document.body.appendChild(this.canvas);
        
        // Create initial ships and objects
        this.createShips();
        this.createObjects();
        
        // Handle resize
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createShips() {
        for (let i = 0; i < 3; i++) {
            this.ships.push(new BackgroundShip());
        }
    }
    
    createObjects() {
        for (let i = 0; i < 8; i++) {
            this.objects.push(new BackgroundObject());
        }
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw ships
        this.ships.forEach(ship => {
            ship.update(this.canvas.width, this.canvas.height);
            ship.draw(this.ctx);
        });
        
        // Update and draw objects
        this.objects.forEach(obj => {
            obj.update(this.canvas.width, this.canvas.height);
            obj.draw(this.ctx);
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

class BackgroundShip {
    constructor() {
        this.reset();
        this.trail = [];
        this.maxTrailLength = 15;
        this.wingAnimation = 0;
        this.glowIntensity = Math.random();
    }
    
    reset() {
        this.x = -100;
        this.y = Math.random() * window.innerHeight;
        this.speed = 0.5 + Math.random() * 1.5;
        this.size = 30 + Math.random() * 20;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        // Random color
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(canvasWidth, canvasHeight) {
        this.x += this.speed;
        this.rotation += this.rotationSpeed;
        this.wingAnimation += 0.1;
        this.glowIntensity += 0.02;
        
        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Reset when off screen
        if (this.x > canvasWidth + 100) {
            this.reset();
        }
    }
    
    draw(ctx) {
        // Draw trail
        ctx.strokeStyle = this.color + '40';
        ctx.lineWidth = 2;
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
        
        // Ship body
        const gradient = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
        gradient.addColorStop(0, this.color + '80');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, this.color + '80');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.size/2, 0);
        ctx.lineTo(-this.size/3, -this.size/4);
        ctx.lineTo(-this.size/2, 0);
        ctx.lineTo(-this.size/3, this.size/4);
        ctx.closePath();
        ctx.fill();
        
        // Wings with animation
        const wingOffset = Math.sin(this.wingAnimation) * 3;
        ctx.fillStyle = this.color + '60';
        
        // Left wing
        ctx.beginPath();
        ctx.moveTo(-this.size/4, -this.size/6);
        ctx.lineTo(-this.size*0.6, -this.size/3 + wingOffset);
        ctx.lineTo(-this.size*0.5, this.size/6 + wingOffset);
        ctx.lineTo(-this.size/4, this.size/6);
        ctx.closePath();
        ctx.fill();
        
        // Right wing
        ctx.beginPath();
        ctx.moveTo(-this.size/4, this.size/6);
        ctx.lineTo(-this.size*0.6, this.size/3 + wingOffset);
        ctx.lineTo(-this.size*0.5, -this.size/6 + wingOffset);
        ctx.lineTo(-this.size/4, -this.size/6);
        ctx.closePath();
        ctx.fill();
        
        // Engine glow
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10 + Math.sin(this.glowIntensity) * 5;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.ellipse(-this.size/2, 0, 4, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class BackgroundObject {
    constructor() {
        this.reset();
        this.pulse = 0;
        this.rotation = 0;
        this.rotationSpeed = 0.02 + Math.random() * 0.05;
    }
    
    reset() {
        this.x = Math.random() * window.innerWidth;
        this.y = -50;
        this.speed = 0.3 + Math.random() * 0.8;
        this.size = 15 + Math.random() * 15;
        
        // Random type
        const types = ['note', 'star', 'diamond', 'circle'];
        this.type = types[Math.floor(Math.random() * types.length)];
        
        // Random color
        const colors = ['#ff00ff', '#00ffff', '#ffff00', '#ff0000', '#00ff00'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(canvasWidth, canvasHeight) {
        this.y += this.speed;
        this.pulse += 0.05;
        this.rotation += this.rotationSpeed;
        
        // Reset when off screen
        if (this.y > canvasHeight + 50) {
            this.reset();
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const scale = 1 + Math.sin(this.pulse) * 0.2;
        ctx.scale(scale, scale);
        
        // Glowing effect
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.color + '88');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        
        if (this.type === 'note') {
            // Musical note
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = `${this.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('♪', 0, 0);
        } else if (this.type === 'star') {
            // Star shape
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.size/2;
                const y = Math.sin(angle) * this.size/2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (this.size/4);
                const innerY = Math.sin(innerAngle) * (this.size/4);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'diamond') {
            // Diamond shape
            ctx.beginPath();
            ctx.moveTo(0, -this.size/2);
            ctx.lineTo(this.size/2, 0);
            ctx.lineTo(0, this.size/2);
            ctx.lineTo(-this.size/2, 0);
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'circle') {
            // Circle
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// Initialize background animation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.backgroundAnimation = new BackgroundAnimation();
    
    // Start animation when on menu screens
    function checkMenuState() {
        const startScreen = document.getElementById('start-screen');
        const multiplayerMenu = document.getElementById('multiplayer-menu');
        const gameModesScreen = document.getElementById('game-modes');
        const skinsScreen = document.getElementById('skins-screen');
        const achievementsScreen = document.getElementById('achievements');
        const settingsScreen = document.getElementById('settings');
        
        const isMenuVisible = (startScreen && !startScreen.classList.contains('hidden')) ||
                             (multiplayerMenu && !multiplayerMenu.classList.contains('hidden')) ||
                             (gameModesScreen && !gameModesScreen.classList.contains('hidden')) ||
                             (skinsScreen && !skinsScreen.classList.contains('hidden')) ||
                             (achievementsScreen && !achievementsScreen.classList.contains('hidden')) ||
                             (settingsScreen && !settingsScreen.classList.contains('hidden'));
        
        if (isMenuVisible) {
            window.backgroundAnimation.start();
        } else {
            window.backgroundAnimation.stop();
        }
    }
    
    // Check menu state periodically
    setInterval(checkMenuState, 1000);
    
    // Start immediately if on menu
    setTimeout(checkMenuState, 100);
});
