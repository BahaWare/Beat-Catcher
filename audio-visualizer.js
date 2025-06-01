class AudioVisualizer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.dataArray = null;
        this.bufferLength = null;
        this.isPlaying = false;
        this.beatThreshold = 0.8;
        this.lastBeatTime = 0;
        this.beatCallbacks = [];
        this.bassFrequencies = [];
        this.midFrequencies = [];
        this.highFrequencies = [];
        this.currentTempo = 120;
        this.isSadMusic = false;
        this.rhythmPattern = [];
        this.loopLength = 16; // 16 beat loop
        this.currentBeat = 0;
        this.scheduledNotes = {};
        this.rhythmInterval = null;
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            
            // Initialize rhythm pattern array
            for (let i = 0; i < this.loopLength; i++) {
                this.scheduledNotes[i] = [];
            }
            
            // Don't start rhythm pattern automatically
            
            return true;
        } catch (error) {
            console.error('Failed to initialize audio:', error);
            return false;
        }
    }

    startRhythm() {
        if (this.rhythmInterval) {
            return; // Already playing
        }
        
        let beatCount = 0;
        
        // Create rhythm by modulating gain
        this.rhythmInterval = setInterval(() => {
            const time = this.audioContext.currentTime;
            const beatInterval = 60 / this.currentTempo;
            
            // Update current beat position in loop
            this.currentBeat = beatCount % this.loopLength;
            
            // Play scheduled notes for this beat
            const notesToPlay = this.scheduledNotes[this.currentBeat];
            if (notesToPlay && notesToPlay.length > 0) {
                notesToPlay.forEach(note => {
                    this.playScheduledNote(note.type, time);
                });
            } else {
                // Play a soft metronome click on empty beats
                this.playMetronomeClick(time);
            }
            
            beatCount++;
        }, (60 / this.currentTempo) * 250); // Quarter of the beat interval
        
        this.isPlaying = true;
    }

    stopRhythm() {
        if (this.rhythmInterval) {
            clearInterval(this.rhythmInterval);
            this.rhythmInterval = null;
        }
        
        // Clear rhythm pattern
        for (let i = 0; i < this.loopLength; i++) {
            this.scheduledNotes[i] = [];
        }
        
        this.isPlaying = false;
    }

    playMetronomeClick(time) {
        if (!this.isPlaying) return;
        
        // Create a soft click sound
        const clickOsc = this.audioContext.createOscillator();
        const clickGain = this.audioContext.createGain();
        const clickFilter = this.audioContext.createBiquadFilter();
        
        // Connect nodes
        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.audioContext.destination);
        
        // Configure the click sound
        clickOsc.type = 'sine';
        clickOsc.frequency.setValueAtTime(1000, time); // High frequency for tick sound
        
        // Filter to make it softer
        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(1000, time);
        clickFilter.Q.setValueAtTime(10, time);
        
        // Very short envelope for a click
        clickGain.gain.setValueAtTime(0, time);
        clickGain.gain.linearRampToValueAtTime(0.1, time + 0.001); // Very soft volume
        clickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.01);
        
        // Start and stop
        clickOsc.start(time);
        clickOsc.stop(time + 0.01);
    }

    setTempo(bpm) {
        this.currentTempo = Math.max(60, Math.min(bpm, 200));
    }

    playNote(type) {
        if (!this.isPlaying) return;
        
        // Add note to the rhythm pattern at the next available beat
        const nextBeat = (this.currentBeat + 2) % this.loopLength; // Add slight delay
        
        // Check if this type already exists in this beat
        const existingNote = this.scheduledNotes[nextBeat].find(n => n.type === type);
        if (!existingNote) {
            this.scheduledNotes[nextBeat].push({ type, addedAt: Date.now() });
            
            // Limit notes per beat
            if (this.scheduledNotes[nextBeat].length > 3) {
                this.scheduledNotes[nextBeat].shift();
            }
        }
        
        // Also play immediately for instant feedback
        this.playScheduledNote(type, this.audioContext.currentTime);
    }

    playScheduledNote(type, time) {
        if (!this.isPlaying) return;
        
        // Create different instruments for each object type
        if (type === 'note') {
            // Musical note - kick drum
            const kickOsc = this.audioContext.createOscillator();
            const kickGain = this.audioContext.createGain();
            
            kickOsc.connect(kickGain);
            kickGain.connect(this.audioContext.destination);
            
            kickOsc.type = 'sine';
            kickOsc.frequency.setValueAtTime(60, time);
            kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.1);
            
            kickGain.gain.setValueAtTime(0.5, time);
            kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
            
            kickOsc.start(time);
            kickOsc.stop(time + 0.2);
            
        } else if (type === 'star') {
            // Star - hi-hat
            const noise = this.createNoise();
            const noiseGain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.audioContext.destination);
            
            filter.type = 'highpass';
            filter.frequency.setValueAtTime(8000, time);
            
            noiseGain.gain.setValueAtTime(0.2, time);
            noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
            
            noise.start(time);
            noise.stop(time + 0.05);
            
        } else if (type === 'diamond') {
            // Diamond - snare
            const snareOsc = this.audioContext.createOscillator();
            const snareNoise = this.createNoise();
            const snareGain = this.audioContext.createGain();
            const snareFilter = this.audioContext.createBiquadFilter();
            
            snareOsc.connect(snareGain);
            snareNoise.connect(snareFilter);
            snareFilter.connect(snareGain);
            snareGain.connect(this.audioContext.destination);
            
            snareOsc.type = 'triangle';
            snareOsc.frequency.setValueAtTime(200, time);
            
            snareFilter.type = 'bandpass';
            snareFilter.frequency.setValueAtTime(3000, time);
            
            snareGain.gain.setValueAtTime(0.3, time);
            snareGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            
            snareOsc.start(time);
            snareOsc.stop(time + 0.1);
            snareNoise.start(time);
            snareNoise.stop(time + 0.1);
        }
    }

    createNoise() {
        const bufferSize = this.audioContext.sampleRate * 0.1;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        return noise;
    }

    playSadMusic() {
        this.isSadMusic = true;
        this.currentTempo = 60; // Slow tempo for sad music
        
        // Clear rhythm pattern
        for (let i = 0; i < this.loopLength; i++) {
            this.scheduledNotes[i] = [];
        }
        
        // Change to minor key
        const time = this.audioContext.currentTime;
        
        // Play a sad chord progression
        const sadNotes = [
            { freq: 110, delay: 0 },      // A2
            { freq: 130.81, delay: 0.2 }, // C3
            { freq: 146.83, delay: 0.4 }, // D3
            { freq: 110, delay: 0.6 }     // Back to A2
        ];
        
        sadNotes.forEach(note => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(note.freq, time + note.delay);
            gain.gain.setValueAtTime(0.15, time + note.delay);
            gain.gain.exponentialRampToValueAtTime(0.01, time + note.delay + 1);
            
            osc.start(time + note.delay);
            osc.stop(time + note.delay + 1);
        });
    }

    triggerBeat(type) {
        const currentTime = Date.now();
        if (currentTime - this.lastBeatTime > 100) { // Debounce beats
            this.lastBeatTime = currentTime;
            this.beatCallbacks.forEach(callback => callback(type));
        }
    }

    onBeat(callback) {
        this.beatCallbacks.push(callback);
    }

    getFrequencyData() {
        if (!this.analyser) return null;
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Divide frequency data into bands
        const bassEnd = Math.floor(this.bufferLength * 0.1);
        const midEnd = Math.floor(this.bufferLength * 0.5);
        
        this.bassFrequencies = Array.from(this.dataArray.slice(0, bassEnd));
        this.midFrequencies = Array.from(this.dataArray.slice(bassEnd, midEnd));
        this.highFrequencies = Array.from(this.dataArray.slice(midEnd));
        
        return {
            bass: this.getAverageFrequency(this.bassFrequencies),
            mid: this.getAverageFrequency(this.midFrequencies),
            high: this.getAverageFrequency(this.highFrequencies),
            raw: this.dataArray
        };
    }

    getAverageFrequency(frequencies) {
        const sum = frequencies.reduce((a, b) => a + b, 0);
        return sum / frequencies.length / 255; // Normalize to 0-1
    }

    setVolume(volume) {
        // Volume control implementation
    }

    pause() {
        if (this.audioContext && this.audioContext.state === 'running') {
            this.audioContext.suspend();
        }
        this.stopRhythm();
    }

    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.isSadMusic = false;
        
        // Clear rhythm pattern for fresh start
        for (let i = 0; i < this.loopLength; i++) {
            this.scheduledNotes[i] = [];
        }
        
        // Start rhythm when resuming
        this.startRhythm();
    }

    destroy() {
        this.stopRhythm();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
    }
}
