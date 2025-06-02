// Enhanced Firebase Multiplayer Manager for Beat Catcher
class FirebaseMultiplayer {
    constructor() {
        this.database = null;
        this.roomRef = null;
        this.playerId = null;
        this.playerName = localStorage.getItem('playerName') || 'Player' + Math.floor(Math.random() * 9999);
        this.currentRoom = null;
        this.isHost = false;
        this.otherPlayers = {};
        this.gameInstance = null;
        this.activeRoomsListener = null;
        this.sharedObjects = {};
        this.objectSyncTimer = null;
        
        // Firebase configuration - Replace with your own config
        this.firebaseConfig = {
        apiKey: "AIzaSyCK2Un27_VcuqOm-EiCmrabD7K84DZMkFY",
        authDomain: "beatcatcher-1ae8f.firebaseapp.com",
        databaseURL: "https://beatcatcher-1ae8f-default-rtdb.firebaseio.com",Add commentMore actions
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
        
        // Start listening to active rooms
        this.listenToActiveRooms();
    }
    
    setPlayerName(name) {
        this.playerName = name;
        localStorage.setItem('playerName', name);
        
        // Update name in current room if in one
        if (this.roomRef && this.playerId) {
            this.roomRef.child('players').child(this.playerId).update({
                name: this.playerName
            });
        }
    }
    
    setupDisconnectHandlers() {
        // Remove player when they disconnect
        firebase.database().ref('.info/connected').on('value', (snapshot) => {
            if (snapshot.val() === false) {
                return;
            }
            
            if (this.roomRef && this.playerId) {
                this.roomRef.child('players').child(this.playerId).onDisconnect().remove();
                
                // Update player count
                this.roomRef.child('playerCount').onDisconnect().transaction(count => {
                    return (count || 0) - 1;
                });
                
                // If host disconnects, remove the room
                if (this.isHost) {
                    this.roomRef.onDisconnect().remove();
                    this.database.ref('activeRooms/' + this.currentRoom).onDisconnect().remove();
                }
            }
        });
    }
    
    listenToActiveRooms() {
        this.activeRoomsListener = this.database.ref('activeRooms');
        this.activeRoomsListener.on('value', (snapshot) => {
            const rooms = snapshot.val() || {};
            this.updateActiveRoomsList(rooms);
        });
    }
    
    updateActiveRoomsList(rooms) {
        const activeRoomsList = document.getElementById('active-rooms-list');
        if (!activeRoomsList) return;
        
        // Clear existing rooms
        activeRoomsList.innerHTML = '';
        
        const roomKeys = Object.keys(rooms);
        
        if (roomKeys.length === 0) {
            activeRoomsList.innerHTML = '<p class="no-rooms">No active rooms</p>';
            return;
        }
        
        roomKeys.forEach(roomId => {
            const room = rooms[roomId];
            const roomElement = document.createElement('div');
            roomElement.className = 'room-preview';
            roomElement.innerHTML = `
                <div class="room-info">
                    <strong>Room: ${roomId}</strong>
                    <span>Players: ${room.playerCount || 0}/4</span>
                    <span class="room-status">${room.gameState || 'waiting'}</span>
                </div>
            `;
            
            roomElement.addEventListener('click', () => {
                if (window.quickJoinRoom) {
                    window.quickJoinRoom(roomId);
                }
            });
            
            activeRoomsList.appendChild(roomElement);
        });
    }
    
    quickJoinRoom(roomId) {
        document.getElementById('room-code-input').value = roomId;
        this.joinRoom(roomId);
    }
    
    createRoom() {
        const roomId = this.generateRoomCode();
        this.currentRoom = roomId;
        this.isHost = true;
        
        this.roomRef = this.database.ref('rooms/' + roomId);
        
        // Set room data
        this.roomRef.set({
            host: this.playerId,
            hostName: this.playerName,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            gameState: 'waiting',
            settings: {
                maxPlayers: 4,
                gameMode: 'coop'
            },
            playerCount: 0,
            sharedObjects: {},
            gameSync: {
                level: 1,
                globalScore: 0,
                startTime: null
            }
        });
        
        // Add to active rooms list
        this.database.ref('activeRooms/' + roomId).set({
            hostName: this.playerName,
            playerCount: 1,
            maxPlayers: 4,
            gameState: 'waiting',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Join the room
        this.joinRoomAsPlayer();
        
        // Listen for players
        this.listenToPlayers();
        
        // Listen for game state changes
        this.listenToGameState();
        
        // Listen for shared objects
        this.listenToSharedObjects();
        
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
            
            // Check if game is already in progress
            if (roomData.gameState === 'playing') {
                this.showNotification('Game already in progress!', 'warning');
                return;
            }
            
            // Join the room
            this.joinRoomAsPlayer();
            
            // Listen for players
            this.listenToPlayers();
            
            // Listen for game state changes
            this.listenToGameState();
            
            // Listen for shared objects
            this.listenToSharedObjects();
            
            // Show room UI
            document.getElementById('room-lobby').classList.remove('hidden');
            document.querySelector('.multiplayer-content').style.display = 'none';
            
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
            isAlive: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Update player count
        this.roomRef.child('playerCount').transaction(count => {
            return (count || 0) + 1;
        });
        
        // Update active rooms player count
        if (this.currentRoom) {
            this.database.ref('activeRooms/' + this.currentRoom + '/playerCount').transaction(count => {
                return (count || 0) + 1;
            });
        }
        
        // Remove player on disconnect
        playerRef.onDisconnect().remove();
    }
    
    listenToPlayers() {
        this.roomRef.child('players').on('value', (snapshot) => {
            const players = snapshot.val() || {};
            
            // Clear other players first
            this.otherPlayers = {};
            
            // Update other players
            Object.keys(players).forEach(playerId => {
                if (playerId !== this.playerId) {
                    const player = players[playerId];
                    this.otherPlayers[playerId] = {
                        name: player.name,
                        x: player.position ? player.position.x : 400,
                        y: player.position ? player.position.y : 500,
                        score: player.score || 0,
                        catches: player.catches || 0,
                        streak: player.streak || 0,
                        ready: player.ready || false,
                        isAlive: player.isAlive !== false,
                        skinType: player.skinType || 'default'
                    };
                }
            });
            
            // Check if we're the host
            this.roomRef.child('host').once('value', (hostSnapshot) => {
                this.isHost = hostSnapshot.val() === this.playerId;
                
                // Show/hide start button for host
                const startBtn = document.getElementById('start-game-btn');
                if (startBtn) {
                    if (this.isHost) {
                        startBtn.classList.remove('hidden');
                    } else {
                        startBtn.classList.add('hidden');
                    }
                }
            });
            
            // Update UI
            this.updateMultiplayerUI();
        });
        
        // Listen for player disconnections
        this.roomRef.child('players').on('child_removed', (snapshot) => {
            const removedPlayer = snapshot.val();
            if (removedPlayer) {
                this.showNotification(`${removedPlayer.name} left the room`, 'info');
            }
        });
        
        // Listen for new players
        this.roomRef.child('players').on('child_added', (snapshot) => {
            if (snapshot.key !== this.playerId) {
                const newPlayer = snapshot.val();
                if (newPlayer) {
                    this.showNotification(`${newPlayer.name} joined the room`, 'info');
                }
            }
        });
    }
    
    listenToGameState() {
        this.roomRef.child('gameState').on('value', (snapshot) => {
            const gameState = snapshot.val();
            
            if (gameState === 'playing' && this.gameInstance.gameState !== 'playing') {
                // Start game for all players
                this.startMultiplayerGame();
            } else if (gameState === 'gameover') {
                // Show final scores
                this.showFinalScores();
            }
        });
        
        // Listen for game sync data
        this.roomRef.child('gameSync').on('value', (snapshot) => {
            const syncData = snapshot.val();
            if (syncData && this.gameInstance.isMultiplayer) {
                // Sync level and global score
                if (syncData.level && syncData.level !== this.gameInstance.level) {
                    this.gameInstance.level = syncData.level;
                    this.gameInstance.updateUI();
                }
            }
        });
    }
    
    listenToSharedObjects() {
        this.roomRef.child('sharedObjects').on('child_added', (snapshot) => {
            const objData = snapshot.val();
            const objId = snapshot.key;
            
            if (objData && !this.sharedObjects[objId]) {
                // Create shared object in game
                this.createSharedObject(objId, objData);
            }
        });
        
        this.roomRef.child('sharedObjects').on('child_changed', (snapshot) => {
            const objData = snapshot.val();
            const objId = snapshot.key;
            
            if (objData && objData.caughtBy && objData.caughtBy !== this.playerId) {
                // Object was caught by another player, remove it locally
                this.removeSharedObject(objId);
            }
        });
        
        this.roomRef.child('sharedObjects').on('child_removed', (snapshot) => {
            const objId = snapshot.key;
            this.removeSharedObject(objId);
        });
    }
    
    createSharedObject(objId, objData) {
        if (!this.gameInstance || this.gameInstance.gameState !== 'playing') return;
        
        // Create falling object with shared ID
        const obj = new FallingObject(objData.x, objData.y, objData.type);
        obj.sharedId = objId;
        obj.isShared = true;
        
        // Add to game's falling objects
        this.gameInstance.fallingObjects.push(obj);
        this.sharedObjects[objId] = obj;
    }
    
    removeSharedObject(objId) {
        if (this.sharedObjects[objId]) {
            // Remove from game's falling objects array
            const index = this.gameInstance.fallingObjects.indexOf(this.sharedObjects[objId]);
            if (index > -1) {
                this.gameInstance.fallingObjects.splice(index, 1);
            }
            delete this.sharedObjects[objId];
        }
    }
    
    broadcastSharedObject(objectData) {
        if (!this.isHost || !this.roomRef) return;
        
        const objId = 'obj_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        this.roomRef.child('sharedObjects').child(objId).set({
            ...objectData,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            caughtBy: null
        });
        
        return objId;
    }
    
    markObjectAsCaught(objId, playerId) {
        if (!this.roomRef || !objId) return;
        
        this.roomRef.child('sharedObjects').child(objId).update({
            caughtBy: playerId,
            caughtAt: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Remove object after short delay to allow sync
        setTimeout(() => {
            this.roomRef.child('sharedObjects').child(objId).remove();
        }, 100);
    }
    
    startMultiplayerGame() {
        this.gameInstance.isMultiplayer = true;
        this.gameInstance.startGame();
        document.getElementById('multiplayer-menu').classList.add('hidden');
        
        // Start object synchronization if host
        if (this.isHost) {
            this.startObjectSync();
        }
    }
    
    startObjectSync() {
        // Clear any existing timer
        if (this.objectSyncTimer) {
            clearInterval(this.objectSyncTimer);
        }
        
        // Sync object spawning every few seconds
        this.objectSyncTimer = setInterval(() => {
            if (this.gameInstance.gameState === 'playing') {
                this.spawnSyncedObjects();
            }
        }, 2000); // Spawn objects every 2 seconds
    }
    
    spawnSyncedObjects() {
        if (!this.isHost || !this.gameInstance) return;
        
        const types = ['note', 'star', 'diamond'];
        const numObjects = Math.min(2 + Math.floor(this.gameInstance.level / 3), 4); // More objects at higher levels
        
        for (let i = 0; i < numObjects; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const x = Math.random() * (this.gameInstance.width - 200) + 100;
            
            this.broadcastSharedObject({
                x: x,
                y: -50,
                type: type
            });
        }
    }
    
    updatePlayerState(data) {
        if (!this.roomRef || !this.playerId) return;
        
        // Add skin type to the data
        if (this.gameInstance && this.gameInstance.skinManager) {
            data.skinType = this.gameInstance.skinManager.currentSkin;
        }
        
        this.roomRef.child('players').child(this.playerId).update(data);
    }
    
    updateGlobalGameState(data) {
        if (!this.isHost || !this.roomRef) return;
        
        this.roomRef.child('gameSync').update(data);
    }
    
    startGame() {
        if (!this.isHost) {
            this.showNotification('Only the host can start the game!', 'error');
            return;
        }
        
        // Check if all players are ready
        this.roomRef.child('players').once('value').then((snapshot) => {
            const players = snapshot.val() || {};
            const playerList = Object.values(players);
            
            if (playerList.length < 2) {
                this.showNotification('Need at least 2 players to start!', 'warning');
                return;
            }
            
            const allReady = playerList.every(player => player.ready);
            
            if (!allReady) {
                this.showNotification('Not all players are ready!', 'warning');
                return;
            }
            
            // Start the game
            this.roomRef.update({
                gameState: 'playing',
                startTime: firebase.database.ServerValue.TIMESTAMP
            });
            
            // Update active rooms
            this.database.ref('activeRooms/' + this.currentRoom).update({
                gameState: 'playing'
            });
        });
    }
    
    setReady(ready) {
        this.updatePlayerState({ ready: ready });
    }
    
    leaveRoom() {
        // Clear object sync timer
        if (this.objectSyncTimer) {
            clearInterval(this.objectSyncTimer);
            this.objectSyncTimer = null;
        }
        
        if (this.roomRef && this.playerId) {
            this.roomRef.child('players').child(this.playerId).remove();
            
            // Update player counts
            this.roomRef.child('playerCount').transaction(count => {
                return Math.max(0, (count || 0) - 1);
            });
            
            if (this.currentRoom) {
                this.database.ref('activeRooms/' + this.currentRoom + '/playerCount').transaction(count => {
                    return Math.max(0, (count || 0) - 1);
                });
            }
            
            if (this.isHost) {
                // If host leaves, delete the room
                this.roomRef.remove();
                this.database.ref('activeRooms/' + this.currentRoom).remove();
            }
        }
        
        this.roomRef = null;
        this.currentRoom = null;
        this.isHost = false;
        this.otherPlayers = {};
        this.sharedObjects = {};
        this.gameInstance.isMultiplayer = false;
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
        
        // Get current player data
        this.roomRef.child('players').child(this.playerId).once('value', (snapshot) => {
            const myData = snapshot.val();
            
            // Add current player
            const currentPlayerDiv = document.createElement('div');
            currentPlayerDiv.className = 'player-item current-player';
            currentPlayerDiv.innerHTML = `
                <span class="player-name">${this.playerName} (You)</span>
                <span class="player-status">
                    ${myData && myData.ready ? '<span class="ready-badge">READY</span>' : '<span class="not-ready-badge">NOT READY</span>'}
                </span>
                <span class="player-score">Score: ${myData ? myData.score || 0 : 0}</span>
            `;
            playersList.appendChild(currentPlayerDiv);
            
            // Add other players
            Object.entries(this.otherPlayers).forEach(([playerId, player]) => {
                const playerDiv = document.createElement('div');
                playerDiv.className = 'player-item';
                playerDiv.innerHTML = `
                    <span class="player-name">${player.name}</span>
                    <span class="player-status">
                        ${player.ready ? '<span class="ready-badge">READY</span>' : '<span class="not-ready-badge">NOT READY</span>'}
                    </span>
                    <span class="player-score">Score: ${player.score}</span>
                `;
                playersList.appendChild(playerDiv);
            });
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
                        <span class="catches">${player.catches} catches</span>
                    </div>
                `).join('')}
            </div>
            <button class="neon-button" onclick="game.multiplayerManager.leaveRoom(); document.getElementById('game-over-screen').classList.add('hidden'); document.getElementById('start-screen').classList.remove('hidden');">Leave Room</button>
        `;
        
        document.getElementById('game-over-screen').appendChild(leaderboardDiv);
    }
}

// Enhanced Multiplayer UI Component
class MultiplayerUI {
    static createMultiplayerMenu() {
        // Menu is already created in HTML
    }
    
    static addMultiplayerStyles() {
        // Styles are already in CSS files
    }
}
