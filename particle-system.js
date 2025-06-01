class Particle {
    constructor(x, y, type = 'star') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 3 + 2;
        this.hue = Math.random() * 360;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        
        if (type === 'explosion') {
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.decay = 0.05; // Faster decay for performance
            this.size = Math.random() * 5 + 3;
        } else if (type === 'trail') {
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = Math.random() * 2 + 1;
            this.decay = 0.04; // Faster decay for performance
            this.size = Math.random() * 2 + 1;
        } else if (type === 'powerup') {
            this.vx = 0;
            this.vy = -2;
            this.decay = 0.005;
            this.size = Math.random() * 4 + 4;
            this.pulse = 0;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.rotation += this.rotationSpeed;
        
        if (this.type === 'powerup') {
            this.pulse += 0.1;
            this.size = 6 + Math.sin(this.pulse) * 2;
        }
        
        // Add gravity effect for explosion particles
        if (this.type === 'explosion') {
            this.vy += 0.2;
        }
        
        return this.life > 0;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'star') {
            // Draw star shape
            ctx.fillStyle = `hsl(${this.hue}, 100%, 70%)`;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (this.size * 0.5);
                const innerY = Math.sin(innerAngle) * (this.size * 0.5);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'explosion') {
            // Draw explosion particle - simplified for performance
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.life})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'trail') {
            // Draw trail particle - simplified for performance
            ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'powerup') {
            // Draw powerup particle
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
            gradient.addColorStop(0, `hsla(60, 100%, 70%, 1)`);
            gradient.addColorStop(0.7, `hsla(60, 100%, 50%, 0.8)`);
            gradient.addColorStop(1, `hsla(60, 100%, 30%, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner star
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI * 2) / 4;
                const x = Math.cos(angle) * (this.size * 0.3);
                const y = Math.sin(angle) * (this.size * 0.3);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 150; // Reduced for performance
    }
    
    addParticle(x, y, type = 'star', count = 1) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length < this.maxParticles) {
                this.particles.push(new Particle(x, y, type));
            }
        }
    }
    
    createExplosion(x, y, intensity = 8) { // Reduced intensity
        for (let i = 0; i < intensity; i++) {
            this.addParticle(x, y, 'explosion');
        }
    }
    
    createTrail(x, y, count = 1) { // Reduced count
        for (let i = 0; i < count; i++) {
            this.addParticle(
                x + (Math.random() - 0.5) * 10,
                y + (Math.random() - 0.5) * 10,
                'trail'
            );
        }
    }
    
    createPowerupEffect(x, y) {
        for (let i = 0; i < 5; i++) { // Reduced from 10
            this.addParticle(x, y, 'powerup');
        }
    }
    
    update() {
        this.particles = this.particles.filter(particle => particle.update());
    }
    
    draw(ctx) {
        // Disable shadows for performance
        ctx.shadowBlur = 0;
        this.particles.forEach(particle => particle.draw(ctx));
    }
    
    clear() {
        this.particles = [];
    }
}

// Background star field
class StarField {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.stars = [];
        this.layers = 3;
        
        this.init();
    }
    
    init() {
        for (let layer = 0; layer < this.layers; layer++) {
            const starCount = 30 * (layer + 1); // Reduced star count
            const speed = (layer + 1) * 0.5;
            
            for (let i = 0; i < starCount; i++) {
                this.stars.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    size: Math.random() * (3 - layer) + 0.5,
                    speed: speed,
                    brightness: Math.random() * 0.5 + 0.5,
                    twinkle: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    update(deltaTime, speedMultiplier = 1) {
        this.stars.forEach(star => {
            star.y += star.speed * speedMultiplier;
            star.twinkle += 0.05;
            
            if (star.y > this.height) {
                star.y = -10;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    draw(ctx) {
        this.stars.forEach(star => {
            const brightness = star.brightness + Math.sin(star.twinkle) * 0.2;
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.stars.forEach(star => {
            if (star.x > width) star.x = Math.random() * width;
            if (star.y > height) star.y = Math.random() * height;
        });
    }
}
