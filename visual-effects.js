class VisualEffects {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.screenShake = {
            intensity: 0,
            duration: 0,
            offsetX: 0,
            offsetY: 0
        };
        this.chromaticAberration = {
            intensity: 0,
            targetIntensity: 0
        };
        this.motionBlur = {
            intensity: 0,
            previousFrames: []
        };
        this.backgroundPulse = 0;
        this.beatIntensity = 0;
    }
    
    // Screen shake effect
    addScreenShake(intensity, duration) {
        this.screenShake.intensity = intensity;
        this.screenShake.duration = duration;
    }
    
    updateScreenShake() {
        if (this.screenShake.duration > 0) {
            this.screenShake.duration--;
            this.screenShake.offsetX = (Math.random() - 0.5) * this.screenShake.intensity;
            this.screenShake.offsetY = (Math.random() - 0.5) * this.screenShake.intensity;
            
            // Decay intensity
            this.screenShake.intensity *= 0.95;
        } else {
            this.screenShake.offsetX = 0;
            this.screenShake.offsetY = 0;
        }
    }
    
    applyScreenShake() {
        if (this.screenShake.duration > 0) {
            this.ctx.save();
            this.ctx.translate(this.screenShake.offsetX, this.screenShake.offsetY);
        }
    }
    
    resetScreenShake() {
        if (this.screenShake.duration > 0) {
            this.ctx.restore();
        }
    }
    
    // Chromatic aberration effect
    setChromaticAberration(intensity) {
        this.chromaticAberration.targetIntensity = intensity;
    }
    
    updateChromaticAberration() {
        // Smooth transition
        this.chromaticAberration.intensity += 
            (this.chromaticAberration.targetIntensity - this.chromaticAberration.intensity) * 0.1;
    }
    
    applyChromaticAberration(drawFunction) {
        if (this.chromaticAberration.intensity > 0.1) {
            const offset = this.chromaticAberration.intensity;
            
            // Red channel
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
            this.ctx.translate(-offset, 0);
            drawFunction();
            this.ctx.restore();
            
            // Blue channel
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
            this.ctx.translate(offset, 0);
            drawFunction();
            this.ctx.restore();
        }
    }
    
    // Motion blur effect
    setMotionBlur(intensity) {
        this.motionBlur.intensity = Math.min(intensity, 0.8);
    }
    
    captureFrame() {
        if (this.motionBlur.intensity > 0) {
            const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
            this.motionBlur.previousFrames.push(imageData);
            
            // Keep only last 3 frames
            if (this.motionBlur.previousFrames.length > 3) {
                this.motionBlur.previousFrames.shift();
            }
        }
    }
    
    applyMotionBlur() {
        if (this.motionBlur.intensity > 0 && this.motionBlur.previousFrames.length > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = this.motionBlur.intensity;
            
            this.motionBlur.previousFrames.forEach((frame, index) => {
                const alpha = (index + 1) / this.motionBlur.previousFrames.length * 0.3;
                this.ctx.globalAlpha = alpha * this.motionBlur.intensity;
                this.ctx.putImageData(frame, 0, 0);
            });
            
            this.ctx.restore();
        }
    }
    
    // Beat-reactive background
    setBeatIntensity(intensity) {
        this.beatIntensity = intensity;
        this.backgroundPulse = 1;
    }
    
    updateBackgroundPulse() {
        this.backgroundPulse *= 0.95;
    }
    
    drawBeatBackground() {
        if (this.backgroundPulse > 0.1) {
            this.ctx.save();
            
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const radius = Math.max(this.canvas.width, this.canvas.height) * this.backgroundPulse;
            
            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            const hue = (Date.now() * 0.1) % 360;
            
            gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, ${this.backgroundPulse * 0.2})`);
            gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 50%, ${this.backgroundPulse * 0.1})`);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.restore();
        }
    }
    
    // Particle trail effect
    createBeatParticles(x, y, intensity) {
        const particleCount = Math.floor(intensity * 10);
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * intensity * 5,
                vy: Math.sin(angle) * intensity * 5,
                life: 1,
                color: `hsl(${(Date.now() * 0.1 + i * 30) % 360}, 100%, 50%)`
            });
        }
        
        return particles;
    }
    
    // Near miss effect
    drawNearMissEffect(x, y) {
        this.ctx.save();
        
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 100);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.5)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.2)');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 100, y - 100, 200, 200);
        
        // Add text
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('CLOSE!', x, y);
        
        this.ctx.restore();
        
        // Add small screen shake
        this.addScreenShake(5, 10);
    }
    
    // Speed lines effect
    drawSpeedLines(speed) {
        if (speed > 5) {
            this.ctx.save();
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(speed / 20, 0.3)})`;
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < 20; i++) {
                const y = Math.random() * this.canvas.height;
                const length = Math.random() * 100 + 50;
                
                this.ctx.beginPath();
                this.ctx.moveTo(this.canvas.width, y);
                this.ctx.lineTo(this.canvas.width - length * (speed / 10), y);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        }
    }
    
    // Rainbow mode effect
    drawRainbowMode() {
        this.ctx.save();
        
        const time = Date.now() * 0.001;
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i <= 1; i += 0.1) {
            const hue = (time * 50 + i * 360) % 360;
            gradient.addColorStop(i, `hsla(${hue}, 100%, 50%, 0.1)`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.restore();
    }
    
    // Update all effects
    update() {
        this.updateScreenShake();
        this.updateChromaticAberration();
        this.updateBackgroundPulse();
    }
}

// Visual effect utilities
class EffectParticle {
    constructor(x, y, type = 'star') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1;
        this.size = Math.random() * 5 + 5;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.02;
        this.rotation += this.rotationSpeed;
        this.vx *= 0.98;
        this.vy *= 0.98;
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.life;
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        if (this.type === 'star') {
            // Draw star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.size;
                const y = Math.sin(angle) * this.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                
                const innerAngle = angle + Math.PI / 5;
                const innerX = Math.cos(innerAngle) * (this.size / 2);
                const innerY = Math.sin(innerAngle) * (this.size / 2);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
        } else if (this.type === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'triangle') {
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.lineTo(-this.size * 0.866, this.size * 0.5);
            ctx.lineTo(this.size * 0.866, this.size * 0.5);
            ctx.closePath();
            ctx.fill();
        }
        
        ctx.restore();
    }
}
