// Complete multiplayer fix for all issues

// Fix spawning - single player gets 1 object, multiplayer gets 2
if (window.Game) {
    const originalSpawnObject = Game.prototype.spawnObject;
    
    Game.prototype.spawnObject = function() {
        // Call original spawn
        originalSpawnObject.call(this);
        
        // In multiplayer, spawn an additional object for more challenge
        if (this.isMultiplayer) {
            // Add a small delay and spawn second object
            setTimeout(() => {
                originalSpawnObject.call(this);
            }, 200);
        }
        
        // If multiplayer and host, broadcast the objects
        if (this.isMultiplayer && this.multiplayerManager && this.multiplayerManager.isHost) {
            const lastObjects = this.fallingObjects.slice(-2);
            lastObjects.forEach(obj => {
                this.multiplayerManager.broadcastFallingObject({
                    x: obj.x,
                    y: obj.y,
                    type: obj.type
                });
            });
        }
    };
}

// Enhanced multiplayer rendering with proper visibility
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
        ctx.globalAlpha = 0.8;
        ctx.translate(player.position.x, player.position.y);
        
        // Draw a distinctive ship shape
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        
        // Ship body
        ctx.beginPath();
        ctx.moveTo(0, -30);
        ctx.lineTo(-25, 30);
        ctx.lineTo(0, 20);
        ctx.lineTo(25, 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fill();
        
        // Draw player name above ship
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(player.name, 0, -40);
        
        // Draw score below ship
        ctx.font = '14px Arial';
        ctx.textBaseline = 'top';
        ctx.fillText(`Score: ${player.score || 0}`, 0, 35);
        
        // Draw streak indicator
        if (player.streak > 0) {
            ctx.fillStyle = '#ffff00';
            ctx.fillText(`Streak: ${player.streak}`, 0, 50);
        }
        
        ctx.restore();
    };
}

// Enhanced ship position updates
if (window.Ship) {
    const originalUpdate = Ship.prototype.update;
    Ship.prototype.update = function(keys, canvasWidth) {
        originalUpdate.call(this, keys, canvasWidth);
        
        // Send position updates in multiplayer
        if (window.game && window.game.isMultiplayer && window.game.multiplayerManager) {
            // Send update every few frames for smooth movement
            if (!this.updateCounter) this.updateCounter = 0;
            this.updateCounter++;
            
            if (this.updateCounter % 2 === 0) {
                window.game.multiplayerManager.updatePlayerState({
                    position: { x: this.x, y: this.y }
                });
            }
        }
    };
}

// Multiplayer game over handling with retry option
if (window.Game) {
    const originalGameOver = Game.prototype.gameOver;
    Game.prototype.gameOver = function() {
        if (this.isMultiplayer) {
            // Show multiplayer game over screen
            this.showMultiplayerGameOver();
            
            // Update multiplayer state
            if (this.multiplayerManager) {
                this.multiplayerManager.updatePlayerState({
                    gameOver: true,
                    finalScore: this.score,
                    finalCatches: this.catches
                });
            }
        } else {
            // Call original game over for single player
            originalGameOver.call(this);
        }
    };
    
    Game.prototype.showMultiplayerGameOver = function() {
        // Create multiplayer game over overlay
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'multiplayer-game-over';
        gameOverDiv.innerHTML = `
            <h2>GAME OVER</h2>
            <div class="final-stats">
                <p>Final Score: ${this.score}</p>
                <p>Total Catches: ${this.catches}</p>
                <p>Best Streak: ${this.catchStreak}</p>
            </div>
            <button class="retry-button" onclick="window.game.retryMultiplayer()">RETRY</button>
        `;
        
        document.getElementById('game-container').appendChild(gameOverDiv);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (gameOverDiv.parentNode) {
                gameOverDiv.parentNode.removeChild(gameOverDiv);
            }
        }, 10000);
    };
    
    Game.prototype.retryMultiplayer = function() {
        // Remove game over screen
        const gameOverScreen = document.querySelector('.multiplayer-game-over');
        if (gameOverScreen) {
            gameOverScreen.remove();
        }
        
        // Reset game state
        this.reset();
        
        // Update multiplayer state
        if (this.multiplayerManager) {
            this.multiplayerManager.updatePlayerState({
                gameOver: false,
                score: 0,
                catches: 0,
                streak: 0,
                position: { x: this.ship.x, y: this.ship.y }
            });
        }
        
        // Restart game loop
        this.gameRunning = true;
        this.gameLoop();
    };
}

// Enhanced active rooms functionality
if (window.FirebaseMultiplayer) {
    const originalUpdateActiveRoomsList = FirebaseMultiplayer.prototype.updateActiveRoomsList;
    FirebaseMultiplayer.prototype.updateActiveRoomsList = function(rooms) {
        // Update multiplayer menu active rooms
        const activeRoomsList = document.getElementById('active-rooms-list');
        if (activeRoomsList) {
            if (Object.keys(rooms).length === 0) {
                activeRoomsList.innerHTML = '<p class="no-rooms">No active rooms</p>';
            } else {
                activeRoomsList.innerHTML = '';
                Object.entries(rooms).forEach(([roomId, roomData]) => {
                    const playerCount = Object.keys(roomData.players || {}).length;
                    const roomItem = document.createElement('div');
                    roomItem.className = 'active-room-item';
                    roomItem.innerHTML = `
                        <div class="room-info">
                            <div class="room-code">${roomId}</div>
                            <div class="room-players">${playerCount}/4 players</div>
                        </div>
                    `;
                    roomItem.onclick = () => this.quickJoinRoom(roomId);
                    activeRoomsList.appendChild(roomItem);
                });
            }
        }
        
        // Update main menu rooms list
        const mainMenuRoomsList = document.getElementById('main-menu-rooms-list');
        if (mainMenuRoomsList) {
            const roomCount = Object.keys(rooms).length;
            if (roomCount > 0) {
                mainMenuRoomsList.innerHTML = `
                    <h3>Active Rooms (${roomCount})</h3>
                    <div class="rooms-preview">
                        ${Object.entries(rooms).slice(0, 3).map(([roomId, roomData]) => {
                            const playerCount = Object.keys(roomData.players || {}).length;
                            return `<div class="room-preview" onclick="window.game.multiplayerManager.quickJoinRoom('${roomId}')">${roomId} (${playerCount}/4)</div>`;
                        }).join('')}
                    </div>
                    <button onclick="document.getElementById('start-screen').classList.add('hidden'); document.getElementById('multiplayer-menu').classList.remove('hidden');" class="neon-button small">View All</button>
                `;
                mainMenuRoomsList.style.display = 'block';
            } else {
                mainMenuRoomsList.style.display = 'none';
            }
        }
    };
    
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
}

// UI state management for room joining/creating
function updateMultiplayerUI() {
    const multiplayerMenu = document.getElementById('multiplayer-menu');
    const roomLobby = document.getElementById('room-lobby');
    const roomCodeDisplay = document.getElementById('room-code-display');
    
    if (roomLobby && !roomLobby.classList.contains('hidden')) {
        // In room - hide create/join options
        multiplayerMenu.classList.add('in-room');
    } else if (roomCodeDisplay && !roomCodeDisplay.classList.contains('hidden')) {
        // Showing room code - hide create/join options
        multiplayerMenu.classList.add('in-room');
    } else {
        // Not in room - show create/join options
        multiplayerMenu.classList.remove('in-room');
    }
}

// Monitor UI changes
const observer = new MutationObserver(updateMultiplayerUI);
if (document.getElementById('multiplayer-menu')) {
    observer.observe(document.getElementById('multiplayer-menu'), {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
    });
}

// Enhanced catch handling for multiplayer
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

console.log('Complete multiplayer fix loaded!');
