// Enhanced Multiplayer Game Features

// Add multiplayer visual enhancements to Game class
if (window.Game) {
    // Override render method to show other players
    const originalRender = Game.prototype.render;
    Game.prototype.render = function() {
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
    
    // Draw other player's ship
    Game.prototype.drawOtherPlayerShip = function(player) {
        const ctx = this.ctx;
        ctx.save();
        
        // Set transparency and different color
        ctx.globalAlpha = 0.6;
        ctx.translate(player.position.x, player.position.y);
        
        // Draw ship with different hue
        ctx.filter = 'hue-rotate(180deg)';
        
        // Simple ship shape
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.moveTo(0, -20);
        ctx.lineTo(-15, 20);
        ctx.lineTo(0, 10);
        ctx.lineTo(15, 20);
        ctx.closePath();
        ctx.fill();
        
        // Draw player name
        ctx.filter = 'none';
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(player.name, 0, -30);
        
        // Draw score
        ctx.font = '10px Arial';
        ctx.fillText(`Score: ${player.score}`, 0, 35);
        
        ctx.restore();
    };
    
    // Enhanced ship movement update for multiplayer
    const originalShipUpdate = Ship.prototype.update;
    Ship.prototype.update = function(keys, canvasWidth) {
        originalShipUpdate.call(this, keys, canvasWidth);
        
        // Send position updates in multiplayer
        if (window.game && window.game.isMultiplayer && window.game.multiplayerManager) {
            // Throttle updates to every 3 frames
            if (!this.updateCounter) this.updateCounter = 0;
            this.updateCounter++;
            
            if (this.updateCounter % 3 === 0) {
                window.game.multiplayerManager.updatePlayerState({
                    position: { x: this.x, y: this.y }
                });
            }
        }
    };
}

// Enhanced room creation with better defaults
const originalCreateRoom = FirebaseMultiplayer.prototype.createRoom;
FirebaseMultiplayer.prototype.createRoom = function() {
    const roomId = originalCreateRoom.call(this);
    
    // Auto-show room code display
    setTimeout(() => {
        const codeDisplay = document.getElementById('room-code-display');
        if (codeDisplay) {
            codeDisplay.classList.remove('hidden');
        }
    }, 100);
    
    return roomId;
};

// Enhanced active rooms display
const originalUpdateActiveRoomsList = FirebaseMultiplayer.prototype.updateActiveRoomsList;
FirebaseMultiplayer.prototype.updateActiveRoomsList = function(rooms) {
    originalUpdateActiveRoomsList.call(this, rooms);
    
    // Add room count to main menu
    const roomCount = Object.keys(rooms).length;
    const mainMenuIndicator = document.querySelector('#start-screen .active-rooms-indicator');
    
    if (!mainMenuIndicator && roomCount > 0) {
        const indicator = document.createElement('div');
        indicator.className = 'active-rooms-indicator';
        indicator.innerHTML = `<span class="pulse"></span> ${roomCount} Active Room${roomCount !== 1 ? 's' : ''}`;
        indicator.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 255, 0.2);
            border: 1px solid #00ffff;
            padding: 10px 20px;
            border-radius: 20px;
            font-size: 14px;
            color: #00ffff;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const pulse = indicator.querySelector('.pulse');
        pulse.style.cssText = `
            width: 8px;
            height: 8px;
            background: #00ff00;
            border-radius: 50%;
            animation: pulse 2s infinite;
        `;
        
        document.getElementById('start-screen').appendChild(indicator);
    } else if (mainMenuIndicator) {
        if (roomCount > 0) {
            mainMenuIndicator.innerHTML = `<span class="pulse"></span> ${roomCount} Active Room${roomCount !== 1 ? 's' : ''}`;
        } else {
            mainMenuIndicator.remove();
        }
    }
};

// Add pulse animation
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.5);
            opacity: 0.5;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
    
    .active-rooms-indicator {
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .active-rooms-indicator:hover {
        background: rgba(0, 255, 255, 0.3);
        transform: scale(1.05);
    }
`;
document.head.appendChild(pulseStyle);

// Make active rooms indicator clickable
document.addEventListener('click', (e) => {
    if (e.target.closest('.active-rooms-indicator')) {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('multiplayer-menu').classList.remove('hidden');
    }
});

// Enhanced multiplayer gameplay
Game.prototype.updateMultiplayerDisplay = function() {
    if (!this.isMultiplayer || !this.multiplayerManager) return;
    
    // Show player count in UI
    const playerCount = Object.keys(this.multiplayerManager.otherPlayers).length + 1;
    
    if (!document.getElementById('player-count-display')) {
        const playerCountDiv = document.createElement('div');
        playerCountDiv.id = 'player-count-display';
        playerCountDiv.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            padding: 10px;
            border-radius: 5px;
            color: #fff;
            font-size: 14px;
        `;
        document.getElementById('ui-overlay').appendChild(playerCountDiv);
    }
    
    document.getElementById('player-count-display').textContent = `Players: ${playerCount}/4`;
};

// Call updateMultiplayerDisplay in game loop
const originalUpdate = Game.prototype.update;
Game.prototype.update = function() {
    originalUpdate.call(this);
    
    if (this.isMultiplayer) {
        this.updateMultiplayerDisplay();
    }
};

// Enhanced room joining
FirebaseMultiplayer.prototype.quickJoinRoom = function(roomId) {
    // Show multiplayer menu first
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('multiplayer-menu').classList.remove('hidden');
    
    // Set room code and join
    document.getElementById('room-code-input').value = roomId;
    setTimeout(() => {
        this.joinRoom(roomId);
    }, 100);
};

// Add sound effects for multiplayer events
FirebaseMultiplayer.prototype.playMultiplayerSound = function(type) {
    if (window.game && window.game.audioVisualizer) {
        switch(type) {
            case 'join':
                window.game.audioVisualizer.playNote('star');
                break;
            case 'leave':
                window.game.audioVisualizer.playNote('diamond');
                break;
            case 'ready':
                window.game.audioVisualizer.playNote('note');
                break;
        }
    }
};

// Enhanced player join/leave notifications
const originalListenToPlayers = FirebaseMultiplayer.prototype.listenToPlayers;
FirebaseMultiplayer.prototype.listenToPlayers = function() {
    originalListenToPlayers.call(this);
    
    // Override child_added listener to add sound
    this.roomRef.child('players').off('child_added');
    this.roomRef.child('players').on('child_added', (snapshot) => {
        if (snapshot.key !== this.playerId) {
            const newPlayer = snapshot.val();
            if (newPlayer) {
                this.showNotification(`${newPlayer.name} joined the room`, 'info');
                this.playMultiplayerSound('join');
            }
        }
    });
    
    // Override child_removed listener to add sound
    this.roomRef.child('players').off('child_removed');
    this.roomRef.child('players').on('child_removed', (snapshot) => {
        const removedPlayer = snapshot.val();
        if (removedPlayer) {
            this.showNotification(`${removedPlayer.name} left the room`, 'info');
            this.playMultiplayerSound('leave');
        }
    });
};

console.log('Multiplayer game enhancements loaded!');
