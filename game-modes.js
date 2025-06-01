class GameModes {
    constructor() {
        this.modes = {
            classic: {
                name: 'Classic',
                description: 'The original experience',
                icon: '🎮',
                settings: {
                    lives: 1,
                    startLevel: 1,
                    powerUpsEnabled: true,
                    bossEnabled: true
                }
            },
            survival: {
                name: 'Survival',
                description: 'How long can you last?',
                icon: '♾️',
                settings: {
                    lives: 3,
                    startLevel: 1,
                    powerUpsEnabled: true,
                    bossEnabled: false,
                    infiniteMode: true
                }
            },
            timeAttack: {
                name: 'Time Attack',
                description: 'Score rush in 60 seconds',
                icon: '⏱️',
                settings: {
                    lives: 999,
                    startLevel: 5,
                    powerUpsEnabled: true,
                    bossEnabled: false,
                    timeLimit: 60
                }
            },
            perfectRun: {
                name: 'Perfect Run',
                description: 'No mistakes allowed',
                icon: '💎',
                settings: {
                    lives: 1,
                    startLevel: 1,
                    powerUpsEnabled: false,
                    bossEnabled: true,
                    perfectRequired: true
                }
            },
            zen: {
                name: 'Zen Mode',
                description: 'Relax and enjoy the music',
                icon: '🧘',
                settings: {
                    lives: 999,
                    startLevel: 1,
                    powerUpsEnabled: true,
                    bossEnabled: false,
                    noGameOver: true
                }
            }
        };
        
        this.currentMode = 'classic';
        this.unlockedModes = ['classic'];
    }
    
    selectMode(modeName) {
        if (this.unlockedModes.includes(modeName)) {
            this.currentMode = modeName;
            return true;
        }
        return false;
    }
    
    getCurrentModeSettings() {
        return this.modes[this.currentMode].settings;
    }
    
    unlockMode(modeName) {
        if (!this.unlockedModes.includes(modeName)) {
            this.unlockedModes.push(modeName);
            this.saveProgress();
        }
    }
    
    checkUnlockConditions(stats) {
        // Unlock survival after reaching level 10
        if (stats.highestLevel >= 10 && !this.unlockedModes.includes('survival')) {
            this.unlockMode('survival');
            return { mode: 'survival', message: 'Survival Mode Unlocked!' };
        }
        
        // Unlock time attack after 100 total catches
        if (stats.totalCatches >= 100 && !this.unlockedModes.includes('timeAttack')) {
            this.unlockMode('timeAttack');
            return { mode: 'timeAttack', message: 'Time Attack Mode Unlocked!' };
        }
        
        // Unlock perfect run after a 50 streak
        if (stats.bestStreak >= 50 && !this.unlockedModes.includes('perfectRun')) {
            this.unlockMode('perfectRun');
            return { mode: 'perfectRun', message: 'Perfect Run Mode Unlocked!' };
        }
        
        // Unlock zen mode after playing for 30 minutes
        if (stats.totalPlayTime >= 1800 && !this.unlockedModes.includes('zen')) {
            this.unlockMode('zen');
            return { mode: 'zen', message: 'Zen Mode Unlocked!' };
        }
        
        return null;
    }
    
    saveProgress() {
        localStorage.setItem('unlockedModes', JSON.stringify(this.unlockedModes));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('unlockedModes');
        if (saved) {
            this.unlockedModes = JSON.parse(saved);
        }
    }
}

class BossSystem {
    constructor() {
        this.bosses = {
            rhythmKing: {
                name: 'Rhythm King',
                health: 100,
                patterns: ['spiral', 'wave', 'burst'],
                color: '#ff00ff',
                size: 150
            },
            beatMaster: {
                name: 'Beat Master',
                health: 150,
                patterns: ['cross', 'circle', 'random'],
                color: '#00ffff',
                size: 180
            },
            tempoTitan: {
                name: 'Tempo Titan',
                health: 200,
                patterns: ['complex', 'chase', 'mirror'],
                color: '#ffff00',
                size: 200
            }
        };
        
        this.currentBoss = null;
        this.bossPhase = 0;
        this.patternTimer = 0;
    }
    
    spawnBoss(level) {
        const bossNames = Object.keys(this.bosses);
        const bossIndex = Math.floor((level / 10) - 1) % bossNames.length;
        const bossType = bossNames[bossIndex];
        
        this.currentBoss = {
            ...this.bosses[bossType],
            x: 400,
            y: 100,
            currentHealth: this.bosses[bossType].health,
            pattern: 0,
            attackTimer: 0
        };
        
        return this.currentBoss;
    }
    
    updateBoss(deltaTime) {
        if (!this.currentBoss) return null;
        
        // Boss movement
        this.currentBoss.x += Math.sin(Date.now() * 0.001) * 2;
        this.currentBoss.y += Math.cos(Date.now() * 0.0015) * 1;
        
        // Attack patterns
        this.currentBoss.attackTimer++;
        if (this.currentBoss.attackTimer > 120) {
            this.currentBoss.attackTimer = 0;
            return this.generateAttackPattern();
        }
        
        return null;
    }
    
    generateAttackPattern() {
        const pattern = this.currentBoss.patterns[this.currentBoss.pattern];
        this.currentBoss.pattern = (this.currentBoss.pattern + 1) % this.currentBoss.patterns.length;
        
        const attacks = [];
        
        switch (pattern) {
            case 'spiral':
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI * 2 * i) / 8;
                    attacks.push({
                        x: this.currentBoss.x,
                        y: this.currentBoss.y,
                        vx: Math.cos(angle) * 3,
                        vy: Math.sin(angle) * 3,
                        type: 'boss-projectile'
                    });
                }
                break;
                
            case 'wave':
                for (let i = 0; i < 5; i++) {
                    attacks.push({
                        x: 100 + i * 150,
                        y: -50,
                        vx: 0,
                        vy: 4,
                        type: 'boss-projectile'
                    });
                }
                break;
                
            case 'burst':
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.2;
                    const speed = 2 + Math.random() * 2;
                    attacks.push({
                        x: this.currentBoss.x,
                        y: this.currentBoss.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        type: 'boss-projectile'
                    });
                }
                break;
        }
        
        return attacks;
    }
    
    damageBoss(damage) {
        if (!this.currentBoss) return false;
        
        this.currentBoss.currentHealth -= damage;
        
        if (this.currentBoss.currentHealth <= 0) {
            const defeated = this.currentBoss.name;
            this.currentBoss = null;
            return { defeated: true, bossName: defeated };
        }
        
        return { defeated: false, health: this.currentBoss.currentHealth };
    }
    
    drawBoss(ctx) {
        if (!this.currentBoss) return;
        
        ctx.save();
        
        // Boss body
        const pulse = Math.sin(Date.now() * 0.003) * 0.1 + 1;
        ctx.translate(this.currentBoss.x, this.currentBoss.y);
        ctx.scale(pulse, pulse);
        
        // Outer glow
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.currentBoss.size);
        gradient.addColorStop(0, this.currentBoss.color);
        gradient.addColorStop(0.5, this.currentBoss.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.currentBoss.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner details
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.currentBoss.size / 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Health bar
        ctx.restore();
        
        const barWidth = 200;
        const barHeight = 10;
        const barX = this.currentBoss.x - barWidth / 2;
        const barY = this.currentBoss.y - this.currentBoss.size / 2 - 30;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Health
        const healthPercent = this.currentBoss.currentHealth / this.currentBoss.health;
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Boss name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.currentBoss.name, this.currentBoss.x, barY - 10);
        
        ctx.restore();
    }
}

class ProgressionSystem {
    constructor() {
        this.playerStats = {
            level: 1,
            experience: 0,
            totalScore: 0,
            totalCatches: 0,
            bestStreak: 0,
            highestLevel: 1,
            totalPlayTime: 0,
            achievements: [],
            unlockedShips: ['default'],
            currency: 0
        };
        
        this.achievements = {
            firstCatch: {
                id: 'firstCatch',
                name: 'First Steps',
                description: 'Catch your first object',
                icon: '🎯',
                condition: (stats) => stats.totalCatches >= 1,
                reward: { currency: 10 }
            },
            streak10: {
                id: 'streak10',
                name: 'Getting Warmed Up',
                description: 'Achieve a 10 streak',
                icon: '🔥',
                condition: (stats) => stats.bestStreak >= 10,
                reward: { currency: 50 }
            },
            streak50: {
                id: 'streak50',
                name: 'On Fire!',
                description: 'Achieve a 50 streak',
                icon: '💥',
                condition: (stats) => stats.bestStreak >= 50,
                reward: { currency: 200, ship: 'flame' }
            },
            level10: {
                id: 'level10',
                name: 'Double Digits',
                description: 'Reach level 10',
                icon: '📈',
                condition: (stats) => stats.highestLevel >= 10,
                reward: { currency: 100 }
            },
            score10k: {
                id: 'score10k',
                name: 'High Scorer',
                description: 'Score 10,000 points',
                icon: '🏆',
                condition: (stats) => stats.totalScore >= 10000,
                reward: { currency: 150 }
            },
            perfectBoss: {
                id: 'perfectBoss',
                name: 'Untouchable',
                description: 'Defeat a boss without taking damage',
                icon: '👑',
                condition: (stats) => stats.perfectBossDefeats >= 1,
                reward: { currency: 500, ship: 'golden' }
            }
        };
        
        this.loadProgress();
    }
    
    addExperience(amount) {
        this.playerStats.experience += amount;
        
        // Level up check
        const requiredExp = this.getRequiredExperience();
        if (this.playerStats.experience >= requiredExp) {
            this.playerStats.experience -= requiredExp;
            this.playerStats.level++;
            return { levelUp: true, newLevel: this.playerStats.level };
        }
        
        return { levelUp: false };
    }
    
    getRequiredExperience() {
        return this.playerStats.level * 100 + Math.pow(this.playerStats.level, 2) * 10;
    }
    
    updateStats(gameStats) {
        this.playerStats.totalScore += gameStats.score || 0;
        this.playerStats.totalCatches += gameStats.catches || 0;
        this.playerStats.bestStreak = Math.max(this.playerStats.bestStreak, gameStats.streak || 0);
        this.playerStats.highestLevel = Math.max(this.playerStats.highestLevel, gameStats.level || 1);
        this.playerStats.totalPlayTime += gameStats.playTime || 0;
        
        // Check achievements
        const newAchievements = this.checkAchievements();
        
        this.saveProgress();
        
        return newAchievements;
    }
    
    checkAchievements() {
        const newAchievements = [];
        
        Object.values(this.achievements).forEach(achievement => {
            if (!this.playerStats.achievements.includes(achievement.id)) {
                if (achievement.condition(this.playerStats)) {
                    this.playerStats.achievements.push(achievement.id);
                    
                    // Apply rewards
                    if (achievement.reward.currency) {
                        this.playerStats.currency += achievement.reward.currency;
                    }
                    if (achievement.reward.ship) {
                        this.playerStats.unlockedShips.push(achievement.reward.ship);
                    }
                    
                    newAchievements.push(achievement);
                }
            }
        });
        
        return newAchievements;
    }
    
    saveProgress() {
        localStorage.setItem('playerProgress', JSON.stringify(this.playerStats));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('playerProgress');
        if (saved) {
            this.playerStats = { ...this.playerStats, ...JSON.parse(saved) };
        }
    }
    
    resetProgress() {
        localStorage.removeItem('playerProgress');
        this.playerStats = {
            level: 1,
            experience: 0,
            totalScore: 0,
            totalCatches: 0,
            bestStreak: 0,
            highestLevel: 1,
            totalPlayTime: 0,
            achievements: [],
            unlockedShips: ['default'],
            currency: 0
        };
    }
}
