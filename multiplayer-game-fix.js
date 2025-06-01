// Fix multiplayer visibility and double spawning issues

// Fix double spawning in single player
if (window.Game) {
    const originalSpawnObject = Game.prototype.spawnObject;
    let spawnCounter = 0;
    
    Game.prototype.spawnObject = function() {
        // Prevent double spawning
        spawnCounter++;
        if (spawnCounter % 2 === 0 && !this.isMultiplayer) {
            return; // Skip every second spawn in single player
        }
        
        originalSpawnObject.call(this);
        
        // If multiplayer and host, broadcast the object
        if (this.isMultiplayer && this.multiplayerManager && this.multiplayerManager.isHost) {
            const lastObject = this.fallingObjects[this.fallingObjects.length - 1];
            if (lastObject) {
                this.multiplayerManager.broadcastFallingObject({
                    x: lastObject.x,
                    y: lastObject.y,
                    type: lastObject.type
                });
            }
        }
    };
}

// Enhanced multiplayer rendering
if (window.Game) {
    const originalRender = Game.prototype.render;
    Game.prototype.render = function() {
        // Call original render first
        originalRender.call(this);
        
        // Draw other players' ships in multiplayer
        if (this.isMultiplayer && this.multiplayerManager && this.multiplayerManager.otherPlayers) {
            Object.entries(this.multiplayerManager.otherPlayers).forEach(([playerId, player]) => {
                if (player.position && !player.gameOver) {
                    this.drawOtherPlayerShip(player);
                }
            });
        }
    };
    
    // Draw other player's ship with proper visibility
    Game.prototype.drawOtherPlayerShip = function(player) {
        const ctx = this.ctx;
        ctx.save();
        
        // Make sure ship is visible
        ctx.globalAlpha = 0.7;
        ctx.translate(player.position.x, player.position.y);
        
        // Draw a simple ship shape
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        // Ship body
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-20, 25);
        ctx.lineTo(0, 15);
        ctx.lineTo(20, 25);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw player name above ship
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(player.name, 0, -35);
        
        // Draw score below ship
        ctx.font = '12px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${player.score || 0}`, 0, 30);
        
        // Draw streak indicator
        if (player.streak > 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`Streak: ${player.streak}`, 0, 45);
        }
        
        ctx.restore();
    };
}

// Fix ship position updates
if (window.Ship) {
    const originalUpdate = Ship.prototype.update;
    Ship.prototype.update = function(keys, canvasWidth) {
        originalUpdate.call(this, keys, canvasWidth);
        
        // Send position updates more frequently in multiplayer
        if (window.game && window.game.isMultiplayer && window.game.multiplayerManager) {
            // Send update every frame for smooth movement
            window.game.multiplayerManager.updatePlayerState({
                position: { x: this.x, y: this.y }
            });
        }
    };
}

// Ensure multiplayer state updates work properly
if (window.Game) {
    const originalOnCatch = Game.prototype.onCatch;
    Game.prototype.onCatch = function(obj) {
        originalOnCatch.call(this, obj);
        
        // Update multiplayer state immediately
        if (this.isMultiplayer && this.multiplayerManager) {
            this.multiplayerManager.updatePlayerState({
                score: this.score,
                catches: this.catches,
                streak: this.catchStreak,
                position: { x: this.ship.x, y: this.ship.y }
            });
        }
    };
}

console.log('Multiplayer visibility and spawning fixes loaded!');
