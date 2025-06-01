class PowerUp {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 60;
        this.height = 60;
        this.speed = 2;
        this.rotation = 0;
        this.collected = false;
        this.pulse = 0;
        
        // Power-up configurations
        this.configs = {
            shield: {
                color: '#00ff88',
                icon: '🛡️',
                duration: 0, // Permanent until hit
                description: 'Protects from one miss'
            },
            magnet: {
                color: '#ff00ff',
                icon: '🧲',
                duration: 600, // 10 seconds at 60fps
                description: 'Attracts nearby objects'
            },
            slowmo: {
                color: '#00ffff',
                icon: '⏱️',
                duration: 300, // 5 seconds
                description: 'Slows down time'
            },
            doublePoints: {
                color: '#ffff00',
                icon: '2️⃣',
                duration: 600, // 10 seconds
                description: 'Double points'
            },
            rainbow: {
                color: 'rainbow',
                icon: '🌈',
                duration: 300, // 5 seconds
                description: 'Catch anything!'
            }
        };
        
        this.config = this.configs[type];
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.02;
        this.pulse += 0.1;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        ctx.scale(scale, scale);
        
        // Outer glow
        if (this.config.color === 'rainbow') {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
            const hue = (Date.now() * 0.1) % 360;
            gradient.addColorStop(0, `hsl(${hue}, 100%, 50%)`);
            gradient.addColorStop(0.5, `hsl(${(hue + 60) % 360}, 100%, 50%)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
        } else {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width);
            gradient.addColorStop(0, this.config.color);
            gradient.addColorStop(0.5, this.config.color + '88');
            gradient.addColorStop(1, this.config.color + '00');
            ctx.fillStyle = gradient;
        }
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner circle
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Icon
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, 0, 0);
        
        ctx.restore();
    }
    
    checkCollection(ship) {
        const dx = Math.abs(this.x - ship.x);
        const dy = Math.abs(this.y - ship.y);
        
        if (dx < (this.width + ship.width) / 2 && dy < (this.height + ship.height) / 2) {
            this.collected = true;
            return true;
        }
        return false;
    }
}

class PowerUpManager {
    constructor() {
        this.activePowerUps = {};
        this.powerUpTypes = ['shield', 'magnet', 'slowmo', 'doublePoints', 'rainbow'];
    }
    
    activatePowerUp(type, duration) {
        if (type === 'shield') {
            this.activePowerUps.shield = { active: true };
        } else {
            this.activePowerUps[type] = {
                active: true,
                duration: duration,
                startTime: Date.now()
            };
        }
    }
    
    update() {
        // Update active power-ups
        Object.keys(this.activePowerUps).forEach(type => {
            const powerUp = this.activePowerUps[type];
            if (powerUp.duration && powerUp.active) {
                powerUp.duration--;
                if (powerUp.duration <= 0) {
                    powerUp.active = false;
                    delete this.activePowerUps[type];
                }
            }
        });
    }
    
    isActive(type) {
        return this.activePowerUps[type] && this.activePowerUps[type].active;
    }
    
    consumeShield() {
        if (this.isActive('shield')) {
            delete this.activePowerUps.shield;
            return true;
        }
        return false;
    }
    
    getActiveEffects() {
        return Object.keys(this.activePowerUps).filter(type => this.activePowerUps[type].active);
    }
    
    getRandomPowerUpType() {
        return this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
    }
}
