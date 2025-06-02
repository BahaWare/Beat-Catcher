// Enhanced multiplayer features for Beat Catcher

// Enhanced game over system for multiplayer
FirebaseMultiplayer.prototype.checkAllPlayersGameOver = function() {
    if (!this.roomRef) return;
    
    this.roomRef.child('players').once('value', (snapshot) => {
        const players = snapshot.val() || {};
        const playerList = Object.values(players);
        const alivePlayers = playerList.filter(player => player.isAlive !== false);
        
        if (alivePlayers.length === 0) {
            // All players are game over, end the game
            this.roomRef.update({
                gameState: 'gameover',
                endTime: firebase.database.ServerValue.TIMESTAMP
            });
        } else if (alivePlayers.length === 1 && playerList.length > 1) {
            // Only one player left, start 3 second timer
            this.startGameOverTimer();
        }
    });
};

FirebaseMultiplayer.prototype.startGameOverTimer = function() {
    // Show countdown to all players
    this.showRevivalCountdown();
    
    // Set 3 second timer for last player
    setTimeout(() => {
        if (!this.roomRef) return;
        
        this.roomRef.child('players').once('value', (snapshot) => {
            const players = snapshot.val() || {};
            const playerList = Object.values(players);
            const alivePlayers = playerList.filter(player => player.isAlive !== false);
            
            if (alivePlayers.length === 1) {
                // Still only one player alive, revive others
                Object.keys(players).forEach(playerId => {
                    if (players[playerId].isAlive === false) {
                        this.roomRef.child('players').child(playerId).update({
                            isAlive: true,
                            gameOverTime: null
                        });
                    }
                });
                
                // Show revival message
                this.showNotification('Players revived! Game continues!', 'success');
                
                // Reset game state for all players
                if (this.gameInstance) {
                    this.gameInstance.gameState = 'playing';
                    this.gameInstance.gameOverTimer = 0;
                    this.gameInstance.sadMusicTimer = 0;
                }
            }
        });
    }, 3000); // 3 seconds
};

FirebaseMultiplayer.prototype.showRevivalCountdown = function() {
    const countdownDiv = document.createElement('div');
    countdownDiv.className = 'revival-countdown';
    countdownDiv.innerHTML = `
        <h3>Revival Countdown</h3>
        <div class="countdown-timer">3</div>
        <p>Last player standing! Others will be revived if no one else dies...</p>
    `;
    
    // Add styles
    countdownDiv.style.position = 'fixed';
    countdownDiv.style.top = '20px';
    countdownDiv.style.right = '20px';
    countdownDiv.style.background = 'rgba(255, 165, 0, 0.9)';
    countdownDiv.style.color = 'white';
    countdownDiv.style.padding = '20px';
    countdownDiv.style.borderRadius = '10px';
    countdownDiv.style.textAlign = 'center';
    countdownDiv.style.zIndex = '10000';
    countdownDiv.style.border = '2px solid #ffaa00';
    countdownDiv.style.fontSize = '16px';
    
    const timerElement = countdownDiv.querySelector('.countdown-timer');
    timerElement.style.fontSize = '48px';
    timerElement.style.fontWeight = 'bold';
    timerElement.style.margin = '10px 0';
    
    document.body.appendChild(countdownDiv);
    
    // Countdown animation
    let timeLeft = 3;
    const countdownInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            countdownDiv.remove();
        }
    }, 1000);
    
    // Remove after 3 seconds
    setTimeout(() => {
        countdownDiv.remove();
    }, 3500);
};

FirebaseMultiplayer.prototype.showMultiplayerGameOverMessage = function() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'multiplayer-gameover-message';
    messageDiv.innerHTML = `
        <h3>💀 You're Out!</h3>
        <p>Waiting for other players...</p>
        <p>🔄 If only one player remains, you'll be revived in 3 seconds!</p>
        <div class="waiting-animation">⏳</div>
    `;
    
    // Add styles
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.background = 'rgba(0, 0, 0, 0.9)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '30px';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.border = '2px solid #ff0000';
    messageDiv.style.fontSize = '18px';
    
    // Add pulsing animation
    const waitingAnimation = messageDiv.querySelector('.waiting-animation');
    waitingAnimation.style.fontSize = '32px';
    waitingAnimation.style.animation = 'pulse 1s infinite';
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    // Remove message when game ends or player is revived
    const checkGameState = () => {
        if (!this.roomRef) {
            messageDiv.remove();
            style.remove();
            return;
        }
        
        this.roomRef.child('players').child(this.playerId).once('value', (snapshot) => {
            const playerData = snapshot.val();
            if (!playerData || playerData.isAlive !== false) {
                messageDiv.remove();
                style.remove();
            } else {
                setTimeout(checkGameState, 1000);
            }
        });
    };
    
    setTimeout(checkGameState, 1000);
};

// Enhanced spawn position management
FirebaseMultiplayer.prototype.getSpawnPosition = function(playerIndex) {
    const gameWidth = this.gameInstance.width;
    const gameHeight = this.gameInstance.height;
    
    const spawnPositions = [
        { x: gameWidth / 2 - 100, y: gameHeight - 100 },
        { x: gameWidth / 2 + 100, y: gameHeight - 100 },
        { x: gameWidth / 2 - 200, y: gameHeight - 100 },
        { x: gameWidth / 2 + 200, y: gameHeight - 100 }
    ];
    
    return spawnPositions[playerIndex] || spawnPositions[0];
};

// Enhanced player name display
FirebaseMultiplayer.prototype.drawEnhancedOtherPlayer = function(ctx, player) {
    ctx.save();
    ctx.translate(player.x, player.y);
    
    // Draw other player ship with different color
    const gradient = ctx.createLinearGradient(0, -35, 0, 35);
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(0.5, '#ffaa00');
    gradient.addColorStop(1, '#ff6600');
    
    ctx.fillStyle = gradient;
    
    // Main body (smaller than main player)
    ctx.beginPath();
    ctx.moveTo(0, -35);
    ctx.bezierCurveTo(-20, -20, -30, 20, -30, 35);
    ctx.lineTo(-15, 35);
    ctx.lineTo(-15, 20);
    ctx.lineTo(0, 15);
    ctx.lineTo(15, 20);
    ctx.lineTo(15, 35);
    ctx.lineTo(30, 35);
    ctx.bezierCurveTo(30, 20, 20, -20, 0, -35);
    ctx.closePath();
    ctx.fill();
    
    // Wings
    ctx.fillStyle = 'rgba(255, 102, 0, 0.7)';
    
    // Left wing
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-35, -10);
    ctx.lineTo(-30, 15);
    ctx.lineTo(-15, 15);
    ctx.closePath();
    ctx.fill();
    
    // Right wing
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(35, -10);
    ctx.lineTo(30, 15);
    ctx.lineTo(15, 15);
    ctx.closePath();
    ctx.fill();
    
    // Engine glow
    ctx.fillStyle = 'rgba(255, 102, 0, 0.8)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff6600';
    ctx.beginPath();
    ctx.ellipse(-15, 35, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(15, 35, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Enhanced player name display with better visibility
    if (player.name) {
        ctx.shadowBlur = 0;
        
        // Draw name background for better readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textWidth = ctx.measureText(player.name).width;
        ctx.fillRect(-textWidth/2 - 8, -60, textWidth + 16, 22);
        
        // Draw name text with outline
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.strokeText(player.name, 0, -49);
        ctx.fillText(player.name, 0, -49);
        
        // Draw score below name
        ctx.font = 'bold 12px Arial';
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        const scoreText = `Score: ${player.score}`;
        ctx.strokeText(scoreText, 0, -32);
        ctx.fillText(scoreText, 0, -32);
        
        // Draw status indicator if player is not alive
        if (player.isAlive === false) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('💀 OUT', 0, -15);
        }
    }
    
    ctx.restore();
};

// Enhanced active rooms display
FirebaseMultiplayer.prototype.updateEnhancedActiveRoomsList = function(rooms) {
    const activeRoomsList = document.getElementById('active-rooms-list');
    if (!activeRoomsList) return;
    
    // Clear existing rooms
    activeRoomsList.innerHTML = '';
    
    const roomKeys = Object.keys(rooms);
    
    if (roomKeys.length === 0) {
        activeRoomsList.innerHTML = '<p class="no-rooms">🏠 No active rooms</p>';
        return;
    }
    
    roomKeys.forEach(roomId => {
        const room = rooms[roomId];
        const roomElement = document.createElement('div');
        roomElement.className = 'room-preview enhanced';
        
        // Determine status color
        let statusColor = '#00ff00';
        let statusText = room.gameState || 'waiting';
        if (statusText === 'playing') {
            statusColor = '#ff6600';
            statusText = '🎮 Playing';
        } else if (statusText === 'waiting') {
            statusText = '⏳ Waiting';
        }
        
        roomElement.innerHTML = `
            <div class="room-info">
                <div class="room-header">
                    <strong>🏠 ${roomId}</strong>
                    <span class="room-status" style="color: ${statusColor}">${statusText}</span>
                </div>
                <div class="room-details">
                    <span>👥 ${room.playerCount || 0}/4 players</span>
                    <span>🎯 Host: ${room.hostName || 'Unknown'}</span>
                </div>
            </div>
        `;
        
        // Enhanced styling
        roomElement.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
        roomElement.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        roomElement.style.borderRadius = '8px';
        roomElement.style.padding = '12px';
        roomElement.style.margin = '8px 0';
        roomElement.style.cursor = 'pointer';
        roomElement.style.transition = 'all 0.3s ease';
        
        roomElement.addEventListener('mouseenter', () => {
            roomElement.style.background = 'linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1))';
            roomElement.style.transform = 'translateX(5px) scale(1.02)';
            roomElement.style.borderColor = '#00ffff';
        });
        
        roomElement.addEventListener('mouseleave', () => {
            roomElement.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))';
            roomElement.style.transform = 'translateX(0) scale(1)';
            roomElement.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        });
        
        roomElement.addEventListener('click', () => {
            if (window.quickJoinRoom) {
                window.quickJoinRoom(roomId);
            }
        });
        
        activeRoomsList.appendChild(roomElement);
    });
};

console.log('Multiplayer enhancements loaded');
