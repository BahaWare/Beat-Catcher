// Multiplayer Event Handlers
document.addEventListener('DOMContentLoaded', function() {
    console.log('Setting up multiplayer handlers...');
    
    // Player name save
    const saveNameBtn = document.getElementById('save-name-btn');
    const playerNameInput = document.getElementById('player-name-input');
    
    if (saveNameBtn && playerNameInput) {
        saveNameBtn.addEventListener('click', function() {
            const name = playerNameInput.value.trim();
            if (name && window.game && window.game.multiplayerManager) {
                window.game.multiplayerManager.setPlayerName(name);
                console.log('Player name set to:', name);
                
                // Show success message
                showNotification('İsminiz "' + name + '" olarak değiştirildi!', 'success');
            }
        });
        
        // Load saved name
        const savedName = localStorage.getItem('playerName');
        if (savedName) {
            playerNameInput.value = savedName;
        }
    }
    
    // Create room button
    const createRoomBtn = document.getElementById('create-room-btn');
    if (createRoomBtn) {
        createRoomBtn.addEventListener('click', function() {
            console.log('Create room clicked');
            if (window.game && window.game.multiplayerManager) {
                const roomCode = window.game.multiplayerManager.createRoom();
                
                // Show room code
                document.getElementById('room-code').textContent = roomCode;
                document.getElementById('room-code-display').classList.remove('hidden');
                document.getElementById('room-lobby').classList.remove('hidden');
                
                // Hide create/join options
                document.querySelector('.multiplayer-content').style.display = 'none';
                
                console.log('Room created:', roomCode);
            } else {
                console.error('Multiplayer manager not available');
                alert('Multiplayer not available. Please refresh the page.');
            }
        });
    }
    
    // Join room button
    const joinRoomBtn = document.getElementById('join-room-btn');
    const roomCodeInput = document.getElementById('room-code-input');
    
    if (joinRoomBtn && roomCodeInput) {
        joinRoomBtn.addEventListener('click', function() {
            const roomCode = roomCodeInput.value.trim().toUpperCase();
            console.log('Join room clicked, code:', roomCode);
            
            if (!roomCode) {
                alert('Please enter a room code');
                return;
            }
            
            if (window.game && window.game.multiplayerManager) {
                window.game.multiplayerManager.joinRoom(roomCode);
                
                // Hide create/join options
                document.querySelector('.multiplayer-content').style.display = 'none';
            } else {
                console.error('Multiplayer manager not available');
                alert('Multiplayer not available. Please refresh the page.');
            }
        });
        
        // Enter key support
        roomCodeInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                joinRoomBtn.click();
            }
        });
    }
    
    // Copy room code button
    const copyCodeBtn = document.getElementById('copy-code-btn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', function() {
            const roomCode = document.getElementById('room-code').textContent;
            navigator.clipboard.writeText(roomCode).then(function() {
                copyCodeBtn.textContent = 'COPIED!';
                setTimeout(() => {
                    copyCodeBtn.textContent = 'Copy Code';
                }, 2000);
            });
        });
    }
    
    // Ready button
    const readyBtn = document.getElementById('ready-btn');
    if (readyBtn) {
        let isReady = false;
        readyBtn.addEventListener('click', function() {
            isReady = !isReady;
            
            if (window.game && window.game.multiplayerManager) {
                window.game.multiplayerManager.setReady(isReady);
                readyBtn.textContent = isReady ? 'NOT READY' : 'READY';
                readyBtn.style.background = isReady ? '#ff0000' : '#00ff00';
            }
        });
    }
    
    // Start game button (host only)
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.addEventListener('click', function() {
            console.log('Start game clicked');
            if (window.game && window.game.multiplayerManager) {
                window.game.multiplayerManager.startGame();
            }
        });
    }
    
    // Leave room button
    const leaveRoomBtn = document.getElementById('leave-room-btn');
    if (leaveRoomBtn) {
        leaveRoomBtn.addEventListener('click', function() {
            console.log('Leave room clicked');
            if (window.game && window.game.multiplayerManager) {
                window.game.multiplayerManager.leaveRoom();
                
                // Reset UI
                document.getElementById('room-code-display').classList.add('hidden');
                document.getElementById('room-lobby').classList.add('hidden');
                document.querySelector('.multiplayer-content').style.display = 'flex';
                
                // Clear room code input
                if (roomCodeInput) {
                    roomCodeInput.value = '';
                }
            }
        });
    }
    
    console.log('Multiplayer handlers setup complete');
});

// Global function for quick join from active rooms
window.quickJoinRoom = function(roomId) {
    console.log('Quick join room:', roomId);
    if (window.game && window.game.multiplayerManager) {
        document.getElementById('room-code-input').value = roomId;
        window.game.multiplayerManager.joinRoom(roomId);
    }
};

// Notification system
function showNotification(message, type = 'info') {
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

console.log('Multiplayer handlers script loaded');
