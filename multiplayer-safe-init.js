// Safe multiplayer initialization to prevent crashes

// Prevent crashes by adding error handling
(function() {
    'use strict';
    
    // Safe Firebase initialization
    function initializeMultiplayerSafely() {
        try {
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                console.warn('Firebase not loaded, multiplayer disabled');
                disableMultiplayerButton();
                return;
            }
            
            // Check if Firebase is configured
            if (!firebase.apps.length) {
                console.warn('Firebase not configured, multiplayer disabled');
                disableMultiplayerButton();
                return;
            }
            
            // Initialize multiplayer manager safely
            if (window.game && window.FirebaseMultiplayer) {
                try {
                    window.game.multiplayerManager = new FirebaseMultiplayer();
                    window.game.multiplayerManager.init(window.game);
                    console.log('Multiplayer initialized successfully');
                } catch (error) {
                    console.error('Error initializing multiplayer:', error);
                    disableMultiplayerButton();
                }
            }
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            disableMultiplayerButton();
        }
    }
    
    function disableMultiplayerButton() {
        const multiplayerBtn = document.getElementById('multiplayer-button');
        if (multiplayerBtn) {
            multiplayerBtn.disabled = true;
            multiplayerBtn.textContent = 'MULTIPLAYER (OFFLINE)';
            multiplayerBtn.style.opacity = '0.5';
            multiplayerBtn.onclick = function() {
                alert('Multiplayer is currently unavailable. Please check your internet connection and Firebase configuration.');
            };
        }
    }
    
    // Safe multiplayer button click handler
    function setupMultiplayerButton() {
        const multiplayerBtn = document.getElementById('multiplayer-button');
        if (multiplayerBtn) {
            multiplayerBtn.onclick = function() {
                try {
                    // Check if multiplayer is available
                    if (!window.game || !window.game.multiplayerManager) {
                        alert('Multiplayer is not available. Please refresh the page and try again.');
                        return;
                    }
                    
                    // Hide start screen and show multiplayer menu
                    document.getElementById('start-screen').classList.add('hidden');
                    document.getElementById('multiplayer-menu').classList.remove('hidden');
                    
                    // Start listening for active rooms
                    if (window.game.multiplayerManager.listenToActiveRooms) {
                        window.game.multiplayerManager.listenToActiveRooms();
                    }
                    
                } catch (error) {
                    console.error('Error opening multiplayer menu:', error);
                    alert('Error opening multiplayer menu. Please refresh the page and try again.');
                }
            };
        }
    }
    
    // Safe DOM ready handler
    function onDOMReady() {
        // Wait for game to be initialized
        if (window.game) {
            initializeMultiplayerSafely();
            setupMultiplayerButton();
        } else {
            // Wait for game initialization
            setTimeout(onDOMReady, 100);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMReady);
    } else {
        onDOMReady();
    }
    
    // Add error handler for uncaught errors
    window.addEventListener('error', function(event) {
        if (event.error && event.error.message && event.error.message.includes('Firebase')) {
            console.error('Firebase error detected:', event.error);
            disableMultiplayerButton();
        }
    });
    
    // Safe back button handler
    document.addEventListener('click', function(e) {
        if (e.target.id === 'back-from-multiplayer-btn') {
            try {
                document.getElementById('multiplayer-menu').classList.add('hidden');
                document.getElementById('start-screen').classList.remove('hidden');
                
                // Clean up multiplayer state
                if (window.game && window.game.multiplayerManager) {
                    if (window.game.multiplayerManager.leaveRoom) {
                        window.game.multiplayerManager.leaveRoom();
                    }
                }
            } catch (error) {
                console.error('Error going back from multiplayer:', error);
                // Force navigation back
                document.getElementById('multiplayer-menu').classList.add('hidden');
                document.getElementById('start-screen').classList.remove('hidden');
            }
        }
    });
    
})();

console.log('Safe multiplayer initialization loaded');
