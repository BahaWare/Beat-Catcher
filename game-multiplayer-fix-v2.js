// Enhanced Multiplayer Event Listeners and Game Integration

// Wait for game to load
setTimeout(() => {
    const multiplayerBtn = document.getElementById('multiplayer-button');
    if (multiplayerBtn && !multiplayerBtn.hasAttribute('data-listener-added')) {
        multiplayerBtn.setAttribute('data-listener-added', 'true');
        multiplayerBtn.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('multiplayer-menu').classList.remove('hidden');
            
            // Load saved player name
            const savedName = localStorage.getItem('playerName');
            if (savedName) {
                document.getElementById('player-name-input').value = savedName;
            }
        });
    }
    
    // Save name button
    const saveNameBtn = document.getElementById('save-name-btn');
    if (saveNameBtn && window.game) {
        saveNameBtn.addEventListener('click', () => {
            const nameInput = document.getElementById('player-name-input');
            const newName = nameInput.value.trim();
            if (newName) {
                window.game.multiplayerManager.setPlayerName(newName);
                window.game.multiplayerManager.showNotification('Name saved!', 'success');
            }
        });
    }
    
    // Create room button
    const createRoomBtn = document.getElementById('create-room-btn');
    if (createRoomBtn && window.game) {
        createRoomBtn.addEventListener('click', () => {
            const roomCode = window.game.multiplayerManager.createRoom();
            document.getElementById('room-code').textContent = roomCode;
            document.getElementById('room-code-display').classList.remove('hidden');
            document.getElementById('room-lobby').classList.remove('hidden');
        });
    }
    
    // Copy code button
    const copyCodeBtn = document.getElementById('copy-code-btn');
    if (copyCodeBtn && window.game) {
        copyCodeBtn.addEventListener('click', () => {
            const roomCode = document.getElementById('room-code').textContent;
            navigator.clipboard.writeText(roomCode);
            window.game.multiplayerManager.showNotification('Room code copied!', 'success');
        });
    }
    
    // Join room button
    const joinRoomBtn = document.getElementById('join-room-btn');
    if (joinRoomBtn && window.game) {
        joinRoomBtn.addEventListener('click', () => {
            const roomCode = document.getElementById('room-code-input').value.toUpperCase();
            if (roomCode.length === 6) {
                window.game.multiplayerManager.joinRoom(roomCode);
            } else {
                window.game.multiplayerManager.showNotification('Please enter a valid 6-character room code', 'error');
            }
        });
    }
    
    // Ready button
    const readyBtn = document.getElementById('ready-btn');
    if (readyBtn && window.game) {
        readyBtn.addEventListener('click', () => {
            const isReady = readyBtn.textContent === 'READY';
            window.game.multiplayerManager.setReady(!isReady);
            readyBtn.textContent = isReady ? 'NOT READY' : 'READY';
            readyBtn.style.background = isReady ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 0, 0.3)';
        });
    }
    
    // Start game button
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn && window.game) {
        startGameBtn.addEventListener('click', () => {
            window.game.multiplayerManager.startGame();
        });
    }
    
    // Leave room button
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    if (leaveRoomBtn && window.game) {
        leaveRoomBtn.addEventListener('click', () => {
            window.game.multiplayerManager.leaveRoom();
            document.getElementById('room-lobby').classList.add('hidden');
            document.getElementById('room-code-display').classList.add('hidden');
            document.getElementById('multiplayer-menu').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
            
            // Reset ready button
            const readyBtn = document.getElementById('ready-btn');
            if (readyBtn) {
                readyBtn.textContent = 'READY';
                readyBtn.style.background = '';
            }
        });
    }
    
    // Back from multiplayer button
    const backFromMultiplayerBtn = document.getElementById('back-from-multiplayer-btn');
    if (backFromMultiplayerBtn) {
        backFromMultiplayerBtn.addEventListener('click', () => {
            document.getElementById('multiplayer-menu').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
    }
    
    // Add main menu rooms list
    MultiplayerUI.addMainMenuRoomsList();
    
}, 1000);

// Update Game class to include multiplayer methods
if (window.Game) {
    // Add multiplayer methods to Game prototype
    Game.prototype.startMultiplayerGame = function() {
        this.isMultiplayer = true;
        this.startGame();
        document.getElementById('multiplayer-menu').classList.add('hidden');
    };
    
    Game.prototype.spawnSyncedObject = function(objectData) {
        // Only spawn if we're not the host (host spawns for everyone)
        if (!this.multiplayerManager.isHost) {
            const obj = new FallingObject(objectData.x, objectData.y, objectData.type);
            this.fallingObjects.push(obj);
        }
    };
}

// Override the window load event to use the new multiplayer manager
const originalLoad = window.onload;
window.addEventListener('load', () => {
    if (originalLoad) originalLoad();
    
    // Create game instance globally
    window.game = new Game();
    
    // Replace the old multiplayer manager with the new one
    if (window.game.multiplayerManager) {
        window.game.multiplayerManager = new FirebaseMultiplayer();
        window.game.multiplayerManager.init(window.game);
        MultiplayerUI.createMultiplayerMenu();
        MultiplayerUI.addMultiplayerStyles();
    }
});

// Add methods to handle multiplayer in game update
const originalSpawnObject = Game.prototype.spawnObject;
Game.prototype.spawnObject = function() {
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

// Add multiplayer state updates
const originalOnCatch = Game.prototype.onCatch;
Game.prototype.onCatch = function(obj) {
    originalOnCatch.call(this, obj);
    
    // Update multiplayer state
    if (this.isMultiplayer && this.multiplayerManager) {
        this.multiplayerManager.updatePlayerState({
            score: this.score,
            catches: this.catches,
            streak: this.catchStreak,
            position: { x: this.ship.x, y: this.ship.y }
        });
    }
};

// Handle game over in multiplayer
const originalGameOver = Game.prototype.gameOver;
Game.prototype.gameOver = function() {
    originalGameOver.call(this);
    
    // If multiplayer, update final state
    if (this.isMultiplayer && this.multiplayerManager) {
        this.multiplayerManager.updatePlayerState({
            score: this.score,
            catches: this.catches,
            streak: 0,
            gameOver: true
        });
        
        // If all players are game over, end the multiplayer session
        if (this.multiplayerManager.isHost) {
            setTimeout(() => {
                this.multiplayerManager.roomRef.update({
                    gameState: 'gameover'
                });
            }, 3000);
        }
    }
};
