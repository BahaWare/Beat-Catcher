// Simple multiplayer button fix
document.addEventListener('DOMContentLoaded', function() {
    const multiplayerBtn = document.getElementById('multiplayer-button');
    
    if (multiplayerBtn) {
        multiplayerBtn.onclick = function() {
            try {
                // Simple navigation to multiplayer menu
                document.getElementById('start-screen').classList.add('hidden');
                document.getElementById('multiplayer-menu').classList.remove('hidden');
                console.log('Multiplayer menu opened');
            } catch (error) {
                console.error('Error opening multiplayer:', error);
                alert('Error opening multiplayer menu');
            }
        };
    }
    
    // Back button handler
    const backBtn = document.getElementById('back-from-multiplayer-btn');
    if (backBtn) {
        backBtn.onclick = function() {
            try {
                document.getElementById('multiplayer-menu').classList.add('hidden');
                document.getElementById('start-screen').classList.remove('hidden');
                console.log('Back to main menu');
            } catch (error) {
                console.error('Error going back:', error);
                // Force navigation
                document.getElementById('multiplayer-menu').classList.add('hidden');
                document.getElementById('start-screen').classList.remove('hidden');
            }
        };
    }
    
    console.log('Simple multiplayer fix loaded');
});
