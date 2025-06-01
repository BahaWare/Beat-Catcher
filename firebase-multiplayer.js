// Firebase Multiplayer Manager for Beat Catcher
class FirebaseMultiplayer {
    constructor() {
        this.database = null;
        this.roomRef = null;
        this.playerId = null;
        this.playerName = 'Player' + Math.floor(Math.random() * 9999);
        this.currentRoom = null;
        this.isHost = false;
        this.otherPlayers = {};
        this.gameInstance = null;
        
        // Firebase configuration - Replace with your own config
        this.firebaseConfig = {
        apiKey: "AIzaSyCK2Un27_VcuqOm-EiCmrabD7K84DZMkFY",
        authDomain: "beatcatcher-1ae8f.firebaseapp.com",
        databaseURL: "https://beatcatcher-1ae8f-default-rtdb.firebaseio.com",
        projectId: "beatcatcher-1ae8f",
        storageBucket: "beatcatcher-1ae8f.firebasestorage.app",
        messagingSenderId: "246141825582",
        appId: "1:246141825582:web:b1fee7077ee020de32a5bf",
        measurementId: "G-92S4DY76H4"
        };
    }
    
    init(gameInstance) {
        this.gameInstance = gameInstance;
        
        // Initialize Firebase
        if (!firebase.apps.length) {
            firebase.initializeApp(this.firebaseConfig);
        }
        
        this.database = firebase.database();
        this.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Clean up on disconnect
        this.setupDisconnectHandlers();
    }
    
    setupDisconnectHandlers() {
        // Remove player when they disconnect
        firebase.database().ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }
            
            if (this.roomRef && this.playerId) {
                this.roomRef.child('players').child(this.playerId).onDisconnect().remove();
                
                // If host disconnects, assign new host
                if (this.isHost) {
                    this.roomRef.child('host').onDisconnect().set(null);
                }
            }
        });
    }
    
    createRoom() {
        const roomId = this.generateRoomCode();
        this.currentRoom = roomId;
        this.isHost = true;
        
        this.roomRef = this.database.ref('rooms/' + roomId);
        
        // Set room data
        this.roomRef.set({
            host: this.playerId,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            gameState: 'waiting',
            settings: {
                maxPlayers: 4,
                gameMode: 'coop'
            }
        });
        
        // Join the room
        this.joinRoomAsPlayer();
        
        // Listen for players
        this.listenToPlayers();
        
        // Listen for game state changes
        this.listenToGameState();
        
        return roomId;
    }
    
    joinRoom(roomId) {
        this.currentRoom = roomId;
        this.roomRef = this.database.ref('rooms/' + roomId);
        
        // Check if room exists
        this.roomRef.once('value').then((snapshot) => {
            if (!snapshot.exists()) {
                this.showNotification('Room not found!', 'error');
                return;
            }
            
            const roomData = snapshot.val();
            const playerCount = Object.keys(roomData.players || {}).length;
            
            if (playerCount >= roomData.settings.maxPlayers) {
                this.showNotification('Room is full!', 'error');
                return;
            }
            
            // Join the room
            this.joinRoomAsPlayer();
            
            // Listen for players
            this.listenToPlayers();
            
            // Listen for game state changes
            this.listenToGameState();
            
            this.showNotification('Joined room successfully!', 'success');
        });
    }
    
    joinRoomAsPlayer() {
        const playerRef = this.roomRef.child('players').child(this.playerId);
        
        playerRef.set({
            name: this.playerName,
            score: 0,
            catches: 0,
            streak: 0,
            position: { x: 400, y: 500 },
            skinType: this.gameInstance?.skinManager?.currentSkin || 'default',
            ready: false,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Remove player on disconnect
        playerRef.onDisconnect().remove();
    }
    
    listenToPlayers() {
        this.roomRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val() || {};
            
            // Update other players
            Object.keys(players).forEach(playerId => {
                if (playerId !== this.playerId) {
                    if (!this.otherPlayers[playerId]) {
                        // New player joined
                        this.otherPlayers[playerId] = players[playerId];
                        this.showNotification(`${players[playerId].name} joined!`, 'info');
                    } else {
                        // Update existing player
                        this.otherPlayers[playerId] = players[playerId];
                    }
                }
            });
            
            // Remove disconnected players
            Object.keys(this.otherPlayers).forEach(playerId => {
                if (!players[playerId]) {
                    this.showNotification(`${this.otherPlayers[playerId].name} left!`, 'info');
                    delete this.otherPlayers[playerId];
                }
            });
            
            // Update UI
            this.updateMultiplayerUI();
        });
    }
    
    listenToGameState() {
        this.roomRef.child('gameState').on('value', (snapshot) => {
            const gameState = snapshot.val();
            
            if (gameState === 'playing' && this.gameInstance.gameState !== 'playing') {
                // Start game for all players
                this.gameInstance.startMultiplayerGame();
            } else if (gameState === 'gameover') {
                // Show final scores
                this.showFinalScores();
            }
        });
        
        // Listen for falling objects (host broadcasts)
        if (!this.isHost) {
            this.roomRef.child('fallingObjects').on('child_added', (snapshot) => {
                const objData = snapshot.val();
                this.gameInstance.spawnSyncedObject(objData);
            });
        }
    }
    
    updatePlayerState(data) {
        if (!this.roomRef || !this.playerId) return;
        
        this.roomRef.child('players').child(this.playerId).update(data);
    }
    
    broadcastFallingObject(objectData) {
        if (!this.isHost || !this.roomRef) return;
        
        this.roomRef.child('fallingObjects').push({
            ...objectData,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }
    
    startGame() {
        if (!this.isHost) {
            this.showNotification('Only the host can start the game!', 'error');
            return;
        }
        
        // Check if all players are ready
        this.roomRef.child('players').once('value').then((snapshot) => {
            const players = snapshot.val() || {};
            const allReady = Object.values(players).every(player => player.ready);
            
            if (!allReady) {
                this.showNotification('Not all players are ready!', 'warning');
                return;
            }
            
            // Start the game
            this.roomRef.update({
                gameState: 'playing',
                startTime: firebase.database.ServerValue.TIMESTAMP
            });
        });
    }
    
    setReady(ready) {
        this.updatePlayerState({ ready: ready });
    }
    
    leaveRoom() {
        if (this.roomRef && this.playerId) {
            this.roomRef.child('players').child(this.playerId).remove();
            
            if (this.isHost) {
                // If host leaves, delete the room
                this.roomRef.remove();
            }
        }
        
        this.roomRef = null;
        this.currentRoom = null;
        this.isHost = false;
        this.otherPlayers = {};
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    updateMultiplayerUI() {
        // Update the multiplayer UI elements
        const playersList = document.getElementById('players-list');
        if (!playersList) return;
        
        playersList.innerHTML = '';
        
        // Add current player
        const currentPlayerDiv = document.createElement('div');
        currentPlayerDiv.className = 'player-item current-player';
        currentPlayerDiv.innerHTML = `
            <span class="player-name">${this.playerName} (You)</span>
            <span class="player-score">Score: ${this.gameInstance?.score || 0}</span>
        `;
        playersList.appendChild(currentPlayerDiv);
        
        // Add other players
        Object.entries(this.otherPlayers).forEach(([playerId, player]) => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-item';
            playerDiv.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-score">Score: ${player.score}</span>
                ${player.ready ? '<span class="ready-badge">READY</span>' : ''}
            `;
            playersList.appendChild(playerDiv);
        });
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.appendChild(notification);
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }
    
    showFinalScores() {
        // Collect all scores
        this.roomRef.child('players').once('value').then((snapshot) => {
            const players = snapshot.val() || {};
            const scores = Object.entries(players).map(([id, player]) => ({
                name: player.name,
                score: player.score,
                catches: player.catches,
                isYou: id === this.playerId
            }));
            
            // Sort by score
            scores.sort((a, b) => b.score - a.score);
            
            // Display scores
            this.displayLeaderboard(scores);
        });
    }
    
    displayLeaderboard(scores) {
        const leaderboardDiv = document.createElement('div');
        leaderboardDiv.className = 'multiplayer-leaderboard';
        leaderboardDiv.innerHTML = `
            <h3>Final Scores</h3>
            <div class="scores-list">
                ${scores.map((player, index) => `
                    <div class="score-item ${player.isYou ? 'current-player' : ''}">
                        <span class="rank">#${index + 1}</span>
                        <span class="name">${player.name}</span>
                        <span class="score">${player.score}</span>
                    </div>
                `).join('')}
            </div>
            <button class="neon-button" onclick="game.multiplayerManager.leaveRoom()">Leave Room</button>
        `;
        
        document.getElementById('game-over-screen').appendChild(leaderboardDiv);
    }
}

// Multiplayer UI Component
class MultiplayerUI {
    static createMultiplayerMenu() {
        const menuHTML = `
            <div id="multiplayer-menu" class="screen hidden">
                <h2 class="game-title">MULTIPLAYER</h2>
                <p class="game-subtitle">Play with friends online!</p>
                
                <div class="multiplayer-options">
                    <div class="create-room-section">
                        <button id="create-room-btn" class="neon-button">CREATE ROOM</button>
                        <div id="room-code-display" class="hidden">
                            <p>Room Code:</p>
                            <h3 id="room-code" class="room-code"></h3>
                            <button id="copy-code-btn" class="neon-button small">Copy Code</button>
                        </div>
                    </div>
                    
                    <div class="join-room-section">
                        <input type="text" id="room-code-input" placeholder="Enter Room Code" maxlength="6" class="room-input">
                        <button id="join-room-btn" class="neon-button">JOIN ROOM</button>
                    </div>
                    
                    <div id="room-lobby" class="hidden">
                        <h3>Players in Room</h3>
                        <div id="players-list" class="players-list"></div>
                        <div class="lobby-controls">
                            <button id="ready-btn" class="neon-button">READY</button>
                            <button id="start-game-btn" class="neon-button hidden">START GAME</button>
                            <button id="leave-room-btn" class="neon-button">LEAVE ROOM</button>
                        </div>
                    </div>
                </div>
                
                <button id="back-from-multiplayer-btn" class="neon-button" style="margin-top: 30px;">BACK TO MENU</button>
            </div>
        `;
        
        // Add to game container
        const gameContainer = document.getElementById('game-container');
        gameContainer.insertAdjacentHTML('beforeend', menuHTML);
    }
    
    static addMultiplayerStyles() {
        const styles = `
            <style>
                .multiplayer-options {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    align-items: center;
                    margin-top: 30px;
                }
                
                .create-room-section, .join-room-section {
                    text-align: center;
                }
                
                .room-code {
                    font-size: 48px;
                    letter-spacing: 8px;
                    color: #00ffff;
                    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
                    margin: 20px 0;
                }
                
                .room-input {
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    color: #fff;
                    padding: 15px;
                    font-size: 24px;
                    text-align: center;
                    letter-spacing: 4px;
                    text-transform: uppercase;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    width: 300px;
                }
                
                .room-input:focus {
                    outline: none;
                    border-color: #00ffff;
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
                }
                
                #room-lobby {
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                    padding: 30px;
                    width: 400px;
                }
                
                .players-list {
                    margin: 20px 0;
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .player-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin: 5px 0;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 5px;
                }
                
                .player-item.current-player {
                    border: 2px solid #00ffff;
                }
                
                .ready-badge {
                    background: #00ff00;
                    color: #000;
                    padding: 2px 8px;
                    border-radius: 3px;
                    font-size: 12px;
                    font-weight: bold;
                }
                
                .lobby-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .neon-button.small {
                    padding: 10px 20px;
                    font-size: 16px;
                }
                
                .multiplayer-leaderboard {
                    background: rgba(0, 0, 0, 0.8);
                    border: 2px solid #00ffff;
                    border-radius: 10px;
                    padding: 30px;
                    margin-top: 20px;
                }
                
                .scores-list {
                    margin: 20px 0;
                }
                
                .score-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    margin: 5px 0;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 5px;
                }
                
                .score-item.current-player {
                    border: 2px solid #ffff00;
                    background: rgba(255, 255, 0, 0.1);
                }
                
                .rank {
                    font-weight: bold;
                    color: #ff00ff;
                }
                
                /* Other players' ships */
                .other-player-ship {
                    position: absolute;
                    opacity: 0.7;
                    filter: hue-rotate(180deg);
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}
