// Bu kodu game.js dosyasının en sonuna ekleyin (window.addEventListener('load', ...) kısmından sonra)

// Multiplayer button fix
setTimeout(() => {
    const multiplayerBtn = document.getElementById('multiplayer-button');
    if (multiplayerBtn && !multiplayerBtn.hasAttribute('data-listener-added')) {
        multiplayerBtn.setAttribute('data-listener-added', 'true');
        multiplayerBtn.addEventListener('click', () => {
            document.getElementById('start-screen').classList.add('hidden');
            document.getElementById('multiplayer-menu').classList.remove('hidden');
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
            document.getElementById('start-game-btn').classList.remove('hidden');
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
                document.getElementById('room-lobby').classList.remove('hidden');
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
}, 1000);

// Also update the Game class instantiation to make it globally accessible
window.addEventListener('load', () => {
    window.game = new Game();
});
